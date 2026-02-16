import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Admin Credentials ──
const ADMIN_CREDS = {
    email: 'admin@schemesarthi.gov.in',
    password: 'admin123',
    name: 'Admin',
    role: 'ADMIN',
};

// ── Dummy Users ──
const generateUsers = () => [
    { id: 'u1', name: 'Rahul Sharma', email: 'rahul@example.com', state: 'maharashtra', mobile: '9876543210', applications: 3, status: 'active', joinedAt: '2025-08-12' },
    { id: 'u2', name: 'Priya Patel', email: 'priya@example.com', state: 'gujarat', mobile: '9876543211', applications: 5, status: 'active', joinedAt: '2025-07-20' },
    { id: 'u3', name: 'Amit Singh', email: 'amit@example.com', state: 'uttar-pradesh', mobile: '9876543212', applications: 2, status: 'blocked', joinedAt: '2025-09-01' },
    { id: 'u4', name: 'Sneha Reddy', email: 'sneha@example.com', state: 'telangana', mobile: '9876543213', applications: 7, status: 'active', joinedAt: '2025-06-15' },
    { id: 'u5', name: 'Vikram Joshi', email: 'vikram@example.com', state: 'rajasthan', mobile: '9876543214', applications: 1, status: 'active', joinedAt: '2025-10-05' },
    { id: 'u6', name: 'Kavita Nair', email: 'kavita@example.com', state: 'kerala', mobile: '9876543215', applications: 4, status: 'active', joinedAt: '2025-05-22' },
    { id: 'u7', name: 'Rajesh Kumar', email: 'rajesh@example.com', state: 'bihar', mobile: '9876543216', applications: 6, status: 'active', joinedAt: '2025-04-10' },
    { id: 'u8', name: 'Anita Desai', email: 'anita@example.com', state: 'maharashtra', mobile: '9876543217', applications: 2, status: 'blocked', joinedAt: '2025-11-18' },
    { id: 'u9', name: 'Suresh Yadav', email: 'suresh@example.com', state: 'madhya-pradesh', mobile: '9876543218', applications: 3, status: 'active', joinedAt: '2025-03-30' },
    { id: 'u10', name: 'Meera Iyer', email: 'meera@example.com', state: 'tamil-nadu', mobile: '9876543219', applications: 8, status: 'active', joinedAt: '2025-02-14' },
    { id: 'u11', name: 'Deepak Verma', email: 'deepak@example.com', state: 'haryana', mobile: '9876543220', applications: 1, status: 'active', joinedAt: '2025-12-01' },
    { id: 'u12', name: 'Pooja Gupta', email: 'pooja@example.com', state: 'delhi', mobile: '9876543221', applications: 5, status: 'active', joinedAt: '2025-01-25' },
    { id: 'u13', name: 'Arjun Menon', email: 'arjun@example.com', state: 'karnataka', mobile: '9876543222', applications: 2, status: 'blocked', joinedAt: '2025-08-08' },
    { id: 'u14', name: 'Ritu Chauhan', email: 'ritu@example.com', state: 'uttarakhand', mobile: '9876543223', applications: 4, status: 'active', joinedAt: '2025-07-14' },
    { id: 'u15', name: 'Manish Tiwari', email: 'manish@example.com', state: 'chhattisgarh', mobile: '9876543224', applications: 3, status: 'active', joinedAt: '2025-09-22' },
    { id: 'u16', name: 'Sunita Devi', email: 'sunita@example.com', state: 'jharkhand', mobile: '9876543225', applications: 6, status: 'active', joinedAt: '2025-06-03' },
    { id: 'u17', name: 'Karan Malhotra', email: 'karan@example.com', state: 'punjab', mobile: '9876543226', applications: 2, status: 'active', joinedAt: '2025-10-30' },
    { id: 'u18', name: 'Divya Saxena', email: 'divya@example.com', state: 'uttar-pradesh', mobile: '9876543227', applications: 1, status: 'active', joinedAt: '2025-11-12' },
    { id: 'u19', name: 'Nikhil Bhat', email: 'nikhil@example.com', state: 'west-bengal', mobile: '9876543228', applications: 4, status: 'blocked', joinedAt: '2025-04-28' },
    { id: 'u20', name: 'Asha Kumari', email: 'asha@example.com', state: 'odisha', mobile: '9876543229', applications: 7, status: 'active', joinedAt: '2025-05-16' },
];

