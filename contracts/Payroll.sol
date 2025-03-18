// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Payroll {
    struct Staff {
        string name;
        uint256 amount;
        bool isPaid;
    }

    function getPaid() public pure  returns(string memory) {
        return "Staff paid successfully";
    }
}