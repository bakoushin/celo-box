import '../global';
import { getWeb3, getKit } from './web3';
import BoxFactoryContract from '../abi/BoxFactory.json';
import BoxContract from '../abi/Box.json';
import { requestTxSig, waitForSignedTxs } from '@celo/dappkit';
import * as Linking from 'expo-linking';
import { expo } from '../app.json';

const getCurrecyContract = async (currency, kit) => {
  switch (currency.toUpperCase()) {
    case 'CELO':
      return kit.contracts.getGoldToken();
    case 'CUSD':
      return kit.contracts.getStableToken();
    default:
      throw new Error('Currency must be specified');
  }
};

const getCurrencyByAddress = async (address, network) => {
  const web3 = getWeb3(network);
  const kit = getKit(web3);

  const stableToken = await kit.contracts.getStableToken();
  const goldToken = await kit.contracts.getGoldToken();

  const cUSDAddress = stableToken.address;
  const celoAddress = goldToken.address;

  const mapping = {
    [cUSDAddress]: 'cUSD',
    [celoAddress]: 'CELO'
  };

  return mapping[address];
};

const createBoxOnChain = async ({
  network,
  currency,
  goal,
  minimalContribution,
  ownerAddress,
  receiverAddress
}) => {
  const web3 = getWeb3(network);
  const kit = getKit(web3);

  const networkId = await web3.eth.net.getId();
  const deployedNetwork = BoxFactoryContract.networks[networkId];
  const boxFactory = new web3.eth.Contract(
    BoxFactoryContract.abi,
    deployedNetwork.address
  );

  const currencyContract = await getCurrecyContract(currency, kit);

  const txObject = boxFactory.methods.createBox(
    currencyContract.address,
    web3.utils.toWei(goal),
    web3.utils.toWei(minimalContribution),
    receiverAddress
  );

  const requestId = 'create_box';
  const dappName = expo.name;
  const callback = Linking.makeUrl('/my/path');
  requestTxSig(
    kit,
    [
      {
        tx: txObject,
        from: ownerAddress,
        to: boxFactory.options.address,
        feeCurrency: currencyContract.address
      }
    ],
    { requestId, dappName, callback }
  );

  const dappkitResponse = await waitForSignedTxs(requestId);

  return new Promise(async (resolve, reject) => {
    boxFactory.once(
      'BoxCreated',
      {
        filter: { owner: ownerAddress }
      },
      (error, { returnValues }) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(returnValues.box);
      }
    );

    dappkitResponse.rawTxs.forEach((tx) =>
      kit.web3.eth.sendSignedTransaction(tx)
    );
  });
};

const getBoxSummary = async (boxAddress, network) => {
  const web3 = getWeb3(network);

  const box = new web3.eth.Contract(BoxContract.abi, boxAddress);
  const {
    0: active,
    1: complete,
    2: finalized,
    3: tokenAddress,
    4: goal,
    5: minimalContribution,
    6: balance,
    7: contributionsCount,
    8: contributorsCount,
    9: ownerAddress,
    10: receiverAddress
  } = await box.methods.summary().call();
  const currency = await getCurrencyByAddress(tokenAddress, network);
  return {
    active,
    complete,
    finalized,
    tokenAddress,
    currency,
    goal: web3.utils.fromWei(goal).toString(),
    minimalContribution: web3.utils.fromWei(minimalContribution).toString(),
    balance: web3.utils.fromWei(balance).toString(),
    contributionsCount,
    contributorsCount,
    ownerAddress,
    receiverAddress
  };
};

const getContributors = async (boxAddress, network) => {
  const web3 = getWeb3(network);

  const box = new web3.eth.Contract(BoxContract.abi, boxAddress);
  const contributors = await box.methods.getContributors().call();

  const result = [];
  for (const contributor of contributors) {
    const amount = await box.methods.contributions(contributor).call();
    if (Number(amount) === 0) {
      continue;
    }
    result.push({
      contributor,
      amount: web3.utils.fromWei(amount).toString()
    });
  }

  result.sort((a, b) => Number(b.amount) - Number(a.amount));

  return result;
};

