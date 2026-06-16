import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Roster from './pages/Roster';
import Pay from './pages/Pay';
import Settings from './pages/Settings';

function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen} 
          onToggleMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto relative">
          {/* Mobile header with hamburger menu */}
          <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 p-4 flex items-center">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <span className="ml-4 text-xl font-bold tracking-wider">REMS</span>
          </div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/pay" element={<Pay />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
