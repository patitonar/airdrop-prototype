pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract Airdrop is Ownable {

  function runAirdrop(address[] recipients, uint amount, ERC20 tokenAddress) public onlyOwner {
    for (uint i = 0; i < recipients.length; i++) {
      tokenAddress.transfer(recipients[i], amount);
    }
  }

  function runAirdropPublic(address[] recipients, uint amount, ERC20 tokenAddress) public {
    for (uint i = 0; i < recipients.length; i++) {
      tokenAddress.transfer(recipients[i], amount);
    }
  }
}
