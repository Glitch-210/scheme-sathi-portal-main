import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import UserService from '@/services/UserService';
import ApplicationService from '@/services/ApplicationService';
import NotificationService, { NOTIF_TYPES } from '@/services/NotificationService';
import AuditService, { AUDIT_ACTIONS } from '@/services/AuditService';
import { ADMIN_ROLES, isAdminRole } from '@/lib/rbac';

// ════════════════════════════════════════
// Theme Store (unchanged)
// ════════════════════════════════════════
export const useThemeStore = create()(persist((set, get) => ({
    theme: 'light',
    toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        applyTheme(next);
    },
    initTheme: () => {
        const stored = get().theme;
        applyTheme(stored);
    },
}), {
    name: 'scheme-sarthi-theme',
}));

function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
}

// ════════════════════════════════════════
// Auth Store — multi-role RBAC
// ════════════════════════════════════════
export const useAuthStore = create()(persist((set, get) => ({
    user: null,
    isAuthenticated: false,
    language: 'en',

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    setLanguage: (language) => {
        set({ language });
        const user = get().user;
        if (user) set({ user: { ...user, language } });
    },

    /** User login (mobile + mpin) */
    login: (mobile, mpin) => {
        UserService.seed();
        const result = UserService.login(mobile, mpin);
        if (result.success) {
            set({ user: result.user, isAuthenticated: true, language: result.user.language || 'en' });
            return true;
        }
        return false;
    },

    /** OTP-based login (looks up by mobile only) */
    loginWithOtp: (mobile) => {
        UserService.seed();
        const all = UserService.getAllSafe();
        const user = all.find(u => u.mobile === mobile);
        if (user && user.status === 'active') {
            set({ user, isAuthenticated: true, language: user.language || 'en' });
            return true;
        }
        return false;
    },

    /** Register new user */
    register: (userData) => {
        UserService.seed();
        const result = UserService.register(userData);
        if (result.success) {
            set({ user: result.user, isAuthenticated: true, language: result.user.language || 'en' });
            return true;
        }
        return false;
    },

    logout: () => set({ user: null, isAuthenticated: false }),

    updateProfile: (data) => {
        const user = get().user;
        if (user) {
            const result = UserService.updateProfile(user.id, data);
            if (result.success) {
                set({ user: result.user });
            }
        }
    },

    // ── Admin auth (multi-role) ──
    adminLogin: (email, password) => {
        UserService.seed();
        const result = UserService.adminLogin(email, password);
        if (result.success) {
            set({ user: result.user, isAuthenticated: true });
            return { success: true };
        }
        return { success: false, message: result.error };
    },

    adminLogout: () => set({ user: null, isAuthenticated: false }),

    // ── Admin user management ──
    getAllUsers: () => UserService.getAllSafe().filter(u => !isAdminRole(u.role)),

    getAdminUsers: () => UserService.getAdminUsers(),

    toggleUserStatus: (userId) => {
        const result = UserService.toggleStatus(userId);
        if (result.success) {
            const user = get().user;
            if (user) {
                const action = result.user.status === 'blocked' ? 'USER_BLOCKED' : 'USER_UNBLOCKED';
                AuditService.log(
                    action === 'USER_BLOCKED' ? AUDIT_ACTIONS.USER_BLOCKED : AUDIT_ACTIONS.USER_UNBLOCKED,
                    user.id, user.role, userId, 'user',
                    { userName: result.user.fullName }
                );
            }
        }
        return result;
    },

    /** Update a user's role (SUPER_ADMIN only) */
    updateUserRole: (userId, newRole) => {
        const result = UserService.updateRole(userId, newRole);
        if (result.success) {
            const user = get().user;
            if (user) {
                AuditService.log(
                    AUDIT_ACTIONS.ROLE_UPDATED,
                    user.id, user.role, userId, 'user',
                    { newRole, userName: result.user.fullName }
                );
            }
        }
        return result;
    },

    getUserStats: () => UserService.getStats(),

    changePassword: (oldPassword, newPassword) => {
        const user = get().user;
        if (!user) return { success: false, error: 'Not logged in' };
        const result = UserService.changePassword(user.id, oldPassword, newPassword);
        if (result.success) {
            AuditService.log(AUDIT_ACTIONS.PASSWORD_CHANGED, user.id, user.role, user.id, 'user', {});
        }
        return result;
    },
}), {
    name: 'scheme-sarthi-auth',
}));

