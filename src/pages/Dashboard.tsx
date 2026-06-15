import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { getEmployees, getShifts } from '../services/dataService';
import type { Employee, Shift } from '../types';

const data = [
  { name: 'Mon', headcount: 5, shifts: 4 },
  { name: 'Tue', headcount: 5, shifts: 5 },
  { name: 'Wed', headcount: 4, shifts: 4 },
  { name: 'Thu', headcount: 5, shifts: 5 },
  { name: 'Fri', headcount: 5, shifts: 5 },
  { name: 'Sat', headcount: 2, shifts: 2 },
  { name: 'Sun', headcount: 2, shifts: 1 }
];

const COLORS = ['#000000', '#666666', '#999999', '#cccccc', '#eeeeee'];

const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empData, shiftData] = await Promise.all([
          getEmployees(),
          getShifts()
        ]);
        setEmployees(empData);
        setShifts(shiftData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-black">Loading REMS Dashboard...</div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Employees',
      value: employees.length,
      icon: Users,
      color: 'text-black',
      bg: 'bg-gray-100',
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Active Employees',
      value: employees.filter(p => p.status === 'Active').length,
      icon: Users,
      color: 'text-emerald-700',
      bg: 'bg-emerald-100',
      trend: '+5%',
      trendUp: true
    },
    {
      label: 'Scheduled Shifts',
      value: shifts.length,
      icon: CalendarCheck,
      color: 'text-purple-700',
      bg: 'bg-purple-100',
      trend: '-2%',
      trendUp: false
    },
    {
      label: 'On Leave',
      value: employees.filter(p => p.status === 'On Leave').length,
      icon: AlertTriangle,
      color: 'text-amber-700',
      bg: 'bg-amber-100',
      trend: '0%',
      trendUp: true
    }
  ];

  const deptData = [
    { department: 'Engineering', count: employees.filter(e => e.department === 'Engineering').length },
    { department: 'Marketing', count: employees.filter(e => e.department === 'Marketing').length },
    { department: 'HR', count: employees.filter(e => e.department === 'Human Resources').length },
    { department: 'Creative', count: employees.filter(e => e.department === 'Creative').length },
    { department: 'Sales', count: employees.filter(e => e.department === 'Sales').length }
  ];

  const handleDownloadReport = () => {
    const reportData = [
      ['Employee Report - Generated on', new Date().toLocaleDateString()],
      [],
      ['Name', 'Email', 'Position', 'Department', 'Hire Date', 'Status'],
      ...employees.map(emp => [
        `${emp.firstName} ${emp.lastName}`,
        emp.email,
        emp.position,
        emp.department,
        emp.hireDate,
        emp.status
      ])
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employee-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddEmployee = () => {
    window.location.href = '/employees';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black">Dashboard Overview</h1>
          <p className="text-black text-sm mt-1">Welcome back, Admin! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-black rounded-lg text-sm font-medium text-black hover:bg-gray-100 transition-colors"
          >
            <Download size={18} />
            Download Report
          </button>
          <button
            onClick={handleAddEmployee}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-700' : 'text-red-700'}`}>
                {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm text-black font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-black mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-black">Weekly Headcount</h3>
            <select className="text-xs border-none bg-gray-50 rounded p-1 font-medium text-black">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeeee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#000000', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#000000', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #000', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="headcount" stroke="#000000" strokeWidth={3} dot={{ r: 4, fill: '#000000' }} activeDot={{ r: 6 }} name="Headcount" />
                <Line type="monotone" dataKey="shifts" stroke="#000000" strokeWidth={3} dot={{ r: 4, fill: '#000000' }} activeDot={{ r: 6 }} name="Shifts" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-black">Employees by Department</h3>
            <button className="text-xs font-bold text-black hover:underline">View All</button>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeeee" />
                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#000000', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#000000', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#fafafa' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #000', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
          {deptData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Recent Employee Updates</h3>
          <button className="text-sm font-bold text-black hover:underline">View Directory</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-black text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Position</th>
                <th className="px-6 py-4 font-semibold">Hire Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.slice(0, 5).map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black font-bold text-xs">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <span className="font-medium text-black">{employee.firstName} {employee.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black text-sm font-medium">{employee.department}</td>
                  <td className="px-6 py-4 text-black text-sm">{employee.position}</td>
                  <td className="px-6 py-4 text-black text-sm">{employee.hireDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${employee.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : employee.status === 'On Leave'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
