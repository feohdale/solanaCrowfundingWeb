import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Home from './Home';
import MyCagnotte from './MyCagnotte';
import CreateCagnotte from './CreateCagnotte';
import CagnotteList from './CagnotteList';
import AdminPage from './AdminPage';
import { WalletContext } from './WalletProvider';
import './App.css';
const App = () => {
  const { walletConnected, wallet, connectWallet, disconnectWallet } = useContext(WalletContext);

  return (
    <Router>
      <div>
        {/* Menu de navigation */}
        <nav>
          <ul>
            <li>
              <Link to="/my-cagnottes">Mes Cagnottes</Link>
            </li>
            <li>
              <Link to="/create-cagnotte">Créer une Cagnotte</Link>
            </li>
            <li>
              <Link to="/List-cagnottes">Lister les cagnottes</Link>
            </li>
            <li>
              <Link to="/admin-section">Admin Panel</Link>
            </li>
          </ul>

          {/* Bouton Connect/Disconnect Wallet aligné à droite */}
          <div className="wallet-button">
            {walletConnected ? (
              <div>
                <p>Portefeuille connecté : {wallet.toBase58()}</p>
                <button onClick={disconnectWallet}>Déconnecter Mon Portefeuille</button>
              </div>
            ) : (
              <button onClick={connectWallet}>Connecter Mon Portefeuille</button>
            )}
          </div>
        </nav>

        {/* Gestion des routes */}
        <Routes>
          <Route path="/" element={<Navigate to="/my-cagnottes" />} />
          <Route path="/my-cagnottes" element={<MyCagnotte />} />
          <Route path="/create-cagnotte" element={<CreateCagnotte />} />
          <Route path="/List-cagnottes" element={<CagnotteList />} />
          <Route path="/admin-section" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/my-cagnottes" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
