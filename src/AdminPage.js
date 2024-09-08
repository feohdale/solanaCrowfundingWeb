import React, { useEffect, useState } from 'react';
import { PublicKey, Connection, SystemProgram } from '@solana/web3.js'; // Import correct depuis @solana/web3.js
import { Program, AnchorProvider } from '@project-serum/anchor';
import idl from './idl.json'; 

// Adresse du programme Solana
const programId = new PublicKey("8zjbcM6U4i4rqQVqeyacHU8NsZ9jYATwTCARQBudXNp8");

// Cluster Devnet de Solana
const network = "https://api.devnet.solana.com";

const AdminPage = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [newAdminPubkey, setNewAdminPubkey] = useState(''); // Pour ajouter un nouvel admin
  const [admins, setAdmins] = useState([]); // Liste des admins
  const [cagnotteList, setCagnotteList] = useState([]);

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

  // Récupérer la liste des admins
  const fetchAdmins = async () => {
    try {
      const adminAccount = await program.account.adminAccount.fetch(
        PublicKey.findProgramAddressSync([Buffer.from('admin-account')], programId)[0]
      );
      setAdmins(adminAccount.admins);
    } catch (error) {
      console.error("Erreur lors de la récupération des admins", error);
    }
  };

  // Fonction pour ajouter un nouvel admin
  const addAdmin = async () => {
    if (!newAdminPubkey) {
      alert("Veuillez entrer une clé publique valide.");
      return;
    }

    try {
      const newAdminPubkeyParsed = new PublicKey(newAdminPubkey);
      const tx = await program.methods
        .addAdmin(newAdminPubkeyParsed)
        .accounts({
          adminAccount: PublicKey.findProgramAddressSync([Buffer.from('admin-account')], programId)[0],
          user: wallet,
        })
        .rpc();

      alert(`Nouvel admin ajouté avec succès ! Transaction : ${tx}`);
      await fetchAdmins(); // Actualiser la liste des admins
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'admin", error);
    }
  };

  // Fonction pour révoquer un admin
  const revokeAdmin = async (adminPubkey) => {
    try {
      const tx = await program.methods
        .revokeAdmin(new PublicKey(adminPubkey))
        .accounts({
          adminAccount: PublicKey.findProgramAddressSync([Buffer.from('admin-account')], programId)[0],
          user: wallet,
        })
        .rpc();

      alert(`Admin révoqué avec succès ! Transaction : ${tx}`);
      await fetchAdmins(); // Actualiser la liste des admins
    } catch (error) {
      console.error("Erreur lors de la révocation de l'admin", error);
    }
  };

  // Récupérer les cagnottes
  const fetchCagnottes = async () => {
    try {
      const allCagnottes = await program.account.cagnotte.all();
      setCagnotteList(allCagnottes);
    } catch (error) {
      console.error("Erreur lors de la récupération des cagnottes", error);
    }
  };

  // Verrouiller une cagnotte
  const lockCagnotte = async (cagnottePublicKey) => {
    try {
      const tx = await program.methods
        .lockCagnotte()
        .accounts({
          cagnotte: cagnottePublicKey,
          adminAccount: PublicKey.findProgramAddressSync([Buffer.from('admin-account')], programId)[0],
          user: wallet,
        })
        .rpc();

      alert(`Cagnotte verrouillée avec succès ! Transaction : ${tx}`);
      await fetchCagnottes(); // Recharger la liste des cagnottes
    } catch (error) {
      console.error("Erreur lors du verrouillage de la cagnotte", error);
    }
  };

  // Déverrouiller une cagnotte
  const unlockCagnotte = async (cagnottePublicKey) => {
    try {
      const tx = await program.methods
        .unlockCagnotte()
        .accounts({
          cagnotte: cagnottePublicKey,
          adminAccount: PublicKey.findProgramAddressSync([Buffer.from('admin-account')], programId)[0],
          user: wallet,
        })
        .rpc();

      alert(`Cagnotte déverrouillée avec succès ! Transaction : ${tx}`);
      await fetchCagnottes(); // Recharger la liste des cagnottes
    } catch (error) {
      console.error("Erreur lors du déverrouillage de la cagnotte", error);
    }
  };

  useEffect(() => {
    if (walletConnected) {
      fetchAdmins();
      fetchCagnottes();
    }
  }, [walletConnected]);

  return (
    <div>
      <h1>Page Admin - Gérer les Cagnottes et les Admins</h1>

      {/* Connexion au wallet */}
      {!walletConnected ? (
        <button onClick={connectWallet}>Connecter Mon Portefeuille</button>
      ) : (
        <p>Portefeuille connecté : {wallet.toBase58()}</p>
      )}

      {/* Ajouter un nouvel admin */}
      <div>
        <h2>Ajouter un nouvel admin</h2>
        <input
          type="text"
          placeholder="Clé publique du nouvel admin"
          value={newAdminPubkey}
          onChange={(e) => setNewAdminPubkey(e.target.value)}
        />
        <button onClick={addAdmin}>Ajouter Admin</button>
      </div>

      {/* Liste des admins */}
      {admins.length > 0 && (
        <div>
          <h2>Liste des Admins</h2>
          {admins.map((admin, index) => (
            <div key={index}>
              <p>Admin : {admin.toBase58()}</p>
              {admin.toBase58() !== wallet.toBase58() && (
                <button onClick={() => revokeAdmin(admin)}>Révoquer Admin</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Liste des cagnottes à gérer */}
      {cagnotteList.length > 0 && (
        <div>
          <h2>Liste des Cagnottes</h2>
          {cagnotteList.map((cagnotte, index) => (
            <div key={index}>
              <h3>Nom: {String.fromCharCode(...cagnotte.account.name)}</h3>
              <p>Montant: {cagnotte.account.amount.toString()} Lamports</p>
              <p>Verrouillée: {cagnotte.account.locked ? 'Oui' : 'Non'}</p>
              {cagnotte.account.locked ? (
                <button onClick={() => unlockCagnotte(cagnotte.publicKey)}>Déverrouiller</button>
              ) : (
                <button onClick={() => lockCagnotte(cagnotte.publicKey)}>Verrouiller</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
