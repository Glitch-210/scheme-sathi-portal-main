/**
 * UserService — User registration, login, profile, and admin user management
 * Persisted in localStorage under key: scheme_sarthi_users
 * Supports multi-role: SUPER_ADMIN, CONTENT_ADMIN, REVIEW_ADMIN, USER
 */

import { ROLES, ADMIN_ROLES } from '@/lib/rbac';

const STORAGE_KEY = 'scheme_sarthi_users';

// ── Simple hash simulation (btoa + salt for demo) ──
const SALT = 'ss_2026_';
function hashPassword(plain) {
    return btoa(SALT + plain);
}
function verifyPassword(plain, hashed) {
    return btoa(SALT + plain) === hashed;
}

// ── Seed users (default demo users + multi-role admins) ──
const seedUsers = [
    // ── Admin users ──
    {
        id: 'u-admin-1',
        fullName: 'Super Admin',
        email: 'admin@schemesarthi.gov.in',
        mobile: '9999999999',
        mpin: hashPassword('admin123'),
        role: ROLES.SUPER_ADMIN,
        language: 'en',
        state: 'central',
        status: 'active',
        joinedAt: '2025-01-01',
    },
    {
        id: 'u-admin-2',
        fullName: 'Content Manager',
        email: 'content@schemesarthi.gov.in',
        mobile: '9999999998',
        mpin: hashPassword('content123'),
        role: ROLES.CONTENT_ADMIN,
        language: 'en',
        state: 'central',
        status: 'active',
        joinedAt: '2025-02-01',
    },
    {
        id: 'u-admin-3',
        fullName: 'Application Reviewer',
        email: 'reviewer@schemesarthi.gov.in',
        mobile: '9999999997',
        mpin: hashPassword('review123'),
        role: ROLES.REVIEW_ADMIN,
        language: 'en',
        state: 'central',
        status: 'active',
        joinedAt: '2025-03-01',
    },
    // ── Demo users ──
    {
        id: 'u-demo-1', fullName: 'Rahul Sharma', email: 'rahul@example.com',
        mobile: '9876543210', mpin: hashPassword('1234'), role: ROLES.USER,
        language: 'en', state: 'maharashtra', status: 'active', joinedAt: '2025-08-12',
    },
    {
        id: 'u-demo-2', fullName: 'Priya Patel', email: 'priya@example.com',
        mobile: '9876543211', mpin: hashPassword('1234'), role: ROLES.USER,
        language: 'en', state: 'gujarat', status: 'active', joinedAt: '2025-07-20',
    },
    {
        id: 'u-demo-3', fullName: 'Amit Singh', email: 'amit@example.com',
        mobile: '9876543212', mpin: hashPassword('1234'), role: ROLES.USER,
        language: 'en', state: 'uttar-pradesh', status: 'blocked', joinedAt: '2025-09-01',
    },
    {
        id: 'u-demo-4', fullName: 'Sneha Reddy', email: 'sneha@example.com',
        mobile: '9876543213', mpin: hashPassword('1234'), role: ROLES.USER,
        language: 'en', state: 'telangana', status: 'active', joinedAt: '2025-06-15',
    },
    {
        id: 'u-demo-5', fullName: 'Vikram Joshi', email: 'vikram@example.com',
        mobile: '9876543214', mpin: hashPassword('1234'), role: ROLES.USER,
        language: 'en', state: 'rajasthan', status: 'active', joinedAt: '2025-10-05',
    },
    {
        id: 'u-demo-6', fullName: 'Kavita Nair', email: 'kavita@example.com',
        mobile: '9876543215', mpin: hashPassword('1234'), role: ROLES.USER,
        language: 'en', state: 'kerala', status: 'active', joinedAt: '2025-05-22',
    },
    {
        id: 'u-demo-7', fullName: 'Rajesh Kumar', email: 'rajesh@example.com',
        mobile: '9876543216', mpin: hashPassword('1234'), role: ROLES.USER,
        language: 'en', state: 'bihar', status: 'active', joinedAt: '2025-04-10',
    },
    {
        id: 'u-demo-8', fullName: 'Anita Desai', email: 'anita@example.com',
        mobile: '9876543217', mpin: hashPassword('1234'), role: ROLES.USER,
        language: 'en', state: 'maharashtra', status: 'blocked', joinedAt: '2025-11-18',
    },
    {
        id: 'u-demo-9', fullName: 'Suresh Yadav', email: 'suresh@example.com',
        mobile: '9876543218', mpin: hashPassword('1234'), role: ROLES.USER,
        language: 'en', state: 'madhya-pradesh', status: 'active', joinedAt: '2025-03-30',
    },
    {
        id: 'u-demo-10', fullName: 'Meera Iyer', email: 'meera@example.com',
        mobile: '9876543219', mpin: hashPassword('1234'), role: ROLES.USER,
        language: 'en', state: 'tamil-nadu', status: 'active', joinedAt: '2025-02-14',
    },
];

