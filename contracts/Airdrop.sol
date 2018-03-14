pragma solidity ^0.4.18;

import './ERC20.sol';

contract Airdrop {

  function runAirdrop(address[] recipients, uint amount, ERC20 tokenAddress) public {

    for (uint i = 0; i < recipients.length; i++) {
      tokenAddress.transfer(recipients[i], amount);
    }
  }

  function runSingleAirdrop(address recipient, uint amount, ERC20 myToken) public {
    myToken.transfer(recipient, amount);
  }

  function balanceOf(ERC20 myToken, address recipient) public constant returns (uint256 balance) {
    return myToken.balanceOf(recipient);
  }
}