// ── Dummy Applications ──
const generateApplications = () => [
    { id: 'APP001', userId: 'u1', userName: 'Rahul Sharma', schemeName: 'PM Kisan Samman Nidhi', status: 'pending', appliedAt: '2026-01-15', remarks: '' },
    { id: 'APP002', userId: 'u2', userName: 'Priya Patel', schemeName: 'Ayushman Bharat', status: 'approved', appliedAt: '2026-01-10', remarks: 'All documents verified' },
    { id: 'APP003', userId: 'u4', userName: 'Sneha Reddy', schemeName: 'Sukanya Samriddhi Yojana', status: 'rejected', appliedAt: '2026-01-08', remarks: 'Income exceeds limit' },
    { id: 'APP004', userId: 'u7', userName: 'Rajesh Kumar', schemeName: 'PMAY - Housing for All', status: 'pending', appliedAt: '2026-01-20', remarks: '' },
    { id: 'APP005', userId: 'u10', userName: 'Meera Iyer', schemeName: 'Digital India Scholarship', status: 'approved', appliedAt: '2026-01-05', remarks: 'Verified by district office' },
    { id: 'APP006', userId: 'u6', userName: 'Kavita Nair', schemeName: 'Mudra Yojana', status: 'pending', appliedAt: '2026-01-22', remarks: '' },
    { id: 'APP007', userId: 'u12', userName: 'Pooja Gupta', schemeName: 'Atal Pension Yojana', status: 'approved', appliedAt: '2026-01-03', remarks: 'Auto-approved' },
    { id: 'APP008', userId: 'u5', userName: 'Vikram Joshi', schemeName: 'Kisan Credit Card', status: 'rejected', appliedAt: '2026-01-18', remarks: 'Missing land documents' },
    { id: 'APP009', userId: 'u15', userName: 'Manish Tiwari', schemeName: 'National Health Mission', status: 'pending', appliedAt: '2026-01-25', remarks: '' },
    { id: 'APP010', userId: 'u20', userName: 'Asha Kumari', schemeName: 'Ujjwala Yojana', status: 'approved', appliedAt: '2025-12-28', remarks: 'BPL card verified' },
    { id: 'APP011', userId: 'u9', userName: 'Suresh Yadav', schemeName: 'PM Fasal Bima Yojana', status: 'pending', appliedAt: '2026-02-01', remarks: '' },
    { id: 'APP012', userId: 'u16', userName: 'Sunita Devi', schemeName: 'Jan Dhan Yojana', status: 'approved', appliedAt: '2025-12-15', remarks: 'Aadhaar linked' },
    { id: 'APP013', userId: 'u3', userName: 'Amit Singh', schemeName: 'Skill India Mission', status: 'rejected', appliedAt: '2026-01-12', remarks: 'Age criteria not met' },
    { id: 'APP014', userId: 'u14', userName: 'Ritu Chauhan', schemeName: 'Beti Bachao Beti Padhao', status: 'approved', appliedAt: '2025-12-20', remarks: 'School certificate verified' },
    { id: 'APP015', userId: 'u17', userName: 'Karan Malhotra', schemeName: 'Startup India Seed Fund', status: 'pending', appliedAt: '2026-02-05', remarks: '' },
];

// ── Dummy Notifications ──
const generateNotifications = () => [
    { id: 'n1', title: 'New Scheme Launched', description: 'PM Vishwakarma Yojana is now accepting applications.', target: 'all', sentAt: '2026-02-10', status: 'sent' },
    { id: 'n2', title: 'Deadline Reminder', description: 'PM Kisan registration deadline extended to March 31.', target: 'all', sentAt: '2026-02-08', status: 'sent' },
    { id: 'n3', title: 'Maintenance Notice', description: 'Portal will be under maintenance on Feb 15, 2-4 AM.', target: 'all', sentAt: '2026-02-05', status: 'sent' },
    { id: 'n4', title: 'State Update', description: 'Maharashtra has added 5 new welfare schemes.', target: 'maharashtra', sentAt: '2026-01-28', status: 'sent' },
    { id: 'n5', title: 'Application Update', description: 'Batch processing complete for Ayushman Bharat applications.', target: 'all', sentAt: '2026-01-20', status: 'sent' },
];

