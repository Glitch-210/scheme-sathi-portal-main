/**
 * AnalyticsService — Pure computation layer for dashboard analytics.
 * Derives ALL data from existing services. Zero duplicate storage.
 * Every function accepts a `filters` object: { dateRange, scheme, state, status }
 */

import ApplicationService from './ApplicationService';
import UserService from './UserService';
import { ADMIN_ROLES } from '@/lib/rbac';

// ── Helpers ──

/** Filter applications by the global filter object */
function filterApplications(apps, filters = {}) {
    let filtered = [...apps];

    // Date range
    if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).getTime();
        filtered = filtered.filter(a => new Date(a.dateApplied).getTime() >= from);
    }
    if (filters.dateTo) {
        const to = new Date(filters.dateTo).getTime() + 86400000; // include end day
        filtered = filtered.filter(a => new Date(a.dateApplied).getTime() <= to);
    }

    // Scheme
    if (filters.scheme) {
        filtered = filtered.filter(a => a.serviceId === filters.scheme);
    }

    // State (derived from user)
    if (filters.state) {
        const users = UserService.getAllSafe();
        const userMap = {};
        users.forEach(u => { userMap[u.id] = u; });
        filtered = filtered.filter(a => {
            const u = userMap[a.userId];
            return u && u.state === filters.state;
        });
    }

    // Status
    if (filters.status) {
        filtered = filtered.filter(a => a.status === filters.status);
    }

    return filtered;
}

/** Calculate processing time in days for a resolved application */
function getProcessingDays(app) {
    if (app.status !== 'approved' && app.status !== 'rejected') return null;
    const history = app.statusHistory || [];
    const submitted = history.find(h => h.status === 'pending');
    const resolved = [...history].reverse().find(h => h.status === 'approved' || h.status === 'rejected');
    if (!submitted || !resolved) return null;
    const diff = new Date(resolved.date).getTime() - new Date(submitted.date).getTime();
    return Math.max(0, Math.round(diff / 86400000));
}

/** Get non-admin users */
function getRegularUsers() {
    return UserService.getAllSafe().filter(u => !ADMIN_ROLES.includes(u.role));
}

// Build a user → state lookup
function getUserStateMap() {
    const map = {};
    UserService.getAllSafe().forEach(u => { map[u.id] = u.state || 'unknown'; });
    return map;
}

/** Parse a preset date range into dateFrom/dateTo */
export function parseDatePreset(preset) {
    const now = new Date();
    switch (preset) {
        case '7d': {
            const from = new Date(now);
            from.setDate(from.getDate() - 7);
            return { dateFrom: from.toISOString().split('T')[0], dateTo: now.toISOString().split('T')[0] };
        }
        case '30d': {
            const from = new Date(now);
            from.setDate(from.getDate() - 30);
            return { dateFrom: from.toISOString().split('T')[0], dateTo: now.toISOString().split('T')[0] };
        }
        case '6m': {
            const from = new Date(now);
            from.setMonth(from.getMonth() - 6);
            return { dateFrom: from.toISOString().split('T')[0], dateTo: now.toISOString().split('T')[0] };
        }
        case 'all':
        default:
            return { dateFrom: null, dateTo: null };
    }
}

// ── Public API ──

