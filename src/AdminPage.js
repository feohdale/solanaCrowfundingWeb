import React, { useEffect, useState, useContext } from 'react';
import { WalletContext } from './WalletProvider';
import { PublicKey } from '@solana/web3.js';

const AdminPage = () => {
  const { wallet, walletConnected, program } = useContext(WalletContext);
  const [cagnottes, setCagnottes] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState(''); // Stocke l'adresse publique du nouvel admin

  // Fonction pour récupérer les cagnottes
  const fetchCagnottes = async () => {
    if (!program || !wallet) return;

    try {
      const cagnottesAccounts = await program.account.cagnotte.all();
      setCagnottes(cagnottesAccounts);
    } catch (error) {
      console.error("Erreur lors de la récupération des cagnottes", error);
    }
  };

  // Fonction pour récupérer la liste des admins
  const fetchAdmins = async () => {
    if (!program || !wallet) return;

    try {
      const adminAccount = await program.account.adminAccount.all();
      setAdmins(adminAccount[0].account.admins); // Suppose qu'il y a un seul compte admin
    } catch (error) {
      console.error("Erreur lors de la récupération des admins", error);
    }
  };

  // Fonction pour obtenir la PDA de l'admin account
  const getAdminAccountPDA = async () => {
    const [adminAccountPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('admin-account')], // Utilise les seeds définies lors de l'initialisation
      program.programId // L'ID du programme que tu as déployé
    );
    return adminAccountPDA;
  };

  // Fonction pour ajouter un admin
  const addAdmin = async () => {
    if (!program || !wallet) return;

    try {
      const adminAccountPDA = await getAdminAccountPDA(); // Récupère la PDA correcte pour admin_account

      // Vérifier si la pubkey du nouvel admin est valide
      const newAdminPubkey = new PublicKey(newAdmin);

      const tx = await program.methods
        .addAdmin(newAdminPubkey) // Appel de la méthode addAdmin
        .accounts({
          adminAccount: adminAccountPDA,
          user: wallet, // L'admin qui ajoute un autre admin
        })
        .rpc();

      alert(`Nouvel admin ajouté avec succès ! Transaction : ${tx}`);
      fetchAdmins(); // Rafraîchir la liste des admins après l'ajout
    } catch (error) {
      console.error("Erreur lors de l'ajout du nouvel admin", error);
    }
  };

  // Fonction pour révoquer un admin
  const revokeAdmin = async (adminPublicKey) => {
    if (!program || !wallet) return;

    try {
      const adminAccountPDA = await getAdminAccountPDA(); // Récupère la PDA correcte pour admin_account
      const tx = await program.methods
        .revokeAdmin(adminPublicKey) // Appel de la méthode revokeAdmin
        .accounts({
          adminAccount: adminAccountPDA,
          user: wallet, // L'admin qui révoque
        })
        .rpc();

      alert(`Admin révoqué avec succès ! Transaction : ${tx}`);
      fetchAdmins(); // Rafraîchir la liste des admins après la révocation
    } catch (error) {
      console.error("Erreur lors de la révocation de l'admin", error);
    }
  };

  // Fonction pour verrouiller une cagnotte
  const lockCagnotte = async (cagnottePublicKey) => {
    if (!program || !wallet) return;

    try {
      const adminAccountPDA = await getAdminAccountPDA(); // Récupère la PDA correcte pour admin_account
      const tx = await program.methods
        .lockCagnotte()
        .accounts({
          cagnotte: cagnottePublicKey,
          user: wallet, // L'admin qui verrouille la cagnotte
          adminAccount: adminAccountPDA, // Utilise la PDA correcte ici
        })
        .rpc();

      alert(`Cagnotte verrouillée avec succès ! Transaction : ${tx}`);
      fetchCagnottes(); // Rafraîchir la liste après verrouillage
    } catch (error) {
      console.error("Erreur lors du verrouillage de la cagnotte", error);
    }
  };

  // Fonction pour déverrouiller une cagnotte
  const unlockCagnotte = async (cagnottePublicKey) => {
    if (!program || !wallet) return;

    try {
      const adminAccountPDA = await getAdminAccountPDA(); // Récupère la PDA correcte pour admin_account
      const tx = await program.methods
        .unlockCagnotte()
        .accounts({
          cagnotte: cagnottePublicKey,
          user: wallet, // L'admin qui déverrouille la cagnotte
          adminAccount: adminAccountPDA, // Utilise la PDA correcte ici
        })
        .rpc();

      alert(`Cagnotte déverrouillée avec succès ! Transaction : ${tx}`);
      fetchCagnottes(); // Rafraîchir la liste après déverrouillage
    } catch (error) {
      console.error("Erreur lors du déverrouillage de la cagnotte", error);
    }
  };

  // Charger les cagnottes et les admins au démarrage du composant
  useEffect(() => {
    if (walletConnected) {
      fetchCagnottes();
      fetchAdmins();
    }
  }, [walletConnected]);

  return (
    <div>
      <h2>Admin Panel</h2>

      <h3>Liste des Cagnottes</h3>
      {cagnottes.length > 0 ? (
        cagnottes.map((cagnotte, index) => (
          <div key={index} className="cagnotte">
            <h3>Nom: {String.fromCharCode(...cagnotte.account.name)}</h3>
            <p>Montant: {cagnotte.account.amount.toString()} Lamports</p>
            <p>Verrouillé: {cagnotte.account.locked ? 'Oui' : 'Non'}</p>

            {/* Afficher le bouton Verrouiller/Déverrouiller en fonction de l'état de la cagnotte */}
            {cagnotte.account.locked ? (
              <button onClick={() => unlockCagnotte(cagnotte.publicKey)}>Déverrouiller</button>
            ) : (
              <button onClick={() => lockCagnotte(cagnotte.publicKey)}>Verrouiller</button>
            )}
          </div>
        ))
      ) : (
        <p>Aucune cagnotte disponible</p>
      )}

      <h3>Ajouter un Admin</h3>
      <input
        type="text"
        placeholder="Adresse Publique de l'Admin"
        value={newAdmin}
        onChange={(e) => setNewAdmin(e.target.value)} // Met à jour l'input avec la pubkey
      />
      <button onClick={addAdmin}>Ajouter Admin</button> {/* Bouton pour ajouter l'admin */}

      <h3>Liste des Admins</h3>
      {admins.length > 0 ? (
        admins.map((admin, index) => (
          <div key={index} className="admin">
            <p>Admin {index + 1}: {admin.toBase58()}</p>
            <button onClick={() => revokeAdmin(admin)}>Révoquer</button> {/* Bouton de révocation */}
          </div>
        ))
      ) : (
        <p>Aucun admin trouvé</p>
      )}
    </div>
  );
};

export default AdminPage;
