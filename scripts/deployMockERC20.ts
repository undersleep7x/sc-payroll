import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log ("Deploying from:", deployer.address);
    const decimals = 6;
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockERC20.deploy("Mock USDC", "USDC", decimals);
    await mockUSDC.waitForDeployment()
    console.log(`Mock USDC deployed to: ${(await mockUSDC.getAddress()).toString}`);
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})