const Airdrop = artifacts.require("./Airdrop.sol");
const ExampleToken = artifacts.require("./ExampleToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ExampleToken);
  deployer.deploy(Airdrop);
};
