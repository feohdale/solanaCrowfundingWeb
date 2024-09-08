import React, { useEffect, useState } from 'react';
import { PublicKey, Connection, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import BN from 'bn.js'; // Importer BN depuis bn.js
import idl from './idl.json'; 

// Adresse du programme Solana
const programId = new PublicKey("8zjbcM6U4i4rqQVqeyacHU8NsZ9jYATwTCARQBudXNp8");

// Cluster Devnet de Solana
const network = "https://api.devnet.solana.com";

// IDL du programme Solana

const MyCagnotte = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [myCagnottes, setMyCagnottes] = useState([]);

  const connection = new Connection(network);
  const provider = walletConnected && new AnchorProvider(connection, window.solana, {
    preflightCommitment: "processed",
  });

  const program = walletConnected && new Program(idl, programId, provider);

  // Connexion au portefeuille
  const connectWallet = async () => {
    if (window.solana) {
      try {
        const response = await window.solana.connect();
        setWallet(response.publicKey);
        setWalletConnected(true);
      } catch (error) {
        console.error("Erreur lors de la connexion au portefeuille", error);
      }
    } else {
      alert("Solana wallet non détecté");
    }
  };

  // Récupérer les cagnottes de l'utilisateur
  const fetchMyCagnottes = async () => {
    try {
      const allCagnottes = await program.account.cagnotte.all();
      const userCagnottes = allCagnottes.filter(c => c.account.owner.toBase58() === wallet.toBase58());
      setMyCagnottes(userCagnottes);
    } catch (error) {
      console.error("Erreur lors de la récupération des cagnottes", error);
    }
  };

  // Fonction pour retirer les fonds d'une cagnotte
  const withdrawFunds = async (cagnottePublicKey) => {
    const cagnotte = myCagnottes.find(c => c.publicKey.toBase58() === cagnottePublicKey.toBase58());

    if (!cagnotte || cagnotte.account.amount <= 0) {
      alert("Montant insuffisant ou cagnotte introuvable");
      return;
    }

    try {
      const tx = await program.methods
        .withdraw(new BN(cagnotte.account.amount))
        .accounts({
          cagnotte: cagnottePublicKey,
          user: wallet,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert(`Fonds récupérés avec succès ! Transaction : ${tx}`);

      // Recharger les cagnottes après le retrait
      await fetchMyCagnottes();
    } catch (error) {
      console.error("Erreur lors du retrait des fonds", error);
    }
  };

  useEffect(() => {
    if (walletConnected) {
      fetchMyCagnottes();
    }
  }, [walletConnected]);

  return (
    <div>
      <h1>Gérer Mes Cagnottes</h1>

      {/* Connexion au wallet */}
      {!walletConnected ? (
        <button onClick={connectWallet}>Connecter Mon Portefeuille</button>
      ) : (
        <p>Portefeuille connecté : {wallet.toBase58()}</p>
      )}

      {/* Liste des cagnottes */}
      {myCagnottes.length > 0 && (
        <div>
          <h2>Mes Cagnottes</h2>
          {myCagnottes.map((cagnotte, index) => (
            <div key={index}>
              <h3>Nom: {String.fromCharCode(...cagnotte.account.name)}</h3>
              <p>Montant: {cagnotte.account.amount.toString()} Lamports</p>
              <p>Verrouillée: {cagnotte.account.locked ? 'Oui' : 'Non'}</p>
              {!cagnotte.account.locked && cagnotte.account.amount > 0 && (
                <button onClick={() => withdrawFunds(cagnotte.publicKey)}>
                  Retirer les fonds
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCagnotte;
