import React, { useState, useEffect } from 'react';
import {
  Euro,
  Download,
  Users,
  Clock
} from 'lucide-react';
import { getEmployees, getShifts, getDepartments, formatLocalDate } from '../services/dataService';
import type { Employee, Shift, Department } from '../types';

const Pay: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'fortnight'>('fortnight');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empData, shiftData, deptData] = await Promise.all([
          getEmployees(),
          getShifts(),
          getDepartments()
        ]);
        setEmployees(empData);
        setShifts(shiftData);
        setDepartments(deptData);
      } catch (error) {
        console.error("Error fetching pay data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateHours = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    let hours = endHour - startHour;
    let mins = endMin - startMin;
    if (mins < 0) {
      hours -= 1;
      mins += 60;
    }
    return hours + (mins / 60);
  };

  const isDateInPeriod = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const startOfFortnight = new Date(startOfWeek);
    const endOfFortnight = new Date(startOfFortnight);
    endOfFortnight.setDate(startOfFortnight.getDate() + 13);

    if (selectedPeriod === 'month') {
      return date.getFullYear() === year && date.getMonth() === month;
    } else if (selectedPeriod === 'fortnight') {
      return date >= startOfFortnight && date <= endOfFortnight;
    } else {
      return date >= startOfWeek && date <= endOfWeek;
    }
  };

  const getDepartmentRate = (deptName: string): number => {
    const dept = departments.find(d => d.name === deptName);
    return dept?.hourlyRate || 20;
  };

  const employeePay = employees.map(employee => {
    const employeeShifts = shifts.filter(s => s.employeeId === employee.id && isDateInPeriod(s.date));
    const totalHours = employeeShifts.reduce((acc, shift) => acc + calculateHours(shift.startTime, shift.endTime), 0);
    const hourlyRate = getDepartmentRate(employee.department);
    const totalPay = totalHours * hourlyRate;
    return { employee, totalHours, hourlyRate, totalPay };
  });

  const grandTotal = employeePay.reduce((acc, ep) => acc + ep.totalPay, 0);
  const totalHoursWorked = employeePay.reduce((acc, ep) => acc + ep.totalHours, 0);

  const handleDownloadPayroll = (): void => {
    const reportData = [
      ['Payroll Report - ' + selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1) + ' Ending',
        new Date().toLocaleDateString()],
      [],
      ['Employee', 'Department', 'Hourly Rate (€)', 'Total Hours', 'Total Pay (€)']
    ];
    employeePay.forEach(ep => {
      reportData.push([
        `${ep.employee.firstName} ${ep.employee.lastName}`,
        ep.employee.department,
        ep.hourlyRate.toFixed(2),
        ep.totalHours.toFixed(2),
        ep.totalPay.toFixed(2)
      ]);
    });
    reportData.push([]);
    reportData.push(['', '', '', 'Total:', grandTotal.toFixed(2)]);

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateRange = (): string => {
    if (selectedPeriod === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (selectedPeriod === 'fortnight') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 13);
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    } else {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
  };

  const handlePrevPeriod = (): void => {
    const newDate = new Date(currentDate);
    if (selectedPeriod === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (selectedPeriod === 'fortnight') {
      newDate.setDate(newDate.getDate() - 14);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = (): void => {
    const newDate = new Date(currentDate);
    if (selectedPeriod === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (selectedPeriod === 'fortnight') {
      newDate.setDate(newDate.getDate() + 14);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-black">Loading Payroll...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
            <Euro size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Payroll & Compensation</h1>
            <p className="text-black text-sm mt-1">Calculate and track employee pay based on hours worked</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPayroll}
            className="flex items-center gap-2 px-4 py-2 bg-black border border-black rounded-lg text-white font-medium transition-colors"
          >
            <Download size={18} />
            Download Payroll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <Users size={20} />
            </div>
            <span className="text-sm text-black font-medium">Total Employees</span>
          </div>
          <h3 className="text-2xl font-bold text-black">{employees.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
              <Clock size={20} />
            </div>
            <span className="text-sm text-black font-medium">Total Hours</span>
          </div>
          <h3 className="text-2xl font-bold text-black">{totalHoursWorked.toFixed(2)}h</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
              <Euro size={20} />
            </div>
            <span className="text-sm text-black font-medium">Total Payroll</span>
          </div>
          <h3 className="text-2xl font-bold text-black">€{grandTotal.toFixed(2)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevPeriod}
              className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="text-center">
              <h3 className="text-lg font-bold text-black">{formatDateRange()}</h3>
            </div>
            <button
              onClick={handleNextPeriod}
              className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === 'fortnight' ? 'bg-black text-white' : 'bg-white border border-gray-200 text-black hover:bg-gray-50'}`}
              onClick={() => setSelectedPeriod('fortnight')}
            >
              Fortnightly
            </button>
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === 'month' ? 'bg-black text-white' : 'bg-white border border-gray-200 text-black hover:bg-gray-50'}`}
              onClick={() => setSelectedPeriod('month')}
            >
              Monthly
            </button>
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === 'week' ? 'bg-black text-white' : 'bg-white border border-gray-200 text-black hover:bg-gray-50'}`}
              onClick={() => setSelectedPeriod('week')}
            >
              Weekly
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-black text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Position</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Hourly Rate</th>
                <th className="px-6 py-4 font-semibold">Total Hours</th>
                <th className="px-6 py-4 font-semibold text-right">Total Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employeePay.map((ep) => (
                <tr key={ep.employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {ep.employee.firstName[0]}{ep.employee.lastName[0]}
                      </div>
                      <span className="font-medium text-black">{ep.employee.firstName} {ep.employee.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black">{ep.employee.position}</td>
                  <td className="px-6 py-4 text-black">{ep.employee.department}</td>
                  <td className="px-6 py-4 text-black">€{ep.hourlyRate.toFixed(2)}/hr</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-medium">
                      {ep.totalHours.toFixed(2)}h
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-emerald-600">€{ep.totalPay.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-xl">
          <span className="text-lg font-bold text-black">Grand Total</span>
          <span className="text-2xl font-bold text-emerald-600">€{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Pay;
