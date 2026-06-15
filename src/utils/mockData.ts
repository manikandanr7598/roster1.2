import type { Employee, Shift, Department, Product } from '../types';

export const mockDepartments: Department[] = [
  { id: 'dept-1', name: 'Engineering', hourlyRate: 35 },
  { id: 'dept-2', name: 'Marketing', hourlyRate: 30 },
  { id: 'dept-3', name: 'Human Resources', hourlyRate: 28 },
  { id: 'dept-4', name: 'Sales', hourlyRate: 25 },
  { id: 'dept-5', name: 'Creative', hourlyRate: 32 },
  { id: 'dept-6', name: 'Operations', hourlyRate: 22 }
];

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    phone: '+31 6 1234 5678',
    position: 'Software Engineer',
    department: 'Engineering',
    hireDate: '2023-01-15',
    salary: 75000,
    status: 'Active'
  },
  {
    id: 'emp-2',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@company.com',
    phone: '+31 6 2345 6789',
    position: 'Marketing Manager',
    department: 'Marketing',
    hireDate: '2022-06-20',
    salary: 68000,
    status: 'Active'
  },
  {
    id: 'emp-3',
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.davis@company.com',
    phone: '+31 6 3456 7890',
    position: 'HR Specialist',
    department: 'Human Resources',
    hireDate: '2021-03-10',
    salary: 60000,
    status: 'Active'
  },
  {
    id: 'emp-4',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@company.com',
    phone: '+31 6 4567 8901',
    position: 'Designer',
    department: 'Creative',
    hireDate: '2024-02-01',
    salary: 55000,
    status: 'On Leave'
  },
  {
    id: 'emp-5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@company.com',
    phone: '+31 6 5678 9012',
    position: 'Sales Representative',
    department: 'Sales',
    hireDate: '2020-11-25',
    salary: 58000,
    status: 'Active'
  }
];

export const mockShifts: Shift[] = [
  {
    id: 'shift-1',
    employeeId: 'emp-1',
    date: '2026-06-12',
    startTime: '09:00',
    endTime: '17:00',
    status: 'Scheduled'
  },
  {
    id: 'shift-2',
    employeeId: 'emp-2',
    date: '2026-06-12',
    startTime: '08:00',
    endTime: '16:00',
    status: 'Scheduled'
  },
  {
    id: 'shift-3',
    employeeId: 'emp-3',
    date: '2026-06-13',
    startTime: '10:00',
    endTime: '18:00',
    status: 'Scheduled'
  },
  {
    id: 'shift-4',
    employeeId: 'emp-5',
    date: '2026-06-11',
    startTime: '09:00',
    endTime: '17:00',
    status: 'Completed'
  },
  {
    id: 'shift-5',
    employeeId: 'emp-1',
    date: '2026-06-11',
    startTime: '09:00',
    endTime: '18:00',
    status: 'Completed'
  },
  {
    id: 'shift-6',
    employeeId: 'emp-2',
    date: '2026-06-10',
    startTime: '08:00',
    endTime: '17:00',
    status: 'Completed'
  },
  {
    id: 'shift-7',
    employeeId: 'emp-3',
    date: '2026-06-10',
    startTime: '10:00',
    endTime: '19:00',
    status: 'Completed'
  }
];

export const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Widget A', sku: 'WID-001', category: 'Electronics', quantity: 100, unitPrice: 29.99, reorderLevel: 20, lastUpdated: new Date().toISOString().split('T')[0] },
  { id: 'prod-2', name: 'Widget B', sku: 'WID-002', category: 'Electronics', quantity: 50, unitPrice: 49.99, reorderLevel: 15, lastUpdated: new Date().toISOString().split('T')[0] },
  { id: 'prod-3', name: 'Gadget X', sku: 'GAD-001', category: 'Accessories', quantity: 75, unitPrice: 19.99, reorderLevel: 30, lastUpdated: new Date().toISOString().split('T')[0] },
  { id: 'prod-4', name: 'Gadget Y', sku: 'GAD-002', category: 'Accessories', quantity: 30, unitPrice: 39.99, reorderLevel: 10, lastUpdated: new Date().toISOString().split('T')[0] }
];
