pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/token/ERC20/BasicToken.sol';

contract Airdrop is Ownable {
  function runAirdrop(address[] recipients, uint amount, address tokenAddress) public onlyOwner {
    BasicToken myToken = BasicToken(tokenAddress);

    for (uint i = 0; i < recipients.length; i++) {
      myToken.transfer(recipients[i], amount);
    }
  }
}
