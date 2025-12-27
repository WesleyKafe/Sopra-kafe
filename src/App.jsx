import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GameRoom from './pages/GameRoom';

// Um placeholder simples para o Admin por enquanto
const Admin = () => <h1>Área Secreta da Chefe (Em construção)</h1>;

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Aqui virá seu Header/Navbar fixo */}
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jogar/:gameId" element={<GameRoom />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;