// ── Activity Logs ──
const generateActivityLogs = () => [
    { id: 'l1', action: 'Admin Login', user: 'Admin', timestamp: '2026-02-16 10:30:00', ip: '192.168.1.100' },
    { id: 'l2', action: 'Scheme Updated: PM Kisan', user: 'Admin', timestamp: '2026-02-15 14:22:00', ip: '192.168.1.100' },
    { id: 'l3', action: 'User Blocked: Amit Singh', user: 'Admin', timestamp: '2026-02-14 09:15:00', ip: '192.168.1.100' },
    { id: 'l4', action: 'Application Approved: APP002', user: 'Admin', timestamp: '2026-02-13 16:45:00', ip: '192.168.1.100' },
    { id: 'l5', action: 'Notification Sent: Deadline Reminder', user: 'Admin', timestamp: '2026-02-12 11:00:00', ip: '192.168.1.100' },
    { id: 'l6', action: 'Maintenance Mode Toggled', user: 'Admin', timestamp: '2026-02-10 08:30:00', ip: '192.168.1.100' },
    { id: 'l7', action: 'New Scheme Created: PM Vishwakarma', user: 'Admin', timestamp: '2026-02-08 13:10:00', ip: '192.168.1.100' },
    { id: 'l8', action: 'Application Rejected: APP003', user: 'Admin', timestamp: '2026-02-06 15:40:00', ip: '192.168.1.100' },
];

// ── Analytics Data ──
export const analyticsData = {
    applicationsPerScheme: [
        { name: 'PM Kisan', count: 85 },
        { name: 'Ayushman Bharat', count: 62 },
        { name: 'PMAY Housing', count: 48 },
        { name: 'Mudra Yojana', count: 37 },
        { name: 'Sukanya Samriddhi', count: 31 },
        { name: 'Atal Pension', count: 28 },
        { name: 'Ujjwala', count: 25 },
        { name: 'Jan Dhan', count: 22 },
    ],
    approvalBreakdown: [
        { name: 'Approved', value: 156, color: '#22c55e' },
        { name: 'Pending', value: 89, color: '#eab308' },
        { name: 'Rejected', value: 43, color: '#ef4444' },
    ],
    monthlyGrowth: [
        { month: 'Sep', users: 120, applications: 45 },
        { month: 'Oct', users: 180, applications: 72 },
        { month: 'Nov', users: 240, applications: 98 },
        { month: 'Dec', users: 310, applications: 135 },
        { month: 'Jan', users: 420, applications: 188 },
        { month: 'Feb', users: 520, applications: 245 },
    ],
};

// ── Admin Store ──
export const useAdminStore = create()(persist((set, get) => ({
    // Auth
    admin: null,
    isAdminAuthenticated: false,

    adminLogin: (email, password) => {
        if (email === ADMIN_CREDS.email && password === ADMIN_CREDS.password) {
            set({
                admin: { email: ADMIN_CREDS.email, name: ADMIN_CREDS.name, role: ADMIN_CREDS.role },
                isAdminAuthenticated: true,
            });
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
    },

    adminLogout: () => set({ admin: null, isAdminAuthenticated: false }),

    // Users
    users: generateUsers(),
    toggleUserStatus: (userId) => set((s) => ({
        users: s.users.map(u => u.id === userId
            ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' }
            : u
        ),
    })),

    // Applications
    applications: generateApplications(),
    updateApplicationStatus: (appId, status, remarks) => set((s) => ({
        applications: s.applications.map(a => a.id === appId ? { ...a, status, remarks: remarks || a.remarks } : a),
    })),

    // Notifications
    adminNotifications: generateNotifications(),
    addAdminNotification: (notif) => set((s) => ({
        adminNotifications: [{ ...notif, id: `n${Date.now()}`, sentAt: new Date().toISOString().split('T')[0], status: 'sent' }, ...s.adminNotifications],
    })),

    // Settings
    maintenanceMode: false,
    toggleMaintenance: () => set((s) => ({ maintenanceMode: !s.maintenanceMode })),

    // Activity Logs
    activityLogs: generateActivityLogs(),
    addLog: (action) => set((s) => ({
        activityLogs: [{ id: `l${Date.now()}`, action, user: 'Admin', timestamp: new Date().toLocaleString(), ip: '192.168.1.100' }, ...s.activityLogs],
    })),
}), {
    name: 'scheme-sarthi-admin',
}));
