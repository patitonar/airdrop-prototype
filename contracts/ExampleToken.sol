pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract ExampleToken is StandardToken {
    string public name = "ExampleToken";
    string public symbol = "EXT";
    uint public decimals = 4;
    uint public INITIAL_SUPPLY = 100000000000;

    function ExampleToken() {
        balances[msg.sender] = INITIAL_SUPPLY;
    }
}