// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "admin" | "student" | "parent" | "teacher";
export type DisplayCategory = "11th" | "12th" | "Gap";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  studentId?: string; // for parent/student role
  subject?: string;   // for teacher role
  displayCategory?: DisplayCategory; // for student/parent redirection
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  displayCategory: DisplayCategory;
  group: string;
  totalFees: number;
  parentName: string;
  parentPhone: string;
  enrolledDate: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: "present" | "absent" | "late";
  subject: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string; // e.g. "2025-06"
  amount: number;
  status: "paid" | "pending" | "overdue";
  paidOn?: string;
  dueDate: string;
  description: string;
}

export interface TestResult {
  id: string;
  studentId: string;
  subject: string;
  testName: string;
  date: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: "low" | "medium" | "high";
  targetRole: "all" | "student" | "parent";
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

export const SEED_STUDENTS: Student[] = [
  { id: "s1", name: "Aarav Sharma", email: "aarav@student.com", phone: "9876543210", displayCategory: "11th", group: "PCM", totalFees: 25000, parentName: "Rajesh Sharma", parentPhone: "9876543200", enrolledDate: "2025-01-10" },
  { id: "s2", name: "Priya Patel", email: "priya@student.com", phone: "9876543211", displayCategory: "12th", group: "PCB", totalFees: 30000, parentName: "Suresh Patel", parentPhone: "9876543201", enrolledDate: "2025-01-12" },
  { id: "s3", name: "Rohan Mehta", email: "rohan@student.com", phone: "9876543212", displayCategory: "Gap", group: "Math", totalFees: 28000, parentName: "Anita Mehta", parentPhone: "9876543202", enrolledDate: "2025-01-15" },
  { id: "s4", name: "Sneha Gupta", email: "sneha@student.com", phone: "9876543213", displayCategory: "11th", group: "PCM", totalFees: 25000, parentName: "Vikas Gupta", parentPhone: "9876543203", enrolledDate: "2025-02-01" },
  { id: "s5", name: "Arjun Singh", email: "arjun@student.com", phone: "9876543214", displayCategory: "12th", group: "PCB", totalFees: 22000, parentName: "Harpreet Singh", parentPhone: "9876543204", enrolledDate: "2025-02-05" },
  { id: "s6", name: "Kavya Nair", email: "kavya@student.com", phone: "9876543215", displayCategory: "Gap", group: "Physics", totalFees: 30000, parentName: "Lakshmi Nair", parentPhone: "9876543205", enrolledDate: "2025-02-10" },
];

export const SEED_USERS: User[] = [
  { id: "u0", name: "Admin", email: "admin@educoach.com", password: "admin123", role: "admin" },
  { id: "u1", name: "Aarav Sharma", email: "aarav@student.com", password: "student123", role: "student", studentId: "s1", displayCategory: "11th" },
  { id: "u2", name: "Priya Patel", email: "priya@student.com", password: "student123", role: "student", studentId: "s2", displayCategory: "12th" },
  { id: "u3", name: "Rohan Mehta", email: "rohan@student.com", password: "student123", role: "student", studentId: "s3", displayCategory: "Gap" },
  { id: "u4", name: "Rajesh Sharma", email: "rajesh@parent.com", password: "parent123", role: "parent", studentId: "s1", displayCategory: "11th" },
  { id: "u5", name: "Suresh Patel", email: "suresh@parent.com", password: "parent123", role: "parent", studentId: "s2", displayCategory: "12th" },
  { id: "u6", name: "Vikram Sir", email: "vikram@teacher.com", password: "teacher123", role: "teacher", subject: "Mathematics" },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };

export const SEED_ATTENDANCE: AttendanceRecord[] = [
  // Aarav (s1)
  { id: "a1", studentId: "s1", date: daysAgo(0), status: "present", subject: "Mathematics" },
  { id: "a2", studentId: "s1", date: daysAgo(1), status: "present", subject: "Mathematics" },
  { id: "a3", studentId: "s1", date: daysAgo(2), status: "absent", subject: "Mathematics" },
  { id: "a4", studentId: "s1", date: daysAgo(3), status: "present", subject: "Mathematics" },
  { id: "a5", studentId: "s1", date: daysAgo(4), status: "late", subject: "Mathematics" },
  { id: "a6", studentId: "s1", date: daysAgo(5), status: "present", subject: "Mathematics" },
  { id: "a7", studentId: "s1", date: daysAgo(6), status: "present", subject: "Mathematics" },
  { id: "a8", studentId: "s1", date: daysAgo(7), status: "present", subject: "Mathematics" },
  { id: "a9", studentId: "s1", date: daysAgo(8), status: "absent", subject: "Mathematics" },
  { id: "a10", studentId: "s1", date: daysAgo(9), status: "present", subject: "Mathematics" },
  // Priya (s2)
  { id: "a11", studentId: "s2", date: daysAgo(0), status: "present", subject: "Physics" },
  { id: "a12", studentId: "s2", date: daysAgo(1), status: "absent", subject: "Physics" },
  { id: "a13", studentId: "s2", date: daysAgo(2), status: "present", subject: "Physics" },
  { id: "a14", studentId: "s2", date: daysAgo(3), status: "present", subject: "Physics" },
  { id: "a15", studentId: "s2", date: daysAgo(4), status: "present", subject: "Physics" },
  // Rohan (s3)
  { id: "a16", studentId: "s3", date: daysAgo(0), status: "absent", subject: "Chemistry" },
  { id: "a17", studentId: "s3", date: daysAgo(1), status: "present", subject: "Chemistry" },
  { id: "a18", studentId: "s3", date: daysAgo(2), status: "present", subject: "Chemistry" },
  // Sneha (s4)
  { id: "a19", studentId: "s4", date: daysAgo(0), status: "present", subject: "Mathematics" },
  { id: "a20", studentId: "s4", date: daysAgo(1), status: "present", subject: "Mathematics" },
  { id: "a21", studentId: "s4", date: daysAgo(2), status: "late", subject: "Mathematics" },
  // Arjun (s5)
  { id: "a22", studentId: "s5", date: daysAgo(0), status: "present", subject: "Biology" },
  { id: "a23", studentId: "s5", date: daysAgo(1), status: "present", subject: "Biology" },
  // Kavya (s6)
  { id: "a24", studentId: "s6", date: daysAgo(0), status: "present", subject: "Physics" },
  { id: "a25", studentId: "s6", date: daysAgo(1), status: "absent", subject: "Physics" },
];

export const SEED_FEES: FeeRecord[] = [
  { id: "f1", studentId: "s1", month: "2025-06", amount: 2500, status: "paid", paidOn: "2025-06-02", dueDate: "2025-06-05", description: "June Tuition Fee" },
  { id: "f2", studentId: "s1", month: "2025-07", amount: 2500, status: "paid", paidOn: "2025-07-03", dueDate: "2025-07-05", description: "July Tuition Fee" },
  { id: "f3", studentId: "s1", month: "2025-08", amount: 2500, status: "pending", dueDate: "2025-08-05", description: "August Tuition Fee" },
  { id: "f4", studentId: "s2", month: "2025-06", amount: 3000, status: "paid", paidOn: "2025-06-01", dueDate: "2025-06-05", description: "June Tuition Fee" },
  { id: "f5", studentId: "s2", month: "2025-07", amount: 3000, status: "overdue", dueDate: "2025-07-05", description: "July Tuition Fee" },
  { id: "f6", studentId: "s2", month: "2025-08", amount: 3000, status: "pending", dueDate: "2025-08-05", description: "August Tuition Fee" },
  { id: "f7", studentId: "s3", month: "2025-06", amount: 2800, status: "paid", paidOn: "2025-06-04", dueDate: "2025-06-05", description: "June Tuition Fee" },
  { id: "f8", studentId: "s3", month: "2025-07", amount: 2800, status: "paid", paidOn: "2025-07-02", dueDate: "2025-07-05", description: "July Tuition Fee" },
  { id: "f9", studentId: "s3", month: "2025-08", amount: 2800, status: "pending", dueDate: "2025-08-05", description: "August Tuition Fee" },
  { id: "f10", studentId: "s4", month: "2025-07", amount: 2500, status: "overdue", dueDate: "2025-07-05", description: "July Tuition Fee" },
  { id: "f11", studentId: "s4", month: "2025-08", amount: 2500, status: "pending", dueDate: "2025-08-05", description: "August Tuition Fee" },
  { id: "f12", studentId: "s5", month: "2025-08", amount: 2200, status: "paid", paidOn: "2025-08-01", dueDate: "2025-08-05", description: "August Tuition Fee" },
  { id: "f13", studentId: "s6", month: "2025-08", amount: 3000, status: "pending", dueDate: "2025-08-05", description: "August Tuition Fee" },
];

export const SEED_TESTS: TestResult[] = [
  { id: "t1", studentId: "s1", subject: "Mathematics", testName: "Unit Test 1", date: "2025-06-15", marksObtained: 87, totalMarks: 100, grade: "A" },
  { id: "t2", studentId: "s1", subject: "Mathematics", testName: "Mid-Term", date: "2025-07-10", marksObtained: 74, totalMarks: 100, grade: "B+" },
  { id: "t3", studentId: "s1", subject: "Mathematics", testName: "Unit Test 2", date: "2025-07-28", marksObtained: 91, totalMarks: 100, grade: "A+" },
  { id: "t4", studentId: "s2", subject: "Physics", testName: "Unit Test 1", date: "2025-06-15", marksObtained: 65, totalMarks: 100, grade: "B" },
  { id: "t5", studentId: "s2", subject: "Physics", testName: "Mid-Term", date: "2025-07-10", marksObtained: 72, totalMarks: 100, grade: "B+" },
  { id: "t6", studentId: "s2", subject: "Physics", testName: "Unit Test 2", date: "2025-07-28", marksObtained: 68, totalMarks: 100, grade: "B" },
  { id: "t7", studentId: "s3", subject: "Chemistry", testName: "Unit Test 1", date: "2025-06-15", marksObtained: 55, totalMarks: 100, grade: "C+" },
  { id: "t8", studentId: "s3", subject: "Chemistry", testName: "Mid-Term", date: "2025-07-10", marksObtained: 63, totalMarks: 100, grade: "B" },
  { id: "t9", studentId: "s4", subject: "Mathematics", testName: "Unit Test 1", date: "2025-06-15", marksObtained: 95, totalMarks: 100, grade: "A+" },
  { id: "t10", studentId: "s4", subject: "Mathematics", testName: "Mid-Term", date: "2025-07-10", marksObtained: 88, totalMarks: 100, grade: "A" },
  { id: "t11", studentId: "s5", subject: "Biology", testName: "Unit Test 1", date: "2025-06-15", marksObtained: 78, totalMarks: 100, grade: "B+" },
  { id: "t12", studentId: "s6", subject: "Physics", testName: "Unit Test 1", date: "2025-06-15", marksObtained: 82, totalMarks: 100, grade: "A" },
];

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: "n1", title: "Holiday Notice — Independence Day", message: "Classes will remain suspended on 15th August 2025 on account of Independence Day. Regular classes resume from 16th August.", date: "2025-08-01", priority: "high", targetRole: "all" },
  { id: "n2", title: "Mid-Term Exam Schedule Released", message: "Mid-term examinations are scheduled for August 20–25, 2025. Detailed timetable has been shared. Students are advised to prepare accordingly.", date: "2025-07-28", priority: "high", targetRole: "all" },
  { id: "n3", title: "Fee Payment Reminder", message: "August month fees are due by 5th August 2025. Parents are requested to ensure timely payment to avoid late charges.", date: "2025-07-30", priority: "medium", targetRole: "parent" },
  { id: "n4", title: "Extra Class — This Saturday", message: "An extra doubt-clearing session will be held this Saturday (3rd August) from 10 AM to 1 PM. Attendance is mandatory.", date: "2025-07-31", priority: "medium", targetRole: "student" },
  { id: "n5", title: "Study Material Update", message: "New practice sheets for Chapters 8–10 are now available. Students can collect them from the institute reception.", date: "2025-07-25", priority: "low", targetRole: "student" },
];

