import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { mockEmployees, mockShifts, mockDepartments, mockProducts } from "../utils/mockData";
import type { Employee, Shift, Department, Product } from "../types";

// Helper: Get local date in YYYY-MM-DD format
const getLocalDateString = (date?: Date): string => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// In-memory fallback
let useFirebase = true;
let inMemoryEmployees: Employee[] = [...mockEmployees];
let inMemoryShifts: Shift[] = [...mockShifts];
let inMemoryDepartments: Department[] = [...mockDepartments];
let inMemoryProducts: Product[] = [...mockProducts];
let isSeeding = false;

// ------------------------------
// Employees CRUD
// ------------------------------
export const getEmployees = async (): Promise<Employee[]> => {
  console.log("getEmployees called, useFirebase:", useFirebase);
  if (!useFirebase) return inMemoryEmployees;

  try {
    const querySnapshot = await getDocs(collection(db, "employees"));
    console.log("getEmployees querySnapshot empty:", querySnapshot.empty);
    if (querySnapshot.empty && !isSeeding) {
      console.log("Seeding initial data...");
      await seedInitialData();
      console.log("Seed complete, fetching fresh employees...");
      const freshQuerySnapshot = await getDocs(collection(db, "employees"));
      const employees = freshQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      console.log("getEmployees mapped employees:", employees);
      const uniqueEmployees = Array.from(new Map(employees.map(e => [e.id, e])).values());
      inMemoryEmployees = uniqueEmployees;
      return uniqueEmployees;
    }
    const employees = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
    console.log("getEmployees mapped employees:", employees);
    // Remove duplicates by id
    const uniqueEmployees = Array.from(new Map(employees.map(e => [e.id, e])).values());
    inMemoryEmployees = uniqueEmployees;
    console.log("getEmployees returning uniqueEmployees:", uniqueEmployees);
    return uniqueEmployees;
  } catch (error) {
    console.error("Error getting employees, using fallback:", error);
    useFirebase = false;
    return inMemoryEmployees;
  }
};

export const addEmployee = async (employee: Omit<Employee, "id">): Promise<string> => {
  if (!useFirebase) {
    const id = `emp-${Date.now()}`;
    inMemoryEmployees.push({ ...employee, id });
    return id;
  }

  try {
    const docRef = await addDoc(collection(db, "employees"), {
      ...employee,
      createdAt: serverTimestamp(),
    });
    const newEmployee = { ...employee, id: docRef.id };
    inMemoryEmployees.push(newEmployee);
    return docRef.id;
  } catch (error) {
    console.error("Error adding employee, using fallback:", error);
    useFirebase = false;
    const id = `emp-${Date.now()}`;
    inMemoryEmployees.push({ ...employee, id });
    return id;
  }
};

export const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<boolean> => {
  if (!useFirebase) {
    inMemoryEmployees = inMemoryEmployees.map(e => e.id === id ? { ...e, ...updates } : e);
    return true;
  }

  try {
    const employeeRef = doc(db, "employees", id);
    await updateDoc(employeeRef, updates);
    inMemoryEmployees = inMemoryEmployees.map(e => e.id === id ? { ...e, ...updates } : e);
    return true;
  } catch (error) {
    console.error("Error updating employee, using fallback:", error);
    useFirebase = false;
    inMemoryEmployees = inMemoryEmployees.map(e => e.id === id ? { ...e, ...updates } : e);
    return true;
  }
};

export const deleteEmployee = async (id: string): Promise<boolean> => {
  if (!useFirebase) {
    inMemoryEmployees = inMemoryEmployees.filter(e => e.id !== id);
    return true;
  }

  try {
    await deleteDoc(doc(db, "employees", id));
    inMemoryEmployees = inMemoryEmployees.filter(e => e.id !== id);
    return true;
  } catch (error) {
    console.error("Error deleting employee, using fallback:", error);
    useFirebase = false;
    inMemoryEmployees = inMemoryEmployees.filter(e => e.id !== id);
    return true;
  }
};

// ------------------------------
// Shifts CRUD
// ------------------------------
export const getShifts = async (): Promise<Shift[]> => {
  if (!useFirebase) return inMemoryShifts;

  try {
    const querySnapshot = await getDocs(collection(db, "shifts"));
    if (querySnapshot.empty) {
      return mockShifts;
    }
    const shifts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
    const uniqueShifts = Array.from(new Map(shifts.map(s => [s.id, s])).values());
    inMemoryShifts = uniqueShifts;
    return uniqueShifts;
  } catch (error) {
    console.error("Error getting shifts, using fallback:", error);
    useFirebase = false;
    return inMemoryShifts;
  }
};

