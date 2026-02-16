/**
 * NotificationService — Create, read, mark-read notifications
 * Persisted in localStorage under key: scheme_sarthi_notifications
 * Supports auto-triggers, broadcast, and per-user targeting
 */

const STORAGE_KEY = 'scheme_sarthi_notifications';

// ── Notification type constants ──
export const NOTIF_TYPES = {
    APPROVAL: 'approval',
    REJECTION: 'rejection',
    SYSTEM: 'system',
    ANNOUNCEMENT: 'announcement',
    SCHEME: 'scheme',
};

// ── Seed data ──
const seedNotifications = [
    {
        id: 'n-seed-1',
        title: 'New Scheme Launched',
        description: 'PM Vishwakarma Yojana is now accepting applications.',
        target: 'all',
        userId: null,
        sentAt: '2026-02-10T10:00:00.000Z',
        status: 'sent',
        read: false,
        type: NOTIF_TYPES.SCHEME,
    },
    {
        id: 'n-seed-2',
        title: 'Deadline Reminder',
        description: 'PM Kisan registration deadline extended to March 31.',
        target: 'all',
        userId: null,
        sentAt: '2026-02-08T10:00:00.000Z',
        status: 'sent',
        read: false,
        type: NOTIF_TYPES.ANNOUNCEMENT,
    },
    {
        id: 'n-seed-3',
        title: 'Maintenance Notice',
        description: 'Portal will be under maintenance on Feb 15, 2-4 AM.',
        target: 'all',
        userId: null,
        sentAt: '2026-02-05T10:00:00.000Z',
        status: 'sent',
        read: false,
        type: NOTIF_TYPES.ANNOUNCEMENT,
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

// ── Dedup: prevent same userId+title within 60s ──
function isDuplicate(all, userId, title) {
    const now = Date.now();
    return all.some(n =>
        n.userId === userId &&
        n.title === title &&
        (now - new Date(n.sentAt).getTime()) < 60000
    );
}

// ── Public API ──
const NotificationService = {
    /** Seed localStorage if empty */
    seed() {
        if (!readFromStorage()) {
            writeToStorage(seedNotifications);
        }
        return readFromStorage();
    },

    /** Get all notifications (admin) */
    getAll() {
        return readFromStorage() || [];
    },

    /** Get notifications for a specific user */
    getByUser(userId) {
        return this.getAll().filter(n =>
            n.target === 'all' || n.userId === userId
        );
    },

    /** Add a notification (generic) */
    add(notifData) {
        const all = this.getAll();

        // Dedup check
        if (notifData.userId && isDuplicate(all, notifData.userId, notifData.title)) {
            return { success: false, error: 'Duplicate notification' };
        }

        const newNotif = {
            id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: notifData.title,
            description: notifData.description || notifData.message || '',
            target: notifData.target || (notifData.userId ? 'user' : 'all'),
            userId: notifData.userId || null,
            sentAt: new Date().toISOString(),
            status: 'sent',
            read: false,
            type: notifData.type || NOTIF_TYPES.ANNOUNCEMENT,
        };
        all.unshift(newNotif);
        writeToStorage(all);
        return { success: true, notification: newNotif };
    },

    /**
     * Send notification to a specific user
     */
    sendToUser(userId, title, message, type = NOTIF_TYPES.SYSTEM) {
        return this.add({
            userId,
            title,
            description: message,
            target: 'user',
            type,
        });
    },

    /**
     * Broadcast to all users
     */
    broadcastToAll(title, message, type = NOTIF_TYPES.ANNOUNCEMENT) {
        return this.add({
            title,
            description: message,
            target: 'all',
            type,
        });
    },

    /** Mark a notification as read */
    markRead(notifId) {
        const all = this.getAll();
        const idx = all.findIndex(n => n.id === notifId);
        if (idx === -1) return { success: false };
        all[idx].read = true;
        writeToStorage(all);
        return { success: true };
    },

    /** Mark all notifications as read for a user */
    markAllRead(userId) {
        const all = this.getAll();
        all.forEach(n => {
            if (n.target === 'all' || n.userId === userId) {
                n.read = true;
            }
        });
        writeToStorage(all);
        return { success: true };
    },

    /** Get count of unread for a user */
    getUnreadCount(userId) {
        return this.getByUser(userId).filter(n => !n.read).length;
    },
};

export default NotificationService;
