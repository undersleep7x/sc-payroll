// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Payroll is Ownable, ReentrancyGuard {

    struct Employee {
        mapping(address => uint) paychecks;
        bool exists;
    }

    mapping (address => Employee) public employees;
    mapping (address => bool) public supportedTokens;
    
    event EmployeeAdded(address indexed employee);
    event EmployeeRemoved(address indexed employee);
    event PaycheckWithdrawn(address indexed employee, address indexed token, uint amount);
    event PayrollFunded(address indexed employer, address indexed token, uint amount);
    event TokenSupportUpdated(address indexed token, bool status);

    constructor (address _usdcToken) Ownable(msg.sender) { //starting with usdc support in the contract, but can add other tokens to be supported later on
        supportedTokens[_usdcToken] = true;
        emit TokenSupportUpdated(_usdcToken, true);
    }

    function updateSupportedToken(address _token, bool _status) external onlyOwner { //owner only function that allows for new tokens to be added
        supportedTokens[_token] = _status;
        emit TokenSupportUpdated(_token, _status);
    }

    function addEmployee(address _employee) external onlyOwner { //owner only function to add new employees
        require(!employees[_employee].exists, "Employee already exists");
        employees[_employee].exists = true;
        emit EmployeeAdded(_employee);
    }

    function setPaycheck(address _employee, address _token, uint _paycheck) external onlyOwner {
        require(employees[_employee].exists, "Employee does not exist");
        require(supportedTokens[_token], "Token not supported");
        employees[_employee].paychecks[_token] = _paycheck;
    }

    function removeEmployee(address _employee) external onlyOwner {
        require(employees[_employee].exists, "Employee does not exist");
        delete employees[_employee];
        emit EmployeeRemoved(_employee);
    }

    function withdrawPaycheck(address _token) external nonReentrant {
        require(employees[msg.sender].exists, "Not an employee");
        require(supportedTokens[_token], "Token not supported");

        uint paycheck = employees[msg.sender].paychecks[_token];
        require(paycheck > 0, "No paycheck set for this token");
        require(IERC20(_token).balanceOf(address(this)) >= paycheck, "Insufficient contract balance");

        require(IERC20(_token).transfer(msg.sender, paycheck), "Transfer failed");
        employees[msg.sender].paychecks[_token] = 0;

        emit PaycheckWithdrawn(msg.sender, _token, paycheck);
    }

    function fundPayroll(address _token, uint _amount) external onlyOwner {
        require(supportedTokens[_token], "Token not supported");
        require(_amount > 0, "Must fund a positive amount");
        require(IERC20(_token).transferFrom(msg.sender, address(this), _amount), "Funding failed");
        emit PayrollFunded(msg.sender, _token, _amount);
    }

    function getPayrollBalance(address _token) external view returns (uint) {
        require(supportedTokens[_token], "Token not supported");
        return IERC20(_token).balanceOf(address(this));
    }

    function getEmployeePaycheck(address _employee, address _token) external view returns (uint) {
        require(employees[_employee].exists, "Employee does not exist");
        return employees[_employee].paychecks[_token];
    }


}