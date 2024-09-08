import React, { useState, useContext } from 'react';
import { WalletContext } from './WalletProvider'; // Importer le contexte Wallet
import { PublicKey, SystemProgram } from '@solana/web3.js'; // Importer PublicKey et SystemProgram

const CreateCagnotte = () => {
  const { wallet, walletConnected, program } = useContext(WalletContext);
  const [cagnotteName, setCagnotteName] = useState('');

  const createCagnotte = async () => {
    if (!cagnotteName) {
      alert("Le nom de la cagnotte est obligatoire");
      return;
    }

    if (!wallet || !program) return;

    try {
      const tx = await program.methods
        .initialize(cagnotteName)
        .accounts({
          cagnotte: PublicKey.findProgramAddressSync(
            [Buffer.from('cagnotte'), wallet.toBuffer(), Buffer.from(cagnotteName)],
            program.programId
          )[0],
          user: wallet,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert(`Cagnotte créée avec succès ! Transaction : ${tx}`);
    } catch (error) {
      console.error("Erreur lors de la création de la cagnotte", error);
    }
  };

  return (
    <div>
      <h2>Créer une nouvelle Cagnotte</h2>
      {walletConnected ? (
        <>
          <input
            type="text"
            placeholder="Nom de la cagnotte"
            value={cagnotteName}
            onChange={(e) => setCagnotteName(e.target.value)}
          />
          <button onClick={createCagnotte}>Créer Cagnotte</button>
        </>
      ) : (
        <p>Connectez votre portefeuille pour créer une cagnotte.</p>
      )}
    </div>
  );
};

export default CreateCagnotte;
