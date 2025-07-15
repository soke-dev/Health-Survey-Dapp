### 🔐 **Project Title**: Private Health Survey using FHEVM (Zama FHE)

### 🧠 **Overview**:

This project is a decentralized survey dApp that leverages Fully Homomorphic Encryption (FHE) via Zama’s FHEVM to securely collect and store private health data (e.g., age and fever status) on-chain without exposing users' raw inputs.

### ⚙️ **How it Works**:

1. **Frontend (React + ethers.js + Zama SDK)**:

   * Users connect their MetaMask wallet.
   * They enter their age and whether they have a fever.
   * These inputs are encrypted in the browser using Zama’s Relayer SDK and then submitted to a smart contract.

2. **Smart Contract (Solidity + FHEVM)**:

   * The contract receives the encrypted values (as `externalEuint8` and `externalEbool`) along with proofs.
   * It uses `FHE.fromExternal()` to verify and convert them to internal encrypted types.
   * Encrypted values are stored in a mapping per user.

3. **Decryption**:

   * Only the user who submitted the data can decrypt it client-side using the SDK, ensuring privacy is maintained even when reading from the blockchain.

### 📦 **Stack**:

* Smart Contract: Solidity with `@fhevm/solidity`
* Frontend: React + ethers.js
* Zama FHE Relayer SDK
* Blockchain: FHE-compatible Sepolia Testnet
* Tools: MetaMask, CRACO, TypeScript

### 🧪 **Current Issues (in-progress)**:

* Submitting encrypted data sometimes results in failed transactions.
* Decryption errors occur if FHE instance is misused or not initialized correctly.
* Call exceptions hint at incorrect usage of ciphertext handles or malformed proofs.
