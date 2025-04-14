import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const usdcAddress = process.env.USDC_ADDRESS!;
    if (!usdcAddress) throw new Error("Missing USDC_ADDRESS from .env");

    const Payroll = await ethers.getContractFactory("Payroll")
    const payroll = await Payroll.deploy(usdcAddress);
    await payroll.waitForDeployment();

    console.log(`Payroll deployed to: ${payroll.getAddress}`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})