const AnalyticsService = {

    /**
     * Section 1: KPI Summary Cards
     * Returns aggregated key performance indicators.
     */
    getKpiSummary(filters = {}) {
        const allApps = ApplicationService.getAll();
        const apps = filterApplications(allApps, filters);
        const users = getRegularUsers();

        // Active users (joined in last 30 days as proxy for "active")
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = users.filter(u =>
            u.status === 'active' && u.joinedAt && new Date(u.joinedAt).getTime() >= thirtyDaysAgo.getTime()
        );

        const approved = apps.filter(a => a.status === 'approved').length;
        const rejected = apps.filter(a => a.status === 'rejected').length;
        const pending = apps.filter(a => a.status === 'pending').length;
        const total = apps.length;

        // Most applied scheme
        const schemeCounts = {};
        apps.forEach(a => {
            schemeCounts[a.serviceName] = (schemeCounts[a.serviceName] || 0) + 1;
        });
        const topScheme = Object.entries(schemeCounts)
            .sort((a, b) => b[1] - a[1])[0];

        // Average processing time
        const processingTimes = apps.map(getProcessingDays).filter(d => d !== null);
        const avgProcessing = processingTimes.length > 0
            ? Math.round(processingTimes.reduce((s, v) => s + v, 0) / processingTimes.length)
            : 0;

        return {
            totalUsers: users.length,
            activeUsers: activeUsers.length,
            totalApplications: total,
            approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
            rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
            pendingApplications: pending,
            mostAppliedScheme: topScheme ? { name: topScheme[0], count: topScheme[1] } : null,
            avgProcessingDays: avgProcessing,
        };
    },

    /**
     * Section 2: Application Trends (line chart data)
     * Returns monthly application counts.
     */
    getApplicationTrends(filters = {}) {
        const apps = filterApplications(ApplicationService.getAll(), filters);
        const months = {};

        apps.forEach(a => {
            const d = new Date(a.dateApplied);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!months[key]) months[key] = { key, label, applications: 0, approved: 0, rejected: 0 };
            months[key].applications++;
            if (a.status === 'approved') months[key].approved++;
            if (a.status === 'rejected') months[key].rejected++;
        });

        return Object.values(months).sort((a, b) => a.key.localeCompare(b.key));
    },

    /**
     * Section 3: Status Distribution (donut chart data)
     */
    getStatusDistribution(filters = {}) {
        const apps = filterApplications(ApplicationService.getAll(), filters);
        return [
            { name: 'Approved', value: apps.filter(a => a.status === 'approved').length, color: '#22c55e' },
            { name: 'Rejected', value: apps.filter(a => a.status === 'rejected').length, color: '#ef4444' },
            { name: 'Pending', value: apps.filter(a => a.status === 'pending').length, color: '#eab308' },
            { name: 'Under Review', value: apps.filter(a => a.status === 'under_review').length, color: '#3b82f6' },
        ].filter(d => d.value > 0);
    },

    /**
     * Section 4: Top Performing Schemes (table data)
     */
    getTopSchemes(filters = {}) {
        const apps = filterApplications(ApplicationService.getAll(), filters);
        const schemeMap = {};

        apps.forEach(a => {
            const key = a.serviceId || a.serviceName;
            if (!schemeMap[key]) {
                schemeMap[key] = { id: key, name: a.serviceName, total: 0, approved: 0, rejected: 0, processingTimes: [] };
            }
            schemeMap[key].total++;
            if (a.status === 'approved') schemeMap[key].approved++;
            if (a.status === 'rejected') schemeMap[key].rejected++;
            const days = getProcessingDays(a);
            if (days !== null) schemeMap[key].processingTimes.push(days);
        });

        return Object.values(schemeMap).map(s => ({
            id: s.id,
            name: s.name,
            totalApplications: s.total,
            approvalRate: s.total > 0 ? Math.round((s.approved / s.total) * 100) : 0,
            rejectionRate: s.total > 0 ? Math.round((s.rejected / s.total) * 100) : 0,
            avgProcessingDays: s.processingTimes.length > 0
                ? Math.round(s.processingTimes.reduce((a, b) => a + b, 0) / s.processingTimes.length)
                : null,
        })).sort((a, b) => b.totalApplications - a.totalApplications);
    },

    /**
     * Section 5: State-wise Distribution (stacked bar chart)
     */
    getStateDistribution(filters = {}) {
        const apps = filterApplications(ApplicationService.getAll(), filters);
        const stateMap = getUserStateMap();
        const states = {};

        apps.forEach(a => {
            const st = stateMap[a.userId] || 'unknown';
            if (!states[st]) states[st] = { state: st, total: 0, approved: 0, rejected: 0, pending: 0 };
            states[st].total++;
            if (a.status === 'approved') states[st].approved++;
            else if (a.status === 'rejected') states[st].rejected++;
            else states[st].pending++;
        });

        return Object.values(states)
            .sort((a, b) => b.total - a.total)
            .map(s => ({
                ...s,
                state: s.state.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            }));
    },

    /**
     * Section 6: Processing Time Analysis
     */
    getProcessingStats(filters = {}) {
        const apps = filterApplications(ApplicationService.getAll(), filters);
        const times = apps.map(getProcessingDays).filter(d => d !== null);

        if (times.length === 0) {
            return { average: 0, fastest: 0, slowest: 0, distribution: [], count: 0 };
        }

        const sorted = [...times].sort((a, b) => a - b);
        const avg = Math.round(times.reduce((s, v) => s + v, 0) / times.length);

        // Distribution buckets
        const buckets = [
            { range: '0-2 days', min: 0, max: 2, count: 0 },
            { range: '3-5 days', min: 3, max: 5, count: 0 },
            { range: '6-10 days', min: 6, max: 10, count: 0 },
            { range: '11-15 days', min: 11, max: 15, count: 0 },
            { range: '16+ days', min: 16, max: Infinity, count: 0 },
        ];
        times.forEach(t => {
            const bucket = buckets.find(b => t >= b.min && t <= b.max);
            if (bucket) bucket.count++;
        });

        return {
            average: avg,
            fastest: sorted[0],
            slowest: sorted[sorted.length - 1],
            distribution: buckets.map(({ range, count }) => ({ range, count })),
            count: times.length,
        };
    },

    /**
     * Section 7: Drop-off Analysis
     */
    getDropOffStats() {
        const users = getRegularUsers();
        const apps = ApplicationService.getAll();

        const usersWithApps = new Set(apps.map(a => a.userId));
        const totalUsers = users.length;
        const usersWithoutApps = users.filter(u => !usersWithApps.has(u.id)).length;
        const dropOffRate = totalUsers > 0 ? Math.round((usersWithoutApps / totalUsers) * 100) : 0;

        return {
            totalRegistered: totalUsers,
            usersWithApplications: totalUsers - usersWithoutApps,
            usersWithoutApplications: usersWithoutApps,
            dropOffRate,
        };
    },

    /**
     * Get unique filter options for the filter panel
     */
    getFilterOptions() {
        const apps = ApplicationService.getAll();
        const stateMap = getUserStateMap();

        const schemeOptions = [...new Set(apps.map(a => a.serviceId))].map(id => {
            const app = apps.find(a => a.serviceId === id);
            return { value: id, label: app?.serviceName || id };
        });

        const stateOptions = [...new Set(Object.values(stateMap))]
            .filter(s => s !== 'unknown' && s !== 'central')
            .sort()
            .map(s => ({
                value: s,
                label: s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            }));

        return { schemeOptions, stateOptions };
    },
};

export default AnalyticsService;
