const Airdrop = artifacts.require("./Airdrop.sol");

module.exports = function(deployer) {
  deployer.deploy(Airdrop);
};
