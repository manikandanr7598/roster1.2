import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  User,
  Globe,
  ChevronLeft,
  Save,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Building,
  Euro,
  Plus,
  Trash2
} from 'lucide-react';
import { getDepartments, addDepartment, updateDepartment, deleteDepartment } from '../services/dataService';
import type { Department } from '../types';

type SectionType = 'main' | 'profile' | 'notifications' | 'security' | 'company';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionType>('main');
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const deptData = await getDepartments();
        setDepartments(deptData);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  const sections = [
    { id: 'profile', icon: User, label: 'Profile Settings', desc: 'Update your personal information and profile picture' },
    { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Manage your email and system alert preferences' },
    { id: 'security', icon: Shield, label: 'Security', desc: 'Change your password and enable two-factor authentication' },
    { id: 'company', icon: Globe, label: 'Company Config', desc: 'Manage departments, work hours, and pay rates' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved successfully!');
    setActiveSection('main');
  };

  const updateDepartmentRate = async (id: string, rate: number) => {
    try {
      await updateDepartment(id, { hourlyRate: rate });
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, hourlyRate: rate } : d));
    } catch (error) {
      console.error("Error updating dept rate:", error);
    }
  };

  const updateDepartmentName = async (id: string, name: string) => {
    try {
      await updateDepartment(id, { name });
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, name } : d));
    } catch (error) {
      console.error("Error updating dept name:", error);
    }
  };

  const addNewDepartment = async () => {
    try {
      const newDept = {
        name: 'New Department',
        hourlyRate: 20
      };
      const id = await addDepartment(newDept);
      setDepartments([...departments, { id, ...newDept }]);
    } catch (error) {
      console.error("Error adding dept:", error);
    }
  };

  const removeDepartment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error("Error deleting dept:", error);
    }
  };

  const renderProfile = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-sm">
          AD
        </div>
        <div>
          <h3 className="text-xl font-bold text-black">Admin User</h3>
          <p className="text-black">Administrator</p>
          <button className="mt-2 text-sm text-black font-medium hover:underline">Change Photo</button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-black">First Name</label>
          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black" placeholder="Enter first name" defaultValue="Admin" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-black">Last Name</label>
          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black" placeholder="Enter last name" defaultValue="User" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-black">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="email" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black" placeholder="Enter email" defaultValue="admin@company.com" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-black">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="tel" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black" placeholder="Enter phone" defaultValue="+31 6 1234 5678" />
          </div>
        </div>
        <div className="md:col-span-2 pt-4 flex justify-end">
          <button type="submit" className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
        {[
          { title: 'Email Notifications', desc: 'Receive shift updates and system alerts via email' },
          { title: 'Push Notifications', desc: 'Receive real-time alerts on your browser or mobile device' },
          { title: 'Weekly Reports', desc: 'Get a summary of employee performance and roster efficiency' },
          { title: 'Low Headcount Alerts', desc: 'Notify when shifts are under-staffed based on rules' }
        ].map((item, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-black">{item.title}</p>
              <p className="text-sm text-black">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Save size={18} /> Save Preferences
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <form onSubmit={handleSave} className="max-w-md space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-black">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type={showPassword ? 'text' : 'password'} className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-black">New Password</label>
          <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black" placeholder="••••••••" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-black">Confirm New Password</label>
          <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black" placeholder="••••••••" />
        </div>
        <div className="pt-4">
          <button type="submit" className="w-full bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Update Password
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <h4 className="font-bold text-amber-800 flex items-center gap-2">
          <Shield size={18} /> Two-Factor Authentication
        </h4>
        <p className="text-sm text-amber-700 mt-1">Add an extra layer of security to your account by requiring a code from your phone.</p>
        <button className="mt-3 text-sm font-bold text-black bg-amber-100 px-4 py-2 rounded-lg hover:bg-amber-200 transition-colors">
          Enable 2FA
        </button>
      </div>
    </div>
  );

  const renderCompany = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="font-bold text-black flex items-center gap-2">
            <Clock size={18} /> Standard Work Hours
          </h4>
          <div className="space-y-3">
            {['Monday - Friday', 'Saturday', 'Sunday'].map((day, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
                <span className="text-sm font-medium text-black">{day}</span>
                <div className="flex items-center gap-2">
                  <input type="time" className="text-xs border-none bg-gray-50 rounded p-1 text-black" defaultValue="09:00" />
                  <span className="text-black">-</span>
                  <input type="time" className="text-xs border-none bg-gray-50 rounded p-1 text-black" defaultValue="17:00" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-black flex items-center gap-2">
            <Building size={18} /> Departments & Hourly Rates
          </h4>
          <button
            onClick={addNewDepartment}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} /> Add Department
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg border border-gray-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-black text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Hourly Rate (€)</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departments.map(dept => (
                <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-black">
                    {editingDeptId === dept.id ? (
                      <input
                        type="text"
                        className="w-full px-3 py-1 border border-gray-300 rounded text-black"
                        defaultValue={dept.name}
                        onBlur={(e) => {
                          updateDepartmentName(dept.id, e.target.value);
                          setEditingDeptId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateDepartmentName(dept.id, (e.target as HTMLInputElement).value);
                            setEditingDeptId(null);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-black cursor-pointer" onClick={() => setEditingDeptId(dept.id)}>
                        {dept.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-black">
                    <div className="relative max-w-xs">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="number"
                        step="0.50"
                        min="0"
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                        value={dept.hourlyRate}
                        onChange={(e) => updateDepartmentRate(dept.id, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => removeDepartment(dept.id)}
                      className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button onClick={handleSave} className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Save size={18} /> Save Configuration
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-black">Loading Settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 text-black p-2 rounded-lg">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">
                {activeSection === 'main' ? 'Settings' : sections.find(s => s.id === activeSection)?.label}
              </h1>
              <p className="text-black text-sm">
                {activeSection === 'main'
                  ? 'Configure your REMS account and system preferences'
                  : sections.find(s => s.id === activeSection)?.desc}
              </p>
            </div>
          </div>
          {activeSection !== 'main' && (
            <button
              onClick={() => setActiveSection('main')}
              className="flex items-center gap-2 text-black hover:text-black font-medium transition-colors"
            >
              <ChevronLeft size={20} /> Back to Settings
            </button>
          )}
        </div>

        {activeSection === 'main' ? (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as SectionType)}
                className="flex items-center gap-6 bg-white p-6 rounded-xl border border-gray-100 hover:border-black hover:shadow-md transition-all text-left group"
              >
                <div className="bg-gray-50 text-black group-hover:bg-black group-hover:text-white p-4 rounded-xl transition-colors">
                  <section.icon size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black group-hover:text-black transition-colors">{section.label}</h3>
                  <p className="text-black text-sm mt-1">{section.desc}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            {activeSection === 'profile' && renderProfile()}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'security' && renderSecurity()}
            {activeSection === 'company' && renderCompany()}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-black text-xs">REMS v1.0.0-beta • Built with ❤️ for Modern Workforce Management</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
