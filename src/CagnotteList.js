import React, { useContext, useEffect, useState } from 'react';
import { WalletContext } from './WalletProvider';
import { PublicKey, SystemProgram } from '@solana/web3.js'; // Importer SystemProgram pour les transactions
import BN from 'bn.js'; // Utiliser BN pour gérer les montants en lamports

const CagnotteList = () => {
  const { wallet, walletConnected, program } = useContext(WalletContext);
  const [cagnottes, setCagnottes] = useState([]);
  const [contributionAmount, setContributionAmount] = useState(''); // Gérer le montant de la contribution

  // Fonction pour récupérer les cagnottes depuis la blockchain
  const fetchCagnottes = async () => {
    if (!program || !wallet) return;

    try {
      const cagnottesAccounts = await program.account.cagnotte.all();
      setCagnottes(cagnottesAccounts);
    } catch (error) {
      console.error("Erreur lors de la récupération des cagnottes", error);
    }
  };

  // Fonction pour générer le PDA du compte de contribution utilisateur
  const getContributionPDA = async (cagnottePublicKey) => {
    const [contributionPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('contribution'), cagnottePublicKey.toBuffer(), wallet.toBuffer()],
      program.programId
    );
    return contributionPDA;
  };

  // Fonction pour participer à une cagnotte
  const participateInCagnotte = async (cagnottePublicKey, amount) => {
    if (!program || !wallet || !amount) return;

    try {
      const contributionPDA = await getContributionPDA(cagnottePublicKey); // Récupérer le PDA pour la contribution
      const amountInLamports = new BN(amount); // Convertir le montant en BN (BigNumber)

      const tx = await program.methods
        .contribute(amountInLamports)
        .accounts({
          cagnotte: cagnottePublicKey,
          user: wallet,
          contribution: contributionPDA, // Ajouter le PDA de la contribution
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert(`Contribution envoyée avec succès ! Transaction : ${tx}`);
      await fetchCagnottes(); // Recharger les cagnottes après contribution
    } catch (error) {
      console.error("Erreur lors de la contribution", error);
    }
  };

  // Charger les cagnottes au démarrage du composant
  useEffect(() => {
    if (walletConnected) {
      fetchCagnottes();
    }
  }, [walletConnected]);

  return (
    <div>
      <h2>Liste des Cagnottes</h2>
      {walletConnected && cagnottes.length > 0 ? (
        cagnottes.map((cagnotte, index) => (
          <div key={index} className="cagnotte">
            <h3>Nom: {String.fromCharCode(...cagnotte.account.name)}</h3>
            <p>Montant: {cagnotte.account.amount.toString()} Lamports</p>
            <p>Verrouillé: {cagnotte.account.locked ? 'Oui' : 'Non'}</p>

            {/* Afficher un champ pour entrer le montant de la contribution */}
            <input
              type="number"
              placeholder="Montant en lamports"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
            />
            <button
              onClick={() => participateInCagnotte(cagnotte.publicKey, contributionAmount)}
              disabled={cagnotte.account.locked || contributionAmount <= 0} // Désactiver si la cagnotte est verrouillée ou montant invalide
            >
              Participer
            </button>
          </div>
        ))
      ) : (
        <p>{walletConnected ? 'Aucune cagnotte disponible' : 'Connectez votre portefeuille pour voir les cagnottes'}</p>
      )}
    </div>
  );
};

export default CagnotteList;
