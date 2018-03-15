pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Airdrop is Ownable {

  function runAirdrop(address[] recipients, uint amount, ERC20 tokenAddress) public onlyOwner {

    for (uint i = 0; i < recipients.length; i++) {
      tokenAddress.transfer(recipients[i], amount);
    }
  }

  function runSingleAirdrop(address recipient, uint amount, ERC20 myToken) public onlyOwner {
    myToken.transfer(recipient, amount);
  }

  function balanceOf(ERC20 myToken, address recipient) public constant returns (uint256 balance) {
    return myToken.balanceOf(recipient);
  }
}
