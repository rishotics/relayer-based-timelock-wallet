//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract MockToken is ERC20 {

    // Decimals are set to 18 by default in `ERC20`
    constructor() ERC20("MockToken", "Mock") {}
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
