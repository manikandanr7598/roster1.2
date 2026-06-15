import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowUpDown,
  X,
  Save,
  Mail,
  Phone,
  Briefcase,
  Building
} from 'lucide-react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../services/dataService';
import type { Employee } from '../types';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Partial<Employee> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(e => 
      e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleAddEmployee = () => {
    setSelectedEmployee({
      id: '', // Firestore will generate this
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: 'Engineering',
      hireDate: new Date().toISOString().split('T')[0],
      salary: 0,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        await fetchData();
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setIsSaving(true);

    try {
      if (selectedEmployee.id) {
        // Update existing employee
        await updateEmployee(selectedEmployee.id, selectedEmployee);
      } else {
        // Add new employee - remove id before sending
        const { id: _, ...employeeWithoutId } = selectedEmployee;
        // Type assertion because we've validated all required fields
        await addEmployee(employeeWithoutId as Omit<Employee, "id">);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
      alert('Failed to save employee. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-black">Loading Employees...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black">Employee Directory</h1>
          <p className="text-black text-sm mt-1">Manage and track all employees in the system</p>
        </div>
        <button
          onClick={handleAddEmployee}
          className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <Plus size={20} />
          Add New Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, position or department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-black rounded-lg hover:bg-gray-100 text-black transition-colors">
              <Filter size={18} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-black rounded-lg hover:bg-gray-100 text-black transition-colors">
              <ArrowUpDown size={18} />
              Sort
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-black text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Position</th>
                <th className="px-6 py-4 font-semibold">Hire Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-black">{employee.firstName} {employee.lastName}</span>
                        <span className="text-xs text-black">{employee.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-black rounded text-xs font-medium">
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-black">{employee.position}</td>
                  <td className="px-6 py-4 text-black">{employee.hireDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${employee.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : employee.status === 'On Leave' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-black">
          <p>Showing {filteredEmployees.length} of {employees.length} employees</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-black rounded hover:bg-gray-100 text-black">Next</button>
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-bold text-black">
                {selectedEmployee.id ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                    value={selectedEmployee.firstName}
                    onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                    value={selectedEmployee.lastName}
                    onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                      value={selectedEmployee.email}
                      onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, email: e.target.value } : null)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                      value={selectedEmployee.phone}
                      onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Position</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                      value={selectedEmployee.position}
                      onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, position: e.target.value } : null)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Department</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black appearance-none bg-white text-black"
                      value={selectedEmployee.department}
                      onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, department: e.target.value } : null)}
                      required
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Sales">Sales</option>
                      <option value="Creative">Creative</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Hire Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black"
                    value={selectedEmployee.hireDate}
                    onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, hireDate: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Status</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black bg-white text-black"
                    value={selectedEmployee.status}
                    onChange={(e) => setSelectedEmployee(prev => prev ? { ...prev, status: e.target.value as 'Active' | 'On Leave' | 'Terminated' } : null)}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-bold text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-bold disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
