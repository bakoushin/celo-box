import Web3 from 'web3';
import { newKitFromWeb3 } from '@celo/contractkit';

// Celo Networks
// Mainnet: 'https://forno.celo.org', 'wss://forno.celo.org/ws'
// Testnet: 'https://alfajores-forno.celo-testnet.org', 'wss://alfajores-forno.celo-testnet.org/ws'

const networks = {
  Mainnet: 'wss://forno.celo.org/ws',
  Alfajores: 'wss://alfajores-forno.celo-testnet.org/ws'
};

const getWeb3 = (network) => {
  return new Web3(networks[network]);
};

const getKit = (web3) => {
  return newKitFromWeb3(web3);
};

const getExplorerLink = (network, address) => {
  switch (network) {
    case 'Alfajores':
      return `https://alfajores-blockscout.celo-testnet.org/address/${address}/token_transfers`;
    case 'Mainnet':
    default:
      return `https://explorer.celo.org/address/${address}/token_transfers`;
  }
};

export { getWeb3, getKit, getExplorerLink };
