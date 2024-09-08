import React, { createContext, useState, useEffect } from 'react';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { PROGRAM_ID, NETWORK } from './config'; // Fichier config pour l'adresse du programme et le réseau
import idl from './idl.json'; // Interface Description Language (IDL) du programme Solana

// Crée un contexte pour le portefeuille
export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [program, setProgram] = useState(null);

  // Fonction pour connecter le portefeuille
  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        if (wallet) return; 
        const response = await window.solana.connect();
        setWallet(response.publicKey);
        setWalletConnected(true);

        const connection = new Connection(NETWORK);
        const provider = new AnchorProvider(connection, window.solana, {
          preflightCommitment: "processed",
        });
        const programInstance = new Program(idl, new PublicKey(PROGRAM_ID), provider);
        setProgram(programInstance);

        console.log('Portefeuille connecté:', response.publicKey.toBase58());
      } catch (error) {
        console.error("Erreur lors de la connexion au portefeuille", error);
      }
    } else {
      alert("Veuillez installer le portefeuille Phantom pour utiliser cette fonctionnalité.");
    }
  };

  // Fonction pour déconnecter le portefeuille
  const disconnectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        await window.solana.disconnect(); // Utiliser la méthode Phantom pour déconnecter
        setWallet(null);
        setWalletConnected(false);
        setProgram(null);
        console.log("Déconnexion réussie !");
      } catch (error) {
        console.error("Erreur lors de la déconnexion du portefeuille", error);
      }
    } else {
      console.error("Le portefeuille Phantom n'est pas disponible.");
    }
  };

  useEffect(() => {
    const handleConnect = (publicKey) => {
      console.log("Portefeuille connecté via événement:", publicKey.toBase58());
      setWallet(publicKey);
      setWalletConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Portefeuille déconnecté via événement");
      setWallet(null);
      setWalletConnected(false);
      setProgram(null);
    };

    if (window.solana && window.solana.isPhantom) {
      window.solana.on("connect", handleConnect);
      window.solana.on("disconnect", handleDisconnect);

      if (window.solana.isConnected) {
        handleConnect(window.solana.publicKey);
      }
    }

    return () => {
      if (window.solana && window.solana.isPhantom) {
        window.solana.off("connect", handleConnect);
        window.solana.off("disconnect", handleDisconnect);
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, walletConnected, program, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
