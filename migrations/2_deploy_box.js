const BoxFactory = artifacts.require('BoxFactory');

module.exports = (deployer) => {
  deployer.deploy(BoxFactory);
};
