import { ethers } from "hardhat";
import { expect } from "chai";

describe("Payroll Contract", function () {

    it("Should deploy successfully", async function () {
        const Payroll = await ethers.getContractFactory("Payroll");
        const payroll = await Payroll.deploy();
        await payroll.waitForDeployment();
        const contractAddress = await payroll.getAddress();

        console.log(`Contract deployed at: ${contractAddress}`);
        expect(contractAddress).to.be.properAddress;
    });
});