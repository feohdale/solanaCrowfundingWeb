import React, { useState, useEffect } from "react";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import idl from "./cagnotte2.json"; 
// Fonction pour obtenir le fournisseur Phantom
const getProvider = () => {
    if ("solana" in window) {
        const provider = window.solana;
        if (provider.isPhantom) {
            return provider;
        }
    }
};

function App() {
    const [provider, setProvider] = useState(undefined);
    const [walletKey, setWalletKey] = useState(null);
    const [balance, setBalance] = useState(null);

    // Connexion à Phantom Wallet
    const connectWallet = async () => {
        try {
            const response = await provider.connect();
            setWalletKey(response.publicKey.toString());
        } catch (err) {
            console.error("Connection failed: ", err);
        }
    };

    // Déconnexion de Phantom Wallet
    const disconnectWallet = async () => {
        await provider.disconnect();
        setWalletKey(null);
        setBalance(null);
    };

    // Fonction pour obtenir le solde en SOL
    const getBalance = async (walletAddress) => {
        const connection = new Connection(clusterApiUrl('devnet'));
        const publicKey = new PublicKey(walletAddress);
        const balance = await connection.getBalance(publicKey);
        return balance / 1_000_000_000; // Convertir les lamports en SOL
    };

    // Détecter Phantom au chargement de la page
    useEffect(() => {
        const phantomProvider = getProvider();
        if (phantomProvider) {
            setProvider(phantomProvider);
        }
    }, []);

    // Récupérer le solde lorsque le portefeuille est connecté
    useEffect(() => {
        if (walletKey) {
            getBalance(walletKey).then((solBalance) => {
                setBalance(solBalance);
            });
        }
    }, [walletKey]);

    return (
        <div style={{ textAlign: "center", paddingTop: "50px" }}>
            <h2>Connexion à Phantom Wallet</h2>
            {provider && !walletKey && (
                <button onClick={connectWallet} style={buttonStyle}>
                    Connecter Phantom Wallet
                </button>
            )}
            {provider && walletKey && (
                <div>
                    <p>Compte connecté : {walletKey}</p>
                    <p>Solde : {balance !== null ? `${balance} SOL` : "Chargement..."}</p>
                    <button onClick={disconnectWallet} style={buttonStyle}>
                        Déconnecter Wallet
                    </button>
                </div>
            )}
            {!provider && (
                <p>
                    Aucun portefeuille détecté. <a href="https://phantom.app/">Installer Phantom</a>
                </p>
            )}
        </div>
    );
}

const buttonStyle = {
    fontSize: "16px",
    padding: "10px 20px",
    fontWeight: "bold",
    borderRadius: "5px",
    cursor: "pointer",
};

export default App;