// ── Persistence helpers ──
function readFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function writeToStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Public API ──
const UserService = {
    /** Seed localStorage if empty */
    seed() {
        if (!readFromStorage()) {
            writeToStorage(seedUsers);
        }
        return readFromStorage();
    },

    /** Register new user. Returns { success, user?, error? } */
    register(userData) {
        const all = this.getAll();
        if (all.some(u => u.mobile === userData.mobile)) {
            return { success: false, error: 'Mobile number already registered' };
        }
        if (userData.email && all.some(u => u.email === userData.email)) {
            return { success: false, error: 'Email already registered' };
        }
        const newUser = {
            ...userData,
            id: `u-${Date.now()}`,
            mpin: hashPassword(userData.mpin),
            role: ROLES.USER,
            status: 'active',
            joinedAt: new Date().toISOString().split('T')[0],
        };
        all.push(newUser);
        writeToStorage(all);
        const { mpin, ...safeUser } = newUser;
        return { success: true, user: safeUser };
    },

    /** Login by mobile + mpin */
    login(mobile, mpin) {
        const all = this.getAll();
        const user = all.find(u => u.mobile === mobile);
        if (!user) return { success: false, error: 'User not found' };
        if (user.status === 'blocked') return { success: false, error: 'Account is blocked. Contact admin.' };
        if (!verifyPassword(mpin, user.mpin)) return { success: false, error: 'Invalid credentials' };
        const { mpin: _, ...safeUser } = user;
        return { success: true, user: safeUser };
    },

    /** Admin login by email + password — supports all admin roles */
    adminLogin(email, password) {
        const all = this.getAll();
        const admin = all.find(u => u.email === email && ADMIN_ROLES.includes(u.role));
        if (!admin) return { success: false, error: 'Invalid admin credentials' };
        if (admin.status === 'blocked') return { success: false, error: 'Account is blocked.' };
        if (!verifyPassword(password, admin.mpin)) return { success: false, error: 'Invalid credentials' };
        const { mpin: _, ...safeUser } = admin;
        return { success: true, user: safeUser };
    },

    /** Get user by id (excludes password) */
    getById(id) {
        const user = this.getAll().find(u => u.id === id);
        if (!user) return null;
        const { mpin, ...safeUser } = user;
        return safeUser;
    },

    /** Get all users raw (internal) */
    getAll() {
        return readFromStorage() || [];
    },

    /** Get all users safe (without mpin) */
    getAllSafe() {
        return this.getAll().map(({ mpin, ...rest }) => rest);
    },

    /** Get all admin users (safe) */
    getAdminUsers() {
        return this.getAllSafe().filter(u => ADMIN_ROLES.includes(u.role));
    },

    /** Toggle user status: active ↔ blocked */
    toggleStatus(userId) {
        const all = this.getAll();
        const idx = all.findIndex(u => u.id === userId);
        if (idx === -1) return { success: false, error: 'User not found' };
        all[idx].status = all[idx].status === 'active' ? 'blocked' : 'active';
        writeToStorage(all);
        return { success: true, user: all[idx] };
    },

    /**
     * Update a user's role (SUPER_ADMIN only action).
     * @param {string} userId - target user ID
     * @param {string} newRole - new role
     * @returns {{ success, user?, error? }}
     */
    updateRole(userId, newRole) {
        if (!ADMIN_ROLES.includes(newRole) && newRole !== ROLES.USER) {
            return { success: false, error: 'Invalid role' };
        }
        const all = this.getAll();
        const idx = all.findIndex(u => u.id === userId);
        if (idx === -1) return { success: false, error: 'User not found' };
        all[idx].role = newRole;
        writeToStorage(all);
        const { mpin, ...safeUser } = all[idx];
        return { success: true, user: safeUser };
    },

    /** Update profile */
    updateProfile(userId, data) {
        const all = this.getAll();
        const idx = all.findIndex(u => u.id === userId);
        if (idx === -1) return { success: false, error: 'User not found' };
        if (data.mpin) {
            data.mpin = hashPassword(data.mpin);
        }
        all[idx] = { ...all[idx], ...data };
        writeToStorage(all);
        const { mpin, ...safeUser } = all[idx];
        return { success: true, user: safeUser };
    },

    /** Change password */
    changePassword(userId, oldPassword, newPassword) {
        const all = this.getAll();
        const idx = all.findIndex(u => u.id === userId);
        if (idx === -1) return { success: false, error: 'User not found' };
        if (!verifyPassword(oldPassword, all[idx].mpin)) {
            return { success: false, error: 'Current password is incorrect' };
        }
        all[idx].mpin = hashPassword(newPassword);
        writeToStorage(all);
        return { success: true };
    },

    /** Get user stats */
    getStats() {
        const all = this.getAllSafe();
        const users = all.filter(u => !ADMIN_ROLES.includes(u.role));
        return {
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            blocked: users.filter(u => u.status === 'blocked').length,
        };
    },
};

export default UserService;
