import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
  X,
  Trash2,
  Clock,
  Download
} from 'lucide-react';
import { getShifts, getEmployees, addShift, updateShift, deleteShift, formatLocalDate, getTodayLocalDate } from '../services/dataService';
import type { Shift, Employee } from '../types';

const Roster: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'week' | 'month'>('month');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedShift, setSelectedShift] = useState<Partial<Shift> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      console.log("Fetching roster data...");
      const [shiftData, empData] = await Promise.all([
        getShifts(),
        getEmployees()
      ]);
      console.log("Fetched shifts:", shiftData);
      console.log("Fetched employees:", empData);
      setShifts(shiftData);
      setEmployees(empData);
    } catch (error) {
      console.error("Error fetching roster data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDateOfWeek = (startDate: Date, dayOffset: number): Date => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() - startDate.getDay() + 1 + dayOffset);
    return date;
  };

  const getFirstDayOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getEmployeeById = (id: string): Employee | undefined => employees.find(e => e.id === id);

  const getShiftsForDate = (dateStr: string): Shift[] => {
    return shifts.filter(s => s.date === dateStr);
  };

  const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const handleAddShift = (date?: string): void => {
    setSelectedShift({
      id: '', // Firestore will generate
      employeeId: employees[0]?.id || '',
      date: date || getTodayLocalDate(),
      startTime: '09:00',
      endTime: '17:00',
      status: 'Scheduled'
    });
    setIsModalOpen(true);
  };

  const handleEditShift = (shift: Shift): void => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleDeleteShift = async (id: string): Promise<void> => {
    try {
      await deleteShift(id);
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  const handleSaveShift = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    console.log("handleSaveShift called with selectedShift:", selectedShift);
    console.log("selectedShift.employeeId:", selectedShift?.employeeId);
    console.log("Employees array:", employees);
    
    if (!selectedShift) {
      console.error("No selected shift!");
      return;
    }
    
    if (!selectedShift.employeeId) {
      console.error("No employee ID selected!");
      alert("Please select an employee.");
      return;
    }
    
    if (!selectedShift.date) {
      console.error("No date selected!");
      alert("Please select a date.");
      return;
    }
    
    if (!selectedShift.startTime || !selectedShift.endTime) {
      console.error("No time selected!");
      alert("Please select start and end times.");
      return;
    }
    
    setIsSaving(true);

    try {
      console.log("About to save shift:", selectedShift);
      if (selectedShift.id) {
        console.log("Updating existing shift with id:", selectedShift.id);
        await updateShift(selectedShift.id, selectedShift);
      } else {
        console.log("Adding new shift...");
        // Remove id before sending to addShift
        const { id: _, ...shiftWithoutId } = selectedShift;
        // Type assertion because we've validated all required fields
        await addShift(shiftWithoutId as Omit<Shift, "id">);
      }
      console.log("Shift saved successfully!");
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving shift:", error);
      alert(`Failed to save shift: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadRoster = (): void => {
    const reportData = [
      ['Roster Report - Generated on', new Date().toLocaleDateString()],
      [],
      ['Employee', 'Date', 'Start Time', 'End Time', 'Status']
    ];
    shifts.forEach(shift => {
      const employee = getEmployeeById(shift.employeeId);
      if (employee) {
        reportData.push([
          `${employee.firstName} ${employee.lastName}`,
          shift.date,
          shift.startTime,
          shift.endTime,
          shift.status
        ]);
      }
    });

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `roster-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMonthCalendar = () => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const weeks = [];
    const today = new Date();

    const startDay = (firstDay.getDay() + 6) % 7;
    let currentWeek = [];

    for (let i = 0; i < startDay; i++) {
      currentWeek.push(<td key={`empty-start-${i}`} className="border border-gray-100"></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatLocalDate(currentDateObj);
      const shiftsForDay = getShiftsForDate(dateStr);
      const isTodayBool = isSameDay(currentDateObj, today);

      currentWeek.push(
        <td
          key={day}
          className={`border border-gray-100 p-2 align-top min-h-[120px] w-[14.28%] cursor-pointer hover:bg-gray-100 transition-colors ${isTodayBool ? 'bg-gray-100' : ''}`}
          onClick={() => handleAddShift(dateStr)}
        >
          <div className={`text-sm font-semibold mb-1 ${isTodayBool ? 'text-black' : 'text-gray-800'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {shiftsForDay.slice(0, 3).map(shift => {
              const employee = getEmployeeById(shift.employeeId);
              return (
                <div
                  key={shift.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditShift(shift);
                  }}
                  className={`p-1 rounded text-xs cursor-pointer hover:brightness-95 transition-all ${shift.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : shift.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                >
                  <div className="font-medium truncate">{employee?.firstName} {employee?.lastName}</div>
                  <div className="text-[10px] opacity-75">{shift.startTime} - {shift.endTime}</div>
                </div>
              );
            })}
            {shiftsForDay.length > 3 && (
              <div className="text-[10px] text-gray-500 font-medium">+{shiftsForDay.length - 3} more</div>
            )}
          </div>
        </td>
      );

      if ((startDay + day) % 7 === 0) {
        weeks.push(<tr key={weeks.length}>{currentWeek}</tr>);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(<td key={`empty-end-${currentWeek.length}`} className="border border-gray-100"></td>);
      }
      weeks.push(<tr key={weeks.length}>{currentWeek}</tr>);
    }

    return weeks;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-black">Loading Roster...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 text-purple-700 p-2 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Shift Roster</h1>
            <p className="text-black text-sm mt-1">View and manage employee schedules</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadRoster}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-black rounded-lg hover:bg-gray-100 text-black transition-colors font-medium"
          >
            <Download size={18} />
            Download Roster
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${view === 'month' ? 'bg-black text-white' : 'bg-white border border-black text-black hover:bg-gray-100'}`}
            onClick={() => setView('month')}
          >
            <CalendarIcon size={18} />
            Month
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${view === 'week' ? 'bg-black text-white' : 'bg-white border border-black text-black hover:bg-gray-100'}`}
            onClick={() => setView('week')}
          >
            <CalendarDays size={18} />
            Week
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">
            {view === 'month'
              ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : `Week of ${getDateOfWeek(currentDate, 0).toLocaleDateString()} - ${getDateOfWeek(currentDate, 6).toLocaleDateString()}`
            }
          </h3>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center bg-white border border-black p-2 rounded-lg hover:bg-gray-100 text-black"
              onClick={() => {
                const newDate = new Date(currentDate);
                if (view === 'month') {
                  newDate.setMonth(newDate.getMonth() - 1);
                } else {
                  newDate.setDate(newDate.getDate() - 7);
                }
                setCurrentDate(newDate);
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </button>
            <button
              className="flex items-center justify-center bg-white border border-black p-2 rounded-lg hover:bg-gray-100 text-black"
              onClick={() => {
                const newDate = new Date(currentDate);
                if (view === 'month') {
                  newDate.setMonth(newDate.getMonth() + 1);
                } else {
                  newDate.setDate(newDate.getDate() + 7);
                }
                setCurrentDate(newDate);
              }}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => handleAddShift()}
              className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors font-medium ml-2"
            >
              <Plus size={20} />
              Add Shift
            </button>
          </div>
        </div>

        {view === 'month' ? (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gray-50 text-black text-sm uppercase tracking-wider">
                  {weekDays.map(day => (
                    <th key={day} className="px-6 py-4 font-semibold border-r border-gray-100 last:border-r-0">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {renderMonthCalendar()}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-black text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold min-w-[150px]">Employee</th>
                  {weekDays.map((day, index) => (
                    <th key={day} className="px-6 py-4 font-semibold text-center min-w-[100px]">
                      <div>{day}</div>
                      <div className="text-black font-normal">
                        {getDateOfWeek(currentDate, index).getDate()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-black">{employee.firstName} {employee.lastName}</span>
                          <span className="text-xs text-black">{employee.position}</span>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((_, dayIndex) => {
              const date = formatLocalDate(getDateOfWeek(currentDate, dayIndex));
              const shift = shifts.find(s => s.employeeId === employee.id && s.date === date);
              return (
                <td
                  key={dayIndex}
                  className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => shift ? handleEditShift(shift) : handleAddShift(date)}
                >
                  {shift ? (
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${shift.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : shift.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {shift.startTime} - {shift.endTime}
                    </div>
                  ) : (
                    <span className="text-black text-xs">—</span>
                  )}
                </td>
              );
            })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Upcoming Shifts</h3>
          <span className="text-xs font-bold text-black uppercase tracking-widest">Next 4 Shifts</span>
        </div>
        <div className="divide-y divide-gray-100">
          {shifts.filter(s => new Date(s.date) >= new Date()).slice(0, 4).map((shift) => {
            const employee = getEmployeeById(shift.employeeId);
            return (
              <div
                key={shift.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleEditShift(shift)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                    {employee?.firstName[0]}{employee?.lastName[0]}
                  </div>
                  <div>
                    <p className="font-bold text-black">{employee?.firstName} {employee?.lastName}</p>
                    <p className="text-xs text-black flex items-center gap-1">
                      <Clock size={12} /> {shift.date} • {shift.startTime} - {shift.endTime}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${shift.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : shift.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {shift.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shift Modal */}
      {isModalOpen && selectedShift && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-bold text-black">
                {selectedShift.id ? 'Edit Shift' : 'Add New Shift'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Employee</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black bg-white"
                  value={selectedShift.employeeId}
                  onChange={(e) => {
                    console.log("Employee selected, value:", e.target.value);
                    setSelectedShift(prev => prev ? { ...prev, employeeId: e.target.value } : null);
                  }}
                  required
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black bg-white"
                  value={selectedShift.date}
                  onChange={(e) => setSelectedShift(prev => prev ? { ...prev, date: e.target.value } : null)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Start Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black bg-white"
                    value={selectedShift.startTime}
                    onChange={(e) => setSelectedShift(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">End Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black bg-white"
                    value={selectedShift.endTime}
                    onChange={(e) => setSelectedShift(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Status</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-black bg-white"
                  value={selectedShift.status}
                  onChange={(e) => setSelectedShift(prev => prev ? { ...prev, status: e.target.value as Shift['status'] } : null)}
                  required
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {selectedShift.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteShift(selectedShift.id!)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-bold"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-bold disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roster;