// ─── LocalStorage Helpers ─────────────────────────────────────────────────────

const LS_KEYS = {
  students: "ec_students",
  users: "ec_users",
  attendance: "ec_attendance",
  fees: "ec_fees",
  tests: "ec_tests",
  announcements: "ec_announcements",
  currentUser: "ec_current_user",
  activePage: "ec_active_page",
};

function loadOrSeed<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const Store = {
  // Students
  getStudents: (): Student[] => loadOrSeed(LS_KEYS.students, SEED_STUDENTS),
  saveStudents: (data: Student[]) => save(LS_KEYS.students, data),
  addStudent: (s: Student) => {
    const all = Store.getStudents();
    all.push(s);
    Store.saveStudents(all);
  },
  updateStudent: (s: Student) => {
    const all = Store.getStudents().map((x) => (x.id === s.id ? s : x));
    Store.saveStudents(all);
  },
  deleteStudent: (id: string) => {
    Store.saveStudents(Store.getStudents().filter((s) => s.id !== id));
  },

  // Users
  getUsers: (): User[] => loadOrSeed(LS_KEYS.users, SEED_USERS),
  saveUsers: (data: User[]) => save(LS_KEYS.users, data),
  addUser: (u: User) => {
    const all = Store.getUsers();
    all.push(u);
    Store.saveUsers(all);
  },
  updateUser: (u: User) => {
    const all = Store.getUsers().map((x) => (x.id === u.id ? u : x));
    Store.saveUsers(all);
  },
  deleteUser: (id: string) => {
    Store.saveUsers(Store.getUsers().filter((u) => u.id !== id));
  },
  authenticate: (email: string, password: string): User | null => {
    return Store.getUsers().find((u) => u.email === email && u.password === password) || null;
  },

  // Helpers
  getGroups: (): string[] => {
    const students = Store.getStudents();
    return Array.from(new Set(students.map((s) => s.group))).sort();
  },

  // Session
  getSession: (): User | null => {
    try {
      const raw = localStorage.getItem(LS_KEYS.currentUser);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setSession: (user: User | null) => {
    if (user) localStorage.setItem(LS_KEYS.currentUser, JSON.stringify(user));
    else localStorage.removeItem(LS_KEYS.currentUser);
  },
  getPage: (): any => localStorage.getItem(LS_KEYS.activePage) || "dashboard",
  setPage: (page: string) => localStorage.setItem(LS_KEYS.activePage, page),

  // Attendance
  getAttendance: (): AttendanceRecord[] => loadOrSeed(LS_KEYS.attendance, SEED_ATTENDANCE),
  saveAttendance: (data: AttendanceRecord[]) => save(LS_KEYS.attendance, data),
  addAttendance: (a: AttendanceRecord) => {
    const all = Store.getAttendance();
    const existing = all.findIndex((x) => x.studentId === a.studentId && x.date === a.date && x.subject === a.subject);
    if (existing >= 0) all[existing] = a;
    else all.push(a);
    Store.saveAttendance(all);
  },
  getStudentAttendance: (studentId: string): AttendanceRecord[] =>
    Store.getAttendance().filter((a) => a.studentId === studentId),

  // Fees
  getFees: (): FeeRecord[] => loadOrSeed(LS_KEYS.fees, SEED_FEES),
  saveFees: (data: FeeRecord[]) => save(LS_KEYS.fees, data),
  addFee: (f: FeeRecord) => {
    const all = Store.getFees();
    all.push(f);
    Store.saveFees(all);
  },
  updateFee: (f: FeeRecord) => {
    Store.saveFees(Store.getFees().map((x) => (x.id === f.id ? f : x)));
  },
  getStudentFees: (studentId: string): FeeRecord[] =>
    Store.getFees().filter((f) => f.studentId === studentId),

  // Tests
  getTests: (): TestResult[] => loadOrSeed(LS_KEYS.tests, SEED_TESTS),
  saveTests: (data: TestResult[]) => save(LS_KEYS.tests, data),
  addTest: (t: TestResult) => {
    const all = Store.getTests();
    all.push(t);
    Store.saveTests(all);
  },
  updateTest: (t: TestResult) => {
    Store.saveTests(Store.getTests().map((x) => (x.id === t.id ? t : x)));
  },
  deleteTest: (id: string) => {
    Store.saveTests(Store.getTests().filter((t) => t.id !== id));
  },
  getStudentTests: (studentId: string): TestResult[] =>
    Store.getTests().filter((t) => t.studentId === studentId),

  // Announcements
  getAnnouncements: (): Announcement[] => loadOrSeed(LS_KEYS.announcements, SEED_ANNOUNCEMENTS),
  saveAnnouncements: (data: Announcement[]) => save(LS_KEYS.announcements, data),
  addAnnouncement: (a: Announcement) => {
    const all = Store.getAnnouncements();
    all.unshift(a);
    Store.saveAnnouncements(all);
  },
};
