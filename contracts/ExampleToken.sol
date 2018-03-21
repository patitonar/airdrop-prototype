pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract ExampleToken is StandardToken {
    string public name = "ExampleToken";
    string public symbol = "EXT";
    uint public decimals = 4;

    function addTokens(address userAddress, uint amount) public {
        balances[userAddress] += amount;
    }

    function getBalances(address[] addresses) public view returns (uint256[]) {
        uint256[] memory result = new uint256[](addresses.length);

        for (uint i = 0; i < addresses.length; i++) {
            result[i] = balanceOf(addresses[i]);
        }

        return result;
    }
}