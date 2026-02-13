# Midnight Privacy Passport Architect 🛡️

A technical demonstration of a **Zero-Knowledge Identity System** built for the **Midnight Network**. This application simulates the "Universal Privacy Passport" architecture, utilizing the **Compact (Minokawa)** smart contract language to demonstrate how users can prove eligibility (e.g., Age > 18) without revealing sensitive personal data.

**Contract:** `0x7d84909a1e40a423827c043c0063a6bbbe6b29c809686f31512bfdec579672`

## 🌟 Features

*   **Hardened ZK Simulation**: Simulates local witness generation, cryptographic signatures, and Nullifier computation.
*   **Smart Contract Inspector**: View and analyze the actual `passport.compact` circuit code.
*   **Witness Provider Logic**: Explore the TypeScript implementation of the client-side secret vault (`PrivateState`).
*   **Architecture Diagram**: Visual breakdown of the Trusted Issuer -> Witness -> Midnight Ledger flow.
*   **AI Architect**: Integrated **Gemini 3 Pro** assistant to explain technical concepts in real-time.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **Blockchain Simulation**: Midnight Network (Compact Language)
*   **AI Integration**: Google GenAI SDK (Gemini 1.5/2.5/3 models)
*   **Icons**: Lucide React

---

## 🚀 Local Setup Guide

Follow these instructions to run the project locally on your machine.

### Prerequisites

*   **Node.js**: v18.0.0 or higher
*   **npm** or **yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/pranjalxyz/Universal-Passport.git
    cd Universal-Passport
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the Development Server**
    ```bash
    npm start
    # or
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) to view the app.

---

## 🌍 Deployment Simulation

This project includes a professional deployment script that simulates the interaction with the Midnight Testnet.

1.  **Compile the Circuit**
    ```bash
    npm run compact
    ```
    This generates the ZK-VM bytecode and Verifier artifacts in `contracts/artifacts`.

2.  **Deploy to Testnet**
    ```bash
    npm run deploy
    ```
    This runs `deployment/deploy.ts`, which simulates:
    *   Environment & Asset checks.
    *   Artifact verification.
    *   Transaction signing (Ed25519).
    *   Circuit uploading to the Midnight Ledger.
    *   Receipt generation in `contracts/artifacts/deployment_receipt.json`.

---

## 📂 Project Structure

```
├── src/
│   ├── components/       # UI Components (Simulation, CodeViewer, Diagrams)
│   ├── services/         # Gemini AI Service integration
│   ├── constants.ts      # Compact code, Witness logic, and Simulation data
│   ├── types.ts          # TypeScript interfaces for Identity/Simulation
│   ├── App.tsx           # Main application layout
│   └── index.tsx         # Entry point
├── contracts/
│   ├── passport.compact  # The Compact Smart Contract source
│   └── artifacts/        # Compiled outputs & deployment receipts
├── deployment/
│   └── deploy.ts         # Midnight Network deployment script
├── public/
├── metadata.json         # Project metadata
└── README.md             # Documentation
```

## 🔐 Security Note

This is a **Simulation** and **Architectural Demo**.
*   The keys used in the simulation (`passport.compact`, `witness.ts`) are for educational purposes.
*   In a real production environment, `PrivateState` would be managed by the Midnight Lace wallet or a secure enclave, not React state.
*   **Do not use the example private keys in a real mainnet application.**

## 📜 License

MIT