const contributeToBox = async ({
  amount,
  currency,
  boxAddress,
  senderAddress,
  network
}) => {
  const web3 = getWeb3(network);
  const kit = getKit(web3);

  // Approval transaction
  const currencyContract = await getCurrecyContract(currency, kit);

  const txObjectIncApproval = currencyContract.approve(
    boxAddress,
    web3.utils.toWei(amount)
  ).txo;

  // Contribution transaction
  const box = new web3.eth.Contract(BoxContract.abi, boxAddress);

  const txObjectContribution = box.methods.contribute(web3.utils.toWei(amount));

  const requestId = 'contribute';
  const dappName = expo.name;
  const callback = Linking.makeUrl('/my/path');
  requestTxSig(
    kit,
    [
      {
        tx: txObjectIncApproval,
        from: senderAddress,
        to: currencyContract.address,
        feeCurrency: currencyContract.address,
        estimatedGas: 200000
      },
      {
        tx: txObjectContribution,
        from: senderAddress,
        to: boxAddress,
        feeCurrency: currencyContract.address,
        estimatedGas: 200000
      }
    ],
    { requestId, dappName, callback }
  );

  const dappkitResponse = await waitForSignedTxs(requestId);

  for (const tx of dappkitResponse.rawTxs) {
    await kit.web3.eth.sendSignedTransaction(tx);
  }
};

const revokeContribution = async ({
  boxAddress,
  contributorAddress,
  network,
  currency
}) => {
  const web3 = getWeb3(network);
  const kit = getKit(web3);

  const box = new web3.eth.Contract(BoxContract.abi, boxAddress);

  const txObject = box.methods.revokeContribution();

  const currencyContract = await getCurrecyContract(currency, kit);

  const requestId = 'revoke_contribution';
  const dappName = expo.name;
  const callback = Linking.makeUrl('/my/path');
  requestTxSig(
    kit,
    [
      {
        tx: txObject,
        from: contributorAddress,
        to: box.options.address,
        feeCurrency: currencyContract.address
      }
    ],
    { requestId, dappName, callback }
  );

  const dappkitResponse = await waitForSignedTxs(requestId);
  const tx = dappkitResponse.rawTxs[0];
  await kit.web3.eth.sendSignedTransaction(tx);
};

const redeem = async ({ boxAddress, receiverAddress, network, currency }) => {
  const web3 = getWeb3(network);
  const kit = getKit(web3);

  const box = new web3.eth.Contract(BoxContract.abi, boxAddress);

  const txObject = box.methods.redeem();

  const currencyContract = await getCurrecyContract(currency, kit);

  const requestId = 'redeem';
  const dappName = expo.name;
  const callback = Linking.makeUrl('/my/path');
  requestTxSig(
    kit,
    [
      {
        tx: txObject,
        from: receiverAddress,
        to: box.options.address,
        feeCurrency: currencyContract.address
      }
    ],
    { requestId, dappName, callback }
  );

  const dappkitResponse = await waitForSignedTxs(requestId);
  const tx = dappkitResponse.rawTxs[0];
  await kit.web3.eth.sendSignedTransaction(tx);
};

const finalize = async ({ boxAddress, receiverAddress, network, currency }) => {
  const web3 = getWeb3(network);
  const kit = getKit(web3);

  const box = new web3.eth.Contract(BoxContract.abi, boxAddress);

  const txObject = box.methods.finalize();

  const currencyContract = await getCurrecyContract(currency, kit);

  const requestId = 'finalize';
  const dappName = expo.name;
  const callback = Linking.makeUrl('/my/path');
  requestTxSig(
    kit,
    [
      {
        tx: txObject,
        from: receiverAddress,
        to: box.options.address,
        feeCurrency: currencyContract.address
      }
    ],
    { requestId, dappName, callback }
  );

  const dappkitResponse = await waitForSignedTxs(requestId);
  const tx = dappkitResponse.rawTxs[0];
  await kit.web3.eth.sendSignedTransaction(tx);
};

export {
  createBoxOnChain,
  getBoxSummary,
  contributeToBox,
  getContributors,
  revokeContribution,
  redeem,
  finalize
};
