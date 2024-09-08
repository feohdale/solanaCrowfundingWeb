import React, { useContext, useEffect, useState } from 'react';
import { WalletContext } from './WalletProvider'; // Importer le contexte Wallet
import { PublicKey, SystemProgram } from '@solana/web3.js'; // Importer SystemProgram pour les transactions
import BN from 'bn.js'; // Utiliser BN pour gérer les montants de Lamports

const MyCagnotte = () => {
  const { wallet, walletConnected, program } = useContext(WalletContext); // Ne plus utiliser connectWallet et disconnectWallet ici
  const [myCagnottes, setMyCagnottes] = useState([]);

  // Récupérer les cagnottes de l'utilisateur connecté
  const fetchMyCagnottes = async () => {
    if (!program || !wallet) return;

    try {
      const allCagnottes = await program.account.cagnotte.all();
      const userCagnottes = allCagnottes.filter(c => c.account.owner.toBase58() === wallet.toBase58());
      setMyCagnottes(userCagnottes);
    } catch (error) {
      console.error("Erreur lors de la récupération des cagnottes", error);
    }
  };

  // Retirer des fonds d'une cagnotte
  const withdrawFunds = async (cagnottePublicKey, amount) => {
    if (!program || !wallet) return;

    try {
      const tx = await program.methods
        .withdraw(new BN(amount))
        .accounts({
          cagnotte: cagnottePublicKey,
          user: wallet,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert(`Fonds retirés avec succès ! Transaction : ${tx}`);
      fetchMyCagnottes(); // Recharger les cagnottes après retrait
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
      <h1>Mes Cagnottes</h1>

      {walletConnected && myCagnottes.length > 0 ? (
        myCagnottes.map((cagnotte, index) => (
          <div key={index} className="cagnotte">
            <h3>Nom: {String.fromCharCode(...cagnotte.account.name)}</h3>
            <p>Montant: {cagnotte.account.amount.toString()} Lamports</p>
            <p>Verrouillé: {cagnotte.account.locked ? 'Oui' : 'Non'}</p>
            {!cagnotte.account.locked && cagnotte.account.amount > 0 && (
              <button onClick={() => withdrawFunds(cagnotte.publicKey, cagnotte.account.amount)}>
                Retirer les fonds
              </button>
            )}
          </div>
        ))
      ) : (
        <p>{walletConnected ? 'Aucune cagnotte trouvée.' : 'Connectez votre portefeuille pour voir vos cagnottes.'}</p>
      )}
    </div>
  );
};

export default MyCagnotte;
