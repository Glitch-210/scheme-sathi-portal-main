/**
 * AuditService — Immutable audit log for all admin actions
 * Persisted in localStorage under key: scheme_sarthi_audit_logs
 */

const STORAGE_KEY = 'scheme_sarthi_audit_logs';

/** Action type constants */
export const AUDIT_ACTIONS = {
    SCHEME_CREATED: 'SCHEME_CREATED',
    SCHEME_UPDATED: 'SCHEME_UPDATED',
    SCHEME_DELETED: 'SCHEME_DELETED',
    SCHEME_TOGGLED: 'SCHEME_TOGGLED',
    APPLICATION_REVIEWED: 'APPLICATION_REVIEWED',
    APPLICATION_APPROVED: 'APPLICATION_APPROVED',
    APPLICATION_REJECTED: 'APPLICATION_REJECTED',
    USER_BLOCKED: 'USER_BLOCKED',
    USER_UNBLOCKED: 'USER_UNBLOCKED',
    ROLE_UPDATED: 'ROLE_UPDATED',
    NOTIFICATION_BROADCAST: 'NOTIFICATION_BROADCAST',
    PASSWORD_CHANGED: 'PASSWORD_CHANGED',
    MAINTENANCE_TOGGLED: 'MAINTENANCE_TOGGLED',
};

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

// ── Dedup: prevent identical log within 1-second window ──
function isDuplicate(logs, actionType, targetId) {
    const now = Date.now();
    return logs.some(l =>
        l.actionType === actionType &&
        l.targetId === targetId &&
        (now - new Date(l.timestamp).getTime()) < 1000
    );
}

// ── Public API ──
const AuditService = {
    /** Seed empty array if nothing exists */
    seed() {
        if (!readFromStorage()) {
            writeToStorage([]);
        }
    },

    /** Get all logs (newest first) */
    getAll() {
        return (readFromStorage() || []).sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
    },

    /**
     * Create an audit log entry.
     * @param {string} actionType - One of AUDIT_ACTIONS
     * @param {string} performedBy - User ID of the performer
     * @param {string} performerRole - Role of the performer
     * @param {string} targetId - ID of affected entity
     * @param {string} targetType - Type: 'scheme', 'application', 'user', 'system'
     * @param {object} metadata - Additional context
     */
    log(actionType, performedBy, performerRole, targetId, targetType, metadata = {}) {
        const all = this.getAll();

        // Duplicate prevention
        if (isDuplicate(all, actionType, targetId)) {
            return { success: false, error: 'Duplicate log entry' };
        }

        const entry = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            actionType,
            performedBy,
            performerRole,
            targetId: targetId || 'N/A',
            targetType: targetType || 'system',
            metadata,
            timestamp: new Date().toISOString(),
        };

        all.unshift(entry);
        writeToStorage(all);
        return { success: true, entry };
    },

    /** Filter logs by action type */
    getByActionType(actionType) {
        return this.getAll().filter(l => l.actionType === actionType);
    },

    /** Get unique action types present in logs */
    getActionTypes() {
        const types = new Set(this.getAll().map(l => l.actionType));
        return [...types];
    },
};

export default AuditService;
