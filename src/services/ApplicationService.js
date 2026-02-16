/**
 * ApplicationService — Create, read, update applications
 * Persisted in localStorage under key: scheme_sarthi_applications
 * Status flow: pending → under_review → approved/rejected
 * Once approved/rejected → locked (no further changes)
 */

const STORAGE_KEY = 'scheme_sarthi_applications';

/** Valid status transitions */
const VALID_TRANSITIONS = {
    pending: ['under_review'],
    under_review: ['approved', 'rejected'],
    // approved and rejected are terminal states — no transitions allowed
};

// ── Seed data (demo applications with statusHistory) ──
const seedApplications = [
    {
        id: 'APP-2024-001', userId: 'u-demo-1', serviceId: 'pm-kisan', serviceName: 'PM Kisan Samman Nidhi',
        status: 'pending', dateApplied: '2026-01-15T10:00:00.000Z', lastUpdated: '2026-01-15T10:00:00.000Z',
        category: 'agriculture', formData: { fullName: 'Rahul Sharma', mobile: '9876543210' }, remarks: '',
        statusHistory: [
            { status: 'pending', updatedBy: 'system', remark: 'Application submitted', date: '2026-01-15T10:00:00.000Z' },
        ],
    },
    {
        id: 'APP-2024-002', userId: 'u-demo-2', serviceId: 'ayushman-bharat', serviceName: 'Ayushman Bharat Yojana',
        status: 'approved', dateApplied: '2026-01-10T09:30:00.000Z', lastUpdated: '2026-01-20T11:00:00.000Z',
        category: 'health', formData: { fullName: 'Priya Patel', mobile: '9876543211' }, remarks: 'All documents verified',
        statusHistory: [
            { status: 'pending', updatedBy: 'system', remark: 'Application submitted', date: '2026-01-10T09:30:00.000Z' },
            { status: 'under_review', updatedBy: 'u-admin-3', remark: 'Picked up for review', date: '2026-01-15T10:00:00.000Z' },
            { status: 'approved', updatedBy: 'u-admin-1', remark: 'All documents verified', date: '2026-01-20T11:00:00.000Z' },
        ],
    },
    {
        id: 'APP-2024-003', userId: 'u-demo-4', serviceId: 'sukanya-samriddhi', serviceName: 'Sukanya Samriddhi Yojana',
        status: 'rejected', dateApplied: '2026-01-08T08:00:00.000Z', lastUpdated: '2026-01-18T09:00:00.000Z',
        category: 'women-empowerment', formData: { fullName: 'Sneha Reddy', mobile: '9876543213' }, remarks: 'Income exceeds limit',
        statusHistory: [
            { status: 'pending', updatedBy: 'system', remark: 'Application submitted', date: '2026-01-08T08:00:00.000Z' },
            { status: 'under_review', updatedBy: 'u-admin-3', remark: 'Under verification', date: '2026-01-12T10:00:00.000Z' },
            { status: 'rejected', updatedBy: 'u-admin-1', remark: 'Income exceeds limit', date: '2026-01-18T09:00:00.000Z' },
        ],
    },
    {
        id: 'APP-2024-004', userId: 'u-demo-7', serviceId: 'pmay-housing', serviceName: 'PMAY - Housing for All',
        status: 'under_review', dateApplied: '2026-01-20T11:00:00.000Z', lastUpdated: '2026-01-25T09:00:00.000Z',
        category: 'housing', formData: { fullName: 'Rajesh Kumar', mobile: '9876543216' }, remarks: '',
        statusHistory: [
            { status: 'pending', updatedBy: 'system', remark: 'Application submitted', date: '2026-01-20T11:00:00.000Z' },
            { status: 'under_review', updatedBy: 'u-admin-3', remark: 'Document verification in progress', date: '2026-01-25T09:00:00.000Z' },
        ],
    },
    {
        id: 'APP-2024-005', userId: 'u-demo-10', serviceId: 'digital-india-scholarship', serviceName: 'Digital India Scholarship',
        status: 'approved', dateApplied: '2026-01-05T07:30:00.000Z', lastUpdated: '2026-01-15T10:00:00.000Z',
        category: 'digital-india', formData: { fullName: 'Meera Iyer', mobile: '9876543219' }, remarks: 'Verified by district office',
        statusHistory: [
            { status: 'pending', updatedBy: 'system', remark: 'Application submitted', date: '2026-01-05T07:30:00.000Z' },
            { status: 'under_review', updatedBy: 'u-admin-3', remark: 'Picked up for review', date: '2026-01-10T10:00:00.000Z' },
            { status: 'approved', updatedBy: 'u-admin-1', remark: 'Verified by district office', date: '2026-01-15T10:00:00.000Z' },
        ],
    },
    {
        id: 'APP-2024-006', userId: 'u-demo-6', serviceId: 'mudra-yojana', serviceName: 'Mudra Yojana',
        status: 'pending', dateApplied: '2026-01-22T08:00:00.000Z', lastUpdated: '2026-01-22T08:00:00.000Z',
        category: 'msme', formData: { fullName: 'Kavita Nair', mobile: '9876543215' }, remarks: '',
        statusHistory: [
            { status: 'pending', updatedBy: 'system', remark: 'Application submitted', date: '2026-01-22T08:00:00.000Z' },
        ],
    },
    {
        id: 'APP-2024-007', userId: 'u-demo-1', serviceId: 'ayushman-bharat', serviceName: 'Ayushman Bharat Yojana',
        status: 'approved', dateApplied: '2025-12-28T09:00:00.000Z', lastUpdated: '2026-01-05T10:00:00.000Z',
        category: 'health', formData: { fullName: 'Rahul Sharma', mobile: '9876543210' }, remarks: 'Auto-approved',
        statusHistory: [
            { status: 'pending', updatedBy: 'system', remark: 'Application submitted', date: '2025-12-28T09:00:00.000Z' },
            { status: 'under_review', updatedBy: 'u-admin-3', remark: 'Fast-track review', date: '2026-01-02T10:00:00.000Z' },
            { status: 'approved', updatedBy: 'u-admin-1', remark: 'Auto-approved', date: '2026-01-05T10:00:00.000Z' },
        ],
    },
    {
        id: 'APP-2024-008', userId: 'u-demo-5', serviceId: 'kisan-credit-card', serviceName: 'Kisan Credit Card',
        status: 'rejected', dateApplied: '2026-01-18T10:00:00.000Z', lastUpdated: '2026-01-25T09:00:00.000Z',
        category: 'agriculture', formData: { fullName: 'Vikram Joshi', mobile: '9876543214' }, remarks: 'Missing land documents',
        statusHistory: [
            { status: 'pending', updatedBy: 'system', remark: 'Application submitted', date: '2026-01-18T10:00:00.000Z' },
            { status: 'under_review', updatedBy: 'u-admin-3', remark: 'Document check initiated', date: '2026-01-22T10:00:00.000Z' },
            { status: 'rejected', updatedBy: 'u-admin-1', remark: 'Missing land documents', date: '2026-01-25T09:00:00.000Z' },
        ],
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
const ApplicationService = {
    /** Seed localStorage if empty */
    seed() {
        if (!readFromStorage()) {
            writeToStorage(seedApplications);
        }
        return readFromStorage();
    },

    getAll() {
        return readFromStorage() || [];
    },

    getByUser(userId) {
        return this.getAll().filter(app => app.userId === userId);
    },

    getById(id) {
        return this.getAll().find(app => app.id === id) || null;
    },

    /**
     * Create a new application.
     * Prevents duplicate: same user + same service (unless previous was rejected)
     */
    create(userId, serviceId, serviceName, category, formData) {
        const all = this.getAll();

        const exists = all.find(a => a.userId === userId && a.serviceId === serviceId && a.status !== 'rejected');
        if (exists) {
            return { success: false, error: 'You have already applied for this scheme' };
        }

        const now = new Date().toISOString();
        const newApp = {
            id: `APP-${Date.now()}`,
            userId,
            serviceId,
            serviceName,
            category: category || 'general',
            status: 'pending',
            dateApplied: now,
            lastUpdated: now,
            formData: formData || {},
            remarks: '',
            statusHistory: [
                { status: 'pending', updatedBy: 'system', remark: 'Application submitted', date: now },
            ],
        };

        all.push(newApp);
        writeToStorage(all);
        return { success: true, application: newApp };
    },

    /**
     * Move application to under_review (admin action).
     * Only pending → under_review is allowed.
     */
    moveToReview(appId, updatedBy) {
        return this._transition(appId, 'under_review', 'Picked up for review', updatedBy);
    },

    /**
     * Update application status (admin only).
     * Only under_review → approved/rejected is allowed.
     * Rejection requires remarks.
     */
    updateStatus(appId, newStatus, remarks, updatedBy) {
        if (newStatus === 'rejected' && (!remarks || !remarks.trim())) {
            return { success: false, error: 'Rejection requires a remark.' };
        }
        return this._transition(appId, newStatus, remarks || '', updatedBy);
    },

    /**
     * Internal: perform a status transition with validation.
     */
    _transition(appId, newStatus, remark, updatedBy) {
        const all = this.getAll();
        const idx = all.findIndex(a => a.id === appId);
        if (idx === -1) return { success: false, error: 'Application not found' };

        const app = all[idx];
        const allowed = VALID_TRANSITIONS[app.status];

        if (!allowed || !allowed.includes(newStatus)) {
            return {
                success: false,
                error: `Cannot transition from "${app.status}" to "${newStatus}". Allowed: ${(allowed || []).join(', ') || 'none (terminal state)'}.`,
            };
        }

        const now = new Date().toISOString();
        const historyEntry = {
            status: newStatus,
            updatedBy: updatedBy || 'system',
            remark: remark || '',
            date: now,
        };

        all[idx] = {
            ...app,
            status: newStatus,
            remarks: remark || app.remarks,
            lastUpdated: now,
            statusHistory: [...(app.statusHistory || []), historyEntry],
        };

        writeToStorage(all);
        return { success: true, application: all[idx] };
    },

    /** Get statistics for admin dashboard */
    getStats() {
        const all = this.getAll();
        return {
            total: all.length,
            pending: all.filter(a => a.status === 'pending').length,
            under_review: all.filter(a => a.status === 'under_review').length,
            approved: all.filter(a => a.status === 'approved').length,
            rejected: all.filter(a => a.status === 'rejected').length,
            approvalRate: all.length > 0
                ? Math.round((all.filter(a => a.status === 'approved').length / all.length) * 100)
                : 0,
        };
    },
};

export default ApplicationService;