export const addShift = async (shift: Omit<Shift, "id">): Promise<string> => {
  if (!useFirebase) {
    const id = `shift-${Date.now()}`;
    inMemoryShifts.push({ ...shift, id });
    return id;
  }

  try {
    const docRef = await addDoc(collection(db, "shifts"), {
      ...shift,
      createdAt: serverTimestamp(),
    });
    const newShift = { ...shift, id: docRef.id };
    inMemoryShifts.push(newShift);
    return docRef.id;
  } catch (error) {
    console.error("Error adding shift, using fallback:", error);
    useFirebase = false;
    const id = `shift-${Date.now()}`;
    inMemoryShifts.push({ ...shift, id });
    return id;
  }
};

export const updateShift = async (id: string, updates: Partial<Shift>): Promise<boolean> => {
  if (!useFirebase) {
    inMemoryShifts = inMemoryShifts.map(s => s.id === id ? { ...s, ...updates } : s);
    return true;
  }

  try {
    const shiftRef = doc(db, "shifts", id);
    await updateDoc(shiftRef, updates);
    inMemoryShifts = inMemoryShifts.map(s => s.id === id ? { ...s, ...updates } : s);
    return true;
  } catch (error) {
    console.error("Error updating shift, using fallback:", error);
    useFirebase = false;
    inMemoryShifts = inMemoryShifts.map(s => s.id === id ? { ...s, ...updates } : s);
    return true;
  }
};

export const deleteShift = async (id: string): Promise<boolean> => {
  if (!useFirebase) {
    inMemoryShifts = inMemoryShifts.filter(s => s.id !== id);
    return true;
  }

  try {
    await deleteDoc(doc(db, "shifts", id));
    inMemoryShifts = inMemoryShifts.filter(s => s.id !== id);
    return true;
  } catch (error) {
    console.error("Error deleting shift, using fallback:", error);
    useFirebase = false;
    inMemoryShifts = inMemoryShifts.filter(s => s.id !== id);
    return true;
  }
};

// ------------------------------
// Departments CRUD
// ------------------------------
export const getDepartments = async (): Promise<Department[]> => {
  if (!useFirebase) return inMemoryDepartments;

  try {
    const querySnapshot = await getDocs(collection(db, "departments"));
    if (querySnapshot.empty) {
      return mockDepartments;
    }
    const departments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
    const uniqueDepartments = Array.from(new Map(departments.map(d => [d.id, d])).values());
    inMemoryDepartments = uniqueDepartments;
    return uniqueDepartments;
  } catch (error) {
    console.error("Error getting departments, using fallback:", error);
    useFirebase = false;
    return inMemoryDepartments;
  }
};

export const addDepartment = async (department: Omit<Department, "id">): Promise<string> => {
  if (!useFirebase) {
    const id = `dept-${Date.now()}`;
    inMemoryDepartments.push({ ...department, id });
    return id;
  }

  try {
    const docRef = await addDoc(collection(db, "departments"), {
      ...department,
      createdAt: serverTimestamp(),
    });
    const newDepartment = { ...department, id: docRef.id };
    inMemoryDepartments.push(newDepartment);
    return docRef.id;
  } catch (error) {
    console.error("Error adding department, using fallback:", error);
    useFirebase = false;
    const id = `dept-${Date.now()}`;
    inMemoryDepartments.push({ ...department, id });
    return id;
  }
};

export const updateDepartment = async (id: string, updates: Partial<Department>): Promise<boolean> => {
  if (!useFirebase) {
    inMemoryDepartments = inMemoryDepartments.map(d => d.id === id ? { ...d, ...updates } : d);
    return true;
  }

  try {
    const deptRef = doc(db, "departments", id);
    await updateDoc(deptRef, updates);
    inMemoryDepartments = inMemoryDepartments.map(d => d.id === id ? { ...d, ...updates } : d);
    return true;
  } catch (error) {
    console.error("Error updating department, using fallback:", error);
    useFirebase = false;
    inMemoryDepartments = inMemoryDepartments.map(d => d.id === id ? { ...d, ...updates } : d);
    return true;
  }
};

