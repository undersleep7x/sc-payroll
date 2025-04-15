import { ethers } from "hardhat";
import dotenv from "dotenv";
import { Wallet } from "ethers";

dotenv.config()

async function main() {
    const usdcAddress = process.env.USDC_ADDRESS!;
    const payrollAddress = process.env.PAYROLL_ADDRESS!;
    const [employer] = await ethers.getSigners();
    const employerAddress = await employer.getAddress();
    const employeePrivateKey = process.env.PRIVATE_KEY!;
    const provider = ethers.provider;
    const employeeSigner = new Wallet(employeePrivateKey, provider);
    const employeeAddress = await employeeSigner.getAddress();

    console.log(`Employer: ${employerAddress}`);
    console.log(`Employee: ${employeeAddress}`);

    //get contracts
    const usdc = await ethers.getContractAt("MockERC20", usdcAddress);
    const payroll = await ethers.getContractAt("Payroll", payrollAddress);
    const decimals = await usdc.decimals();
    const paycheck = ethers.parseUnits("250", decimals);
    const fundAmount = ethers.parseUnits("1000", decimals);

    console.log("Mint employer USDC");
    await(await usdc.mint(employerAddress, fundAmount)).wait();

    console.log("Approve Payroll");
    await(await usdc.approve(await payroll.getAddress(), fundAmount)).wait();

    console.log("Fund payroll");
    await(await payroll.fundPayroll(await usdc.getAddress(), fundAmount)).wait();

    console.log("Add employee");
    await(await payroll.addEmployee(employeeAddress)).wait();

    console.log("Setting paycheck");
    await(await payroll.setPaycheck(employeeAddress, await usdc.getAddress(), paycheck)).wait();

    console.log("Employee can withdraw paycheck");
    // already defined as employeeSigner above
    const payrollAsEmployee = payroll.connect(employeeSigner);
    await(await payrollAsEmployee.withdrawPaycheck(await usdc.getAddress())).wait();

    const finalBalance = await usdc.balanceOf(employeeAddress);
    console.log(`Employee paycheck received: ${ethers.formatUnits(finalBalance, decimals)} USDC`);
}

main().catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
});