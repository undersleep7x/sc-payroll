# 🧾 Payroll Smart Contract

This project is a token-agnostic, decentralized payroll system built on Ethereum. It allows employers to manage individual paychecks using any ERC-20 token, starting with a verified USDC-compatible mock token on the Sepolia testnet.

## Features
- Owner-controlled contract (using OpenZeppelin's `Ownable`)
- Supports any ERC-20 token (e.g., USDC, wETH)
- Paycheck logic (individual payments, not annual salaries)
- Reentrancy protection via `ReentrancyGuard`
- Fully verified on Sepolia Etherscan
- End-to-end validation script for live on-chain interaction

## Tech Stack
- Solidity
- Hardhat + TypeScript
- OpenZeppelin contracts
- Ethers.js
- Sepolia testnet (via Alchemy RPC)

## How to Run Locally
1. Clone and install dependencies:
```
git clone https://github.com/your/repo.git
cd payroll-project
npm install
```
2. Set up your `.env`:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYourDeployerPrivateKey
EMPLOYEE_PRIVATE_KEY=0xYourEmployeePrivateKey
USDC_ADDRESS=0xDeployedMockToken
PAYROLL_ADDRESS=0xDeployedPayrollContract
EMPLOYEE_ADDRESS=0xYourEmployeeAddress
```
3. Run the full test cycle:
```
npx hardhat run scripts/finalPayrollTest.ts –network sepolia
```
## Deployed Contracts
- MockERC20: `0x9596749b1765aCfD0c840061015804aaA9ecfCFE` (✅ Verified)
- Payroll: `0xF9eF637a6e4F8da5e1a861A0004F6898aB233593` (✅ Verified)

## Notes
- This project uses paychecks, not annual salary — payments are made per assignment.
- Frontend will be built later using React + Ethers.js.
- Future updates will add support for wrapped tokens, batch payouts, and off-chain event sync.

## License
MIT — use it, modify it, build something cool with it.