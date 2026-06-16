import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Menu,
  X,
  Mail,
  Phone
} from 'lucide-react';
import { mockEmployees } from '../utils/mockData';

const Sidebar: React.FC<{ isMobileOpen: boolean; onToggleMobile: () => void; onCloseMobile: () => void }> = ({ isMobileOpen, onToggleMobile, onCloseMobile }) => {
  const [isDesktopOpen, setIsDesktopOpen] = React.useState(true);
  const currentUser = mockEmployees[0]; // John Smith as admin

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: Calendar, label: 'Roster', path: '/roster' },
    { icon: DollarSign, label: 'Pay', path: '/pay' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <div className={`
        fixed md:static z-50 md:z-auto h-screen bg-gray-900 text-white transition-all duration-300
        ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
        ${isDesktopOpen ? 'md:w-72' : 'md:w-20'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {isMobileOpen || isDesktopOpen ? (
            <span className="text-xl font-bold tracking-wider">REMS</span>
          ) : null}
          
          <div className="flex gap-2">
            {/* Mobile close button */}
            <button 
              onClick={onCloseMobile}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors md:hidden"
            >
              <X size={20} />
            </button>
            {/* Desktop toggle button */}
            <button 
              onClick={() => setIsDesktopOpen(!isDesktopOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors hidden md:block"
            >
              {isDesktopOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) => `
                flex items-center p-4 transition-colors
                ${isActive ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              `}
            >
              <item.icon size={24} />
              {(isMobileOpen || isDesktopOpen) && <span className="ml-4 font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
            {(isMobileOpen || isDesktopOpen) && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser.position}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Mail size={14} />
                    <span className="truncate">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Phone size={14} />
                    <span className="truncate">{currentUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-mono">ID: {currentUser.id}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