// ════════════════════════════════════════
// Application Store — with audit + notification triggers
// ════════════════════════════════════════
export const useApplicationStore = create((set, get) => ({
    applications: [],
    loaded: false,

    loadApplications: () => {
        ApplicationService.seed();
        set({ applications: ApplicationService.getAll(), loaded: true });
    },

    refresh: () => set({ applications: ApplicationService.getAll() }),

    /** User: submit new application */
    addApplication: (appData) => {
        const result = ApplicationService.create(
            appData.userId, appData.serviceId, appData.serviceName,
            appData.category, appData.formData
        );
        if (result.success) {
            set({ applications: ApplicationService.getAll() });
        }
        return result;
    },

    getApplicationsByUser: (userId) => {
        return get().applications.filter(app => app.userId === userId);
    },

    getAllApplications: () => get().applications,

    /** Admin: move to under_review */
    moveToReview: (appId) => {
        const admin = useAuthStore.getState().user;
        const result = ApplicationService.moveToReview(appId, admin?.id || 'admin');
        if (result.success) {
            set({ applications: ApplicationService.getAll() });
            // Audit log
            AuditService.log(
                AUDIT_ACTIONS.APPLICATION_REVIEWED,
                admin?.id, admin?.role, appId, 'application',
                { serviceName: result.application.serviceName }
            );
            // Notify user
            NotificationService.sendToUser(
                result.application.userId,
                'Application Under Review',
                `Your application for ${result.application.serviceName} is now being reviewed.`,
                NOTIF_TYPES.SYSTEM
            );
        }
        return result;
    },

    /** Admin: approve/reject (from under_review) */
    updateApplicationStatus: (appId, status, remarks) => {
        const admin = useAuthStore.getState().user;
        const result = ApplicationService.updateStatus(appId, status, remarks, admin?.id || 'admin');
        if (result.success) {
            set({ applications: ApplicationService.getAll() });

            // Audit log
            const auditAction = status === 'approved' ? AUDIT_ACTIONS.APPLICATION_APPROVED : AUDIT_ACTIONS.APPLICATION_REJECTED;
            AuditService.log(
                auditAction, admin?.id, admin?.role, appId, 'application',
                { serviceName: result.application.serviceName, remarks }
            );

            // Auto notification to user
            if (status === 'approved') {
                NotificationService.sendToUser(
                    result.application.userId,
                    'Application Approved! 🎉',
                    `Your application for ${result.application.serviceName} has been approved.${remarks ? ` Remarks: ${remarks}` : ''}`,
                    NOTIF_TYPES.APPROVAL
                );
            } else if (status === 'rejected') {
                NotificationService.sendToUser(
                    result.application.userId,
                    'Application Update',
                    `Your application for ${result.application.serviceName} was not approved. Reason: ${remarks}`,
                    NOTIF_TYPES.REJECTION
                );
            }
        }
        return result;
    },

    getApplicationStats: () => ApplicationService.getStats(),

    getApplicationById: (id) => get().applications.find(a => a.id === id) || null,
}));

// ════════════════════════════════════════
// Notification Store — with broadcast + markAllRead
// ════════════════════════════════════════
export const useNotificationStore = create((set, get) => ({
    notifications: [],
    loaded: false,

    loadNotifications: () => {
        NotificationService.seed();
        set({ notifications: NotificationService.getAll(), loaded: true });
    },

    refresh: () => set({ notifications: NotificationService.getAll() }),

    /** Add a notification (generic) */
    addNotification: (notifData) => {
        const result = NotificationService.add(notifData);
        if (result.success) {
            set({ notifications: NotificationService.getAll() });
        }
        return result;
    },

    /** Admin: broadcast to all users */
    broadcastNotification: (title, message, type) => {
        const admin = useAuthStore.getState().user;
        const result = NotificationService.broadcastToAll(title, message, type);
        if (result.success) {
            set({ notifications: NotificationService.getAll() });
            AuditService.log(
                AUDIT_ACTIONS.NOTIFICATION_BROADCAST,
                admin?.id, admin?.role, result.notification.id, 'notification',
                { title }
            );
        }
        return result;
    },

    /** Admin: send to specific user */
    notifyUser: (userId, title, message, type) => {
        const result = NotificationService.sendToUser(userId, title, message, type);
        if (result.success) {
            set({ notifications: NotificationService.getAll() });
        }
        return result;
    },

    getNotificationsByUser: (userId) => {
        return get().notifications.filter(n =>
            n.target === 'all' || n.userId === userId
        );
    },

    getAllNotifications: () => get().notifications,

    markAsRead: (id) => {
        NotificationService.markRead(id);
        set({ notifications: NotificationService.getAll() });
    },

    /** Mark all notifications as read for a user */
    markAllRead: (userId) => {
        NotificationService.markAllRead(userId);
        set({ notifications: NotificationService.getAll() });
    },

    getUnreadCount: (userId) => {
        return get().notifications.filter(n =>
            (n.target === 'all' || n.userId === userId) && !n.read
        ).length;
    },
}));

// ════════════════════════════════════════
// Activity Log Store (admin settings, kept for backward compat)
// ════════════════════════════════════════
export const useActivityLogStore = create()(persist((set, get) => ({
    logs: [
        { id: 'l1', action: 'System initialized', user: 'System', timestamp: new Date().toLocaleString(), ip: '127.0.0.1' },
    ],
    addLog: (action) => set((s) => ({
        logs: [
            { id: `l-${Date.now()}`, action, user: 'Admin', timestamp: new Date().toLocaleString(), ip: '192.168.1.100' },
            ...s.logs,
        ].slice(0, 50),
    })),

    maintenanceMode: false,
    toggleMaintenance: () => set((s) => ({ maintenanceMode: !s.maintenanceMode })),
}), {
    name: 'scheme-sarthi-admin-settings',
}));

// ════════════════════════════════════════
// Data Seeder — call once at app start
// ════════════════════════════════════════
export function seedAllData() {
    UserService.seed();
    ApplicationService.seed();
    NotificationService.seed();
    AuditService.seed();
}
