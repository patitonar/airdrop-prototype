const Airdrop = artifacts.require("./Airdrop.sol");
const StandardToken = artifacts.require("./StandardToken.sol");

module.exports = function(deployer) {
  StandardToken.deployed().then((instance) =>{
    console.log('In deployed')
    Airdrop.deployed().then(()=>{
      console.log('addres airdrop', Airdrop.address)
      instance.transfer(Airdrop.address, 1000000)
    })
  }).catch(err => console.log(err))
};
