import React, { useState } from 'react';
import { PublicKey, Connection, SystemProgram } from '@solana/web3.js'; // Import correct depuis @solana/web3.js
import { Program, AnchorProvider } from '@project-serum/anchor';
import idl from './idl.json'; 

const CreateCagnotte = () => {
  const [wallet, setWallet] = useState(null);
  const [cagnotteName, setCagnotteName] = useState('');

  const programId = new PublicKey("8zjbcM6U4i4rqQVqeyacHU8NsZ9jYATwTCARQBudXNp8");
  const connection = new Connection("https://api.devnet.solana.com");

  const createCagnotte = async () => {
    if (!cagnotteName) {
      alert("Le nom de la cagnotte est obligatoire");
      return;
    }

    if (!wallet) {
      alert("Veuillez connecter votre portefeuille");
      return;
    }

    const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: "processed" });
    const program = new Program(idl, programId, provider);

    try {
      const tx = await program.methods
        .initialize(cagnotteName)
        .accounts({
          cagnotte: PublicKey.findProgramAddressSync(
            [Buffer.from('cagnotte'), wallet.toBuffer(), Buffer.from(cagnotteName)],
            programId
          )[0],
          user: wallet,
          systemProgram: SystemProgram.programId, // Import correct de SystemProgram
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
      <input
        type="text"
        placeholder="Nom de la cagnotte"
        value={cagnotteName}
        onChange={(e) => setCagnotteName(e.target.value)}
      />
      <button onClick={createCagnotte}>Créer Cagnotte</button>
    </div>
  );
};

export default CreateCagnotte;
