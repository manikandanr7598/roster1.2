export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Terminated';
  avatar?: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
  hourlyRate: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  lastUpdated: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  scheduledShifts: number;
}

export interface CompanySettings {
  standardWeekdayStart: string;
  standardWeekdayEnd: string;
  standardWeekendStart: string;
  standardWeekendEnd: string;
  departments: Department[];
  defaultHourlyRate: number;
}
