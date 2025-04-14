import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ERC20, MockERC20, Payroll } from "../typechain-types";

describe("Payroll", function () {
    let payroll: Payroll
    let usdc: MockERC20
    let owner: Signer;
    let employee: Signer;
    let other: Signer;
    let USDC_DECIMALS = 6;

    beforeEach(async function() {
        [owner, employee, other] = await ethers.getSigners();

        // deploy mock token
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        usdc = await MockERC20.deploy("Mock USDC", "USDC", USDC_DECIMALS);
        await usdc.waitForDeployment();

        //mint test employer tokens
        await usdc.mint(owner.getAddress(), ethers.parseUnits("10000", USDC_DECIMALS));

        //deploy payroll contract
        const Payroll = await ethers.getContractFactory("Payroll");
        payroll = await Payroll.deploy(usdc.getAddress());
        await payroll.waitForDeployment();
    });

    it("should allow employer to add and remove employee", async function () {
        await payroll.addEmployee(await employee.getAddress());
        expect (payroll.employees(employee.getAddress())).to.not.equal(undefined);

        await payroll.removeEmployee(await employee.getAddress());
        const emp = await payroll.employees(await employee.getAddress());
        expect(emp).to.be.false;
    });

    it("should allow employer to set pay", async function () {
        await payroll.addEmployee(await employee.getAddress());
        await payroll.updateSupportedToken(usdc.getAddress(), true);
        await payroll.setPaycheck(employee.getAddress(), usdc.getAddress(), 1000)
        const paycheck = await payroll.getEmployeePaycheck(await employee.getAddress(), usdc.getAddress());
        expect(paycheck).to.equal(1000)
    })

    it("should allow funding and paycheck withdrawal", async function () {
        await payroll.addEmployee(await employee.getAddress());
        await payroll.setPaycheck(await employee.getAddress(), usdc.getAddress(), ethers.parseUnits("1000", USDC_DECIMALS));
        await usdc.approve(payroll.getAddress(), ethers.parseUnits("1000", USDC_DECIMALS));
        await payroll.fundPayroll(usdc.getAddress(), ethers.parseUnits("1000", USDC_DECIMALS));
        await payroll.connect(employee).withdrawPaycheck(usdc.getAddress());
        const balance = await usdc.balanceOf(await employee.getAddress());
        expect(balance).to.equal(ethers.parseUnits("1000", USDC_DECIMALS));
      });

      it("should fail with unsupported token", async function () {
        const newToken: ERC20 = await (await ethers.getContractFactory("MockERC20")).deploy("bananacoin", "BNX", 6);
        await newToken.waitForDeployment();
        await payroll.addEmployee(await employee.getAddress());
        await expect(
          payroll.setPaycheck(await employee.getAddress(), newToken.getAddress(), 1000)
        ).to.be.revertedWith("Token not supported");
      });
    
      it("should revert with a non-owner call", async function () {
        await expect(
          payroll.connect(employee).addEmployee(await other.getAddress())
        ).to.be.reverted;
    
        await expect(
            payroll.connect(employee).updateSupportedToken(usdc.getAddress(), true)
        ).to.be.reverted;
      });
    
      it("should revert with double-withdrawn employee", async function () {
        await payroll.addEmployee(await employee.getAddress());
        await payroll.setPaycheck(await employee.getAddress(), usdc.getAddress(), ethers.parseUnits("1000", USDC_DECIMALS));
        await usdc.approve(payroll.getAddress(), ethers.parseUnits("1000", USDC_DECIMALS));
        await payroll.fundPayroll(usdc.getAddress(), ethers.parseUnits("1000", USDC_DECIMALS));
        await payroll.connect(employee).withdrawPaycheck(usdc.getAddress());
    
        await expect(
            payroll.connect(employee).withdrawPaycheck(usdc.getAddress())
        ).to.be.revertedWith("No paycheck set for this token");
      });
    
      it("should revert with low contract balance", async function () {
        await payroll.addEmployee(await employee.getAddress());
        await payroll.setPaycheck(await employee.getAddress(), usdc.getAddress(), ethers.parseUnits("1000", USDC_DECIMALS));
        await expect(
            payroll.connect(employee).withdrawPaycheck(usdc.getAddress())
        ).to.be.revertedWith("Insufficient contract balance");
      });
    
      it("should revert with non-employee withdrawal", async function () {
        await expect(
          payroll.connect(employee).withdrawPaycheck(usdc.getAddress())
        ).to.be.revertedWith("Not an employee");
      });
    
      it("should revert when trying to fund payroll with zero", async function () {
        await usdc.approve(payroll.getAddress(), ethers.parseUnits("1000", USDC_DECIMALS));
        await expect(
          payroll.fundPayroll(usdc.getAddress(), 0)
        ).to.be.revertedWith("Must fund a positive amount");
      });

    
});