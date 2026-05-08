import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Compass, GitCompare, User, LogOut, Bookmark } from 'lucide-react';
import Home from './pages/Home';
import CollegeDetail from './pages/CollegeDetail';
import Compare from './pages/Compare';
import Auth from './pages/Auth';
import Saved from './pages/Saved';
import { useAuth } from './context/AuthContext';

export default function App() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              C
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Collegetrack</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/" 
              className={`flex items-center gap-2 text-sm font-medium ${location.pathname === '/' || location.pathname.startsWith('/college/') ? 'text-orange-500' : 'text-slate-500 hover:text-slate-800 transition-colors'}`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
            </Link>
            <Link 
              to="/compare" 
              className={`flex items-center gap-2 text-sm font-medium ${location.pathname === '/compare' ? 'text-orange-500' : 'text-slate-500 hover:text-slate-800 transition-colors'}`}
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </Link>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/saved" className={`flex items-center gap-2 text-sm font-medium ${location.pathname === '/saved' ? 'text-orange-500' : 'text-slate-500 hover:text-slate-800 transition-colors'}`}>
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </Link>
                <button onClick={logout} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout ({user.name.split(' ')[0]})</span>
                </button>
              </div>
            ) : (
              <Link to="/auth" className="flex items-center gap-2 text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/college/:id" element={<CollegeDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/saved" element={<Saved />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Collegetrack. MVP built with React & Express.</p>
        </div>
      </footer>
    </div>
  );
}
