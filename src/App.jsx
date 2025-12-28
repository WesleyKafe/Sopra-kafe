import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import GameRoom from './pages/GameRoom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Me from './pages/me/Me';
import Favorites from './pages/me/Favorites';
import History from './pages/me/History';
import Friends from './pages/me/Friends';
import Profile from './pages/me/Profile';
import Security from './pages/me/Security';
import ImportRoms from './pages/me/ImportRoms';
import MyGames from './pages/me/MyGames';
import RequireAuth from './routes/RequireAuth';
import RequireAdmin from './routes/RequireAdmin';
import AdminHome from './pages/admin/AdminHome';
import Dashboard from './pages/admin/Dashboard';
import GamesAdmin from './pages/admin/GamesAdmin';
import AdsAdmin from './pages/admin/AdsAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';
import SubmissionsAdmin from './pages/admin/SubmissionsAdmin';
import PresenceTracker from './components/PresenceTracker';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <PresenceTracker />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jogar/:gameId" element={<GameRoom />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/me"
            element={
              <RequireAuth>
                <Me />
              </RequireAuth>
            }
          />
          <Route
            path="/me/favorites"
            element={
              <RequireAuth>
                <Favorites />
              </RequireAuth>
            }
          />
          <Route
            path="/me/history"
            element={
              <RequireAuth>
                <History />
              </RequireAuth>
            }
          />
          <Route
            path="/me/friends"
            element={
              <RequireAuth>
                <Friends />
              </RequireAuth>
            }
          />
          <Route
            path="/me/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/me/security"
            element={
              <RequireAuth>
                <Security />
              </RequireAuth>
            }
          />

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminHome />
              </RequireAdmin>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="games" element={<GamesAdmin />} />
            <Route path="ads" element={<AdsAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="submissions" element={<SubmissionsAdmin />} />
          </Route>

          <Route
            path="/me/my-games"
            element={
              <RequireAuth>
                <MyGames />
              </RequireAuth>
            }
          />
          <Route
            path="/me/import"
            element={
              <RequireAuth>
                <ImportRoms />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
