import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Home from './Home';
import MyCagnotte from './MyCagnotte';
import CreateCagnotte from './CreateCagnotte';
import CagnotteList from './CagnotteList';

const App = () => {
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
          </ul>
        </nav>

        {/* Gestion des routes */}
        <Routes>
          {/* Route par défaut qui redirige vers la page "Mes Cagnottes" */}
          <Route path="/" element={<Navigate to="/my-cagnottes" />} />

          {/* Autres routes */}
          <Route path="/my-cagnottes" element={<MyCagnotte />} />
          <Route path="/create-cagnotte" element={<CreateCagnotte />} />
          <Route path="/List-cagnottes" element={<CagnotteList />} />
          
          {/* Redirection des routes inconnues vers "Mes Cagnottes" */}
          <Route path="*" element={<Navigate to="/my-cagnottes" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
