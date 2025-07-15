import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";
import {
  createInstance,
  SepoliaConfig,
  initSDK,
} from "@zama-fhe/relayer-sdk/bundle";

const CONTRACT_ADDRESS = "0x6861b0253B4742881126c151Ab57912b5FD0b4F8";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const App: React.FC = () => {
  const [wallet, setWallet] = useState<string>("");
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [fhe, setFhe] = useState<any>(null);

  const [age, setAge] = useState<number>(25);
  const [fever, setFever] = useState<boolean>(false);
  const [decrypted, setDecrypted] = useState<any>(null);

  // Connect MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      setProvider(web3Provider);
      setSigner(signer);
      setWallet(address);
      setContract(contract);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  // Init Zama SDK
  const initFHEVM = async () => {
    try {
      await initSDK(); // 🧠 Required before instance
      const config = {
        ...SepoliaConfig,
        network: window.ethereum,
      };
      const instance = await createInstance(config);
      setFhe(instance);
      alert("✅ FHEVM Initialized");
    } catch (e) {
      console.error("❌ FHEVM Init Error:", e);
    }
  };

  const submitSurvey = async () => {
  if (!fhe || !contract || !wallet) {
    alert("❌ SDK or Wallet not ready");
    return;
  }

  try {
    // Encrypt `fever` (bool)
    const feverBuffer = fhe.createEncryptedInput(contract.address, wallet);
    feverBuffer.addBool(fever);
    const feverResult = await feverBuffer.encrypt();
    const feverHandle = feverResult.handles[0];
    const feverProof = feverResult.inputProof;

    // Encrypt `age` (uint8)
    const ageBuffer = fhe.createEncryptedInput(contract.address, wallet);
    ageBuffer.add8(BigInt(age)); // 👈 must use BigInt for uint types
    const ageResult = await ageBuffer.encrypt();
    const ageHandle = ageResult.handles[0];
    const ageProof = ageResult.inputProof;

    const tx = await contract.submitSurvey(
      feverHandle,
      feverProof,
      ageHandle,
      ageProof,
      { gasLimit: 600_000 }
    );

    await tx.wait();
    alert("✅ Encrypted survey submitted!");
  } catch (err: any) {
    console.error("Submit error:", err);
    alert("❌ Submission failed: " + (err?.reason || err?.message));
  }
};

  // Get + decrypt encrypted survey
const getSurveyData = async () => {
  if (!fhe || !contract || !wallet) {
    alert("❌ SDK or Wallet not ready");
    return;
  }

  try {
    const encFever = await contract.getEncryptedFeverStatus();
    const encAge = await contract.getEncryptedAge();

    // Use fhe.decrypt(contractAddress, ciphertext, viewerAddress)
    const feverDecrypted = await fhe.decrypt(contract.address, encFever, wallet);
    const ageDecrypted = await fhe.decrypt(contract.address, encAge, wallet);

    setDecrypted({
      fever: feverDecrypted.toString() === "true" ? "Yes" : "No",
      age: ageDecrypted.toString(),
    });
  } catch (err) {
    console.error("Decryption error:", err);
    alert("❌ Decryption failed");
  }
};


  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🩺 Health Survey</h1>

      {!wallet ? (
        <button onClick={connectWallet}>🔌 Connect MetaMask</button>
      ) : (
        <p>Connected: {wallet}</p>
      )}

      <button onClick={initFHEVM}>🔐 Init FHEVM</button>

      <div style={{ marginTop: "1rem" }}>
        <label>Age: </label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />
        <br />
        <label>Fever: </label>
        <input
          type="checkbox"
          checked={fever}
          onChange={(e) => setFever(e.target.checked)}
        />
        <br />
        <button onClick={submitSurvey}>📤 Submit Survey</button>
        <button onClick={getSurveyData}>🔓 Decrypt Survey</button>
      </div>

      {decrypted && (
        <div style={{ marginTop: "1rem" }}>
          <p>🧾 Decrypted Age: {decrypted.age}</p>
          <p>🧾 Decrypted Fever: {decrypted.fever}</p>
        </div>
      )}
    </div>
  );
};

export default App;
