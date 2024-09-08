import React, { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import BN from 'bn.js'; // Importer BN depuis bn.js
import idl from './idl.json'; 

// Adresse du programme Solana
const programId = new PublicKey("8zjbcM6U4i4rqQVqeyacHU8NsZ9jYATwTCARQBudXNp8");

// Cluster Devnet de Solana
const network = "https://api.devnet.solana.com";

// IDL du programme Solana

const CagnotteList = () => {
  const [cagnottes, setCagnottes] = useState([]);
  const [contributionAmount, setContributionAmount] = useState(0); // État pour stocker le montant de la contribution

  // Initialise la connexion et le provider Anchor
  const connection = new Connection(network);
  const provider = new AnchorProvider(connection, window.solana, {
    preflightCommitment: "processed",
  });

  const program = new Program(idl, programId, provider);

  // Fonction pour récupérer les cagnottes depuis la blockchain
  const fetchCagnottes = async () => {
    try {
      const cagnottesAccounts = await program.account.cagnotte.all();
      setCagnottes(cagnottesAccounts);
    } catch (error) {
      console.error("Erreur lors de la récupération des cagnottes", error);
    }
  };

  // Charger les cagnottes au démarrage du composant
  useEffect(() => {
    fetchCagnottes();
  }, []);

  // Générer le PDA pour le compte de contribution
  const getContributionPDA = async (cagnottePublicKey, userPublicKey) => {
    const [contributionPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("contribution"),
        cagnottePublicKey.toBuffer(),
        userPublicKey.toBuffer(),
      ],
      programId
    );
    return contributionPda;
  };

  // Fonction pour participer à une cagnotte
  const participateInCagnotte = async (cagnottePublicKey) => {
    const userPublicKey = provider.wallet.publicKey;

    // Vérification que le portefeuille est bien connecté
    if (!userPublicKey) {
      alert("Veuillez connecter votre portefeuille.");
      return;
    }

    if (contributionAmount <= 0) {
      alert("Le montant doit être supérieur à 0.");
      return;
    }

    try {
      // Obtenir le PDA du compte de contribution
      const contributionPda = await getContributionPDA(cagnottePublicKey, userPublicKey);

      const tx = await program.methods
        .contribute(new BN(contributionAmount)) // Utilisation de BN depuis bn.js
        .accounts({
          cagnotte: cagnottePublicKey, // Clé publique de la cagnotte
          user: userPublicKey, // Clé publique de l'utilisateur
          contribution: contributionPda, // PDA pour le compte de contribution
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      alert(`Contribution réussie avec le hash de transaction : ${tx}`);
    } catch (error) {
      console.error("Erreur lors de la contribution", error);
    }
  };

  return (
    <div>
      <h2>Liste des Cagnottes</h2>
      {cagnottes.length > 0 ? (
        cagnottes.map((cagnotte, index) => (
          <div key={index} className="cagnotte">
            <h3>Nom: {String.fromCharCode(...cagnotte.account.name)}</h3>
            <p>Montant: {cagnotte.account.amount.toString()} Lamports</p>
            <p>Verrouillé: {cagnotte.account.locked ? 'Oui' : 'Non'}</p>

            {/* Formulaire de participation */}
            <input
              type="number"
              placeholder="Montant à contribuer (en Lamports)"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
            />
            <button
              onClick={() => participateInCagnotte(cagnotte.publicKey)}
              disabled={cagnotte.account.locked} // Désactiver si la cagnotte est verrouillée
            >
              Participer
            </button>
          </div>
        ))
      ) : (
        <p>Aucune cagnotte disponible</p>
      )}
    </div>
  );
};

export default CagnotteList;
