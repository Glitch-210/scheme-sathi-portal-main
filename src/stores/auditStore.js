/**
 * Audit Store — Zustand store wrapping AuditService
 * Only SUPER_ADMIN can access logs.
 */
import { create } from 'zustand';
import AuditService, { AUDIT_ACTIONS } from '@/services/AuditService';
import { ROLES } from '@/lib/rbac';

export { AUDIT_ACTIONS };

export const useAuditStore = create((set, get) => ({
    logs: [],
    loaded: false,

    /** Load logs from service */
    loadLogs: () => {
        AuditService.seed();
        set({ logs: AuditService.getAll(), loaded: true });
    },

    refresh: () => set({ logs: AuditService.getAll() }),

    /**
     * Log an admin action (called from other stores).
     * @param {string} actionType - AUDIT_ACTIONS constant
     * @param {string} performedBy - user id
     * @param {string} performerRole - user role
     * @param {string} targetId
     * @param {string} targetType - 'scheme' | 'application' | 'user' | 'system'
     * @param {object} metadata
     */
    logAction: (actionType, performedBy, performerRole, targetId, targetType, metadata) => {
        const result = AuditService.log(actionType, performedBy, performerRole, targetId, targetType, metadata);
        if (result.success) {
            set({ logs: AuditService.getAll() });
        }
        return result;
    },

    /** Get logs — only returns data for SUPER_ADMIN */
    getLogs: (callerRole, filters = {}) => {
        if (callerRole !== ROLES.SUPER_ADMIN) return [];
        let logs = get().logs;
        if (filters.actionType) {
            logs = logs.filter(l => l.actionType === filters.actionType);
        }
        return logs;
    },

    /** Get unique action types */
    getActionTypes: () => AuditService.getActionTypes(),
}));