export const deleteDepartment = async (id: string): Promise<boolean> => {
  if (!useFirebase) {
    inMemoryDepartments = inMemoryDepartments.filter(d => d.id !== id);
    return true;
  }

  try {
    await deleteDoc(doc(db, "departments", id));
    inMemoryDepartments = inMemoryDepartments.filter(d => d.id !== id);
    return true;
  } catch (error) {
    console.error("Error deleting department, using fallback:", error);
    useFirebase = false;
    inMemoryDepartments = inMemoryDepartments.filter(d => d.id !== id);
    return true;
  }
};

// ------------------------------
// Products CRUD
// ------------------------------
export const getProducts = async (): Promise<Product[]> => {
  if (!useFirebase) return inMemoryProducts;

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    if (querySnapshot.empty) {
      return mockProducts;
    }
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    const uniqueProducts = Array.from(new Map(products.map(p => [p.id, p])).values());
    inMemoryProducts = uniqueProducts;
    return uniqueProducts;
  } catch (error) {
    console.error("Error getting products, using fallback:", error);
    useFirebase = false;
    return inMemoryProducts;
  }
};

export const addProduct = async (product: Omit<Product, "id">): Promise<string> => {
  if (!useFirebase) {
    const id = `prod-${Date.now()}`;
    inMemoryProducts.push({ ...product, id });
    return id;
  }

  try {
    const docRef = await addDoc(collection(db, "products"), {
      ...product,
      createdAt: serverTimestamp(),
    });
    const newProduct = { ...product, id: docRef.id };
    inMemoryProducts.push(newProduct);
    return docRef.id;
  } catch (error) {
    console.error("Error adding product, using fallback:", error);
    useFirebase = false;
    const id = `prod-${Date.now()}`;
    inMemoryProducts.push({ ...product, id });
    return id;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
  if (!useFirebase) {
    inMemoryProducts = inMemoryProducts.map(p => p.id === id ? { ...p, ...updates } : p);
    return true;
  }

  try {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, updates);
    inMemoryProducts = inMemoryProducts.map(p => p.id === id ? { ...p, ...updates } : p);
    return true;
  } catch (error) {
    console.error("Error updating product, using fallback:", error);
    useFirebase = false;
    inMemoryProducts = inMemoryProducts.map(p => p.id === id ? { ...p, ...updates } : p);
    return true;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!useFirebase) {
    inMemoryProducts = inMemoryProducts.filter(p => p.id !== id);
    return true;
  }

  try {
    await deleteDoc(doc(db, "products", id));
    inMemoryProducts = inMemoryProducts.filter(p => p.id !== id);
    return true;
  } catch (error) {
    console.error("Error deleting product, using fallback:", error);
    useFirebase = false;
    inMemoryProducts = inMemoryProducts.filter(p => p.id !== id);
    return true;
  }
};

// ------------------------------
// Seed Initial Data
// ------------------------------
const seedInitialData = async (): Promise<void> => {
  if (isSeeding) {
    console.log("Already seeding, skipping...");
    return;
  }
  isSeeding = true;
  console.log("seedInitialData called");
  try {
    // Seed Departments
    console.log("Seeding departments...");
    for (const dept of mockDepartments) {
      await addDoc(collection(db, "departments"), {
        name: dept.name,
        hourlyRate: dept.hourlyRate,
        createdAt: serverTimestamp(),
      });
    }
    console.log("Departments seeded");
    
    // Seed Employees
    console.log("Seeding employees...");
    for (const emp of mockEmployees) {
      await addDoc(collection(db, "employees"), {
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone,
        position: emp.position,
        department: emp.department,
        hireDate: emp.hireDate,
        salary: emp.salary,
        status: emp.status,
        createdAt: serverTimestamp(),
      });
    }
    console.log("Employees seeded");
    
    // Seed Shifts
    console.log("Seeding shifts...");
    for (const shift of mockShifts) {
      await addDoc(collection(db, "shifts"), {
        employeeId: shift.employeeId,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        status: shift.status,
        notes: shift.notes || '',
        createdAt: serverTimestamp(),
      });
    }
    console.log("Shifts seeded");
    
    // Seed Products
    console.log("Seeding products...");
    for (const product of mockProducts) {
      await addDoc(collection(db, "products"), {
        name: product.name,
        sku: product.sku,
        category: product.category,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        reorderLevel: product.reorderLevel,
        lastUpdated: product.lastUpdated,
        createdAt: serverTimestamp(),
      });
    }
    console.log("Products seeded");
  } catch (error) {
    console.error("Error seeding initial data:", error);
  } finally {
    isSeeding = false;
  }
};

// Helper for local date string
export const getTodayLocalDate = (): string => getLocalDateString();
export const formatLocalDate = (date: Date): string => getLocalDateString(date);
