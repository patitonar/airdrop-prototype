const Airdrop = artifacts.require("./Airdrop.sol");
const ExampleToken = artifacts.require("./ExampleToken.sol");

module.exports = function(deployer) {
  ExampleToken.deployed().then((instance) =>{
    Airdrop.deployed().then(()=>{
      instance.transfer(Airdrop.address, 1000000)
    })
  }).catch(err => console.log(err))
};
