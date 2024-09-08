import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
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
              <Link to="/">Accueil</Link>
            </li>
            <li>
              <Link to="/my-cagnottes">Mes Cagnottes</Link>
            </li>
            <li>
              <Link to="/create-cagnotte">Créer une Cagnotte</Link>
            </li>
            <li>
              <Link to="/List-cagnottes">Lister toutes les cagnottes</Link>
            </li>
          </ul>
        </nav>

        {/* Gestion des routes */}
        <Router>
          <Route exact path="/" component={Home} />
          <Route path="/my-cagnottes" component={MyCagnotte} />
          <Route path="/create-cagnotte" component={CreateCagnotte} />
          <Route path="/List-cagnottes" component={CagnotteList} />
        </Router>
      </div>
    </Router>
  );
};

export default App;
