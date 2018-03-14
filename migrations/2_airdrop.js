const Airdrop = artifacts.require("./Airdrop.sol");
const StandardToken = artifacts.require("./StandardToken.sol");

module.exports = function(deployer) {
  deployer.deploy(StandardToken,'TestCoin','TC', 4, 10000000);
  deployer.deploy(Airdrop);
};
