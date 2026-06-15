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

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const currentUser = mockEmployees[0]; // John Smith as admin

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: Calendar, label: 'Roster', path: '/roster' },
    { icon: DollarSign, label: 'Pay', path: '/pay' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  return (
    <div className={`flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 ${isOpen ? 'w-72' : 'w-20'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {isOpen && <span className="text-xl font-bold tracking-wider">REMS</span>}
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center p-4 transition-colors
              ${isActive ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
            `}
          >
            <item.icon size={24} />
            {isOpen && <span className="ml-4 font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {currentUser.firstName[0]}{currentUser.lastName[0]}
          </div>
          {isOpen && (
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
  );
};

export default Sidebar;
