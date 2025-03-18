import { ethers } from "hardhat";

async function deploy() {
    // Get the contract factory
    const PayrollContract = await ethers.getContractFactory("Payroll");

    console.log("Deploying contract...");

    const payroll = await PayrollContract.deploy();

    await payroll.waitForDeployment(); // Ensure the contract is fully deployed

    console.log("Contract deployed to:", await payroll.getAddress());
}

// Handle errors properly
deploy().catch((error) => {
    console.error(error);
    process.exit(1);
});