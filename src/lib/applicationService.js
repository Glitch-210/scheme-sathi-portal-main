import { supabase } from './supabase';

/**
 * Generates a unique Application ID in the format SSA-YYYY-XXXXX
 */
export const generateApplicationId = () => {
    const year = new Date().getFullYear();
    const randomStr = Math.floor(10000 + Math.random() * 90000); // 5 digit random
    return `SSA-${year}-${randomStr}`;
};

/**
 * Creates a new application in Supabase
 * @param {Object} payload The application data payload
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const createApplication = async (payload) => {
    try {
        let appId = generateApplicationId();
        let isUnique = false;
        let attempts = 0;

        // Retry loop to ensure zero collisions
        while (!isUnique && attempts < 3) {
            const { data: existing } = await supabase
                .from('applications')
                .select('application_id')
                .eq('application_id', appId)
                .single();

            if (!existing) {
                isUnique = true;
            } else {
                appId = generateApplicationId();
                attempts++;
            }
        }

        if (!isUnique) {
            return { success: false, error: "Failed to generate a unique Application ID. Please try again." };
        }

        const applicationRecord = {
            application_id: appId,
            user_id: payload.userId,
            scheme_id: payload.serviceId,
            scheme_name: payload.serviceName,
            status: 'Pending',
            form_data: payload.formData
        };

        const { data, error } = await supabase
            .from('applications')
            .insert([applicationRecord])
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Application creation failed:", error);
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
};

/**
 * Fetches all applications for a given user ID
 * @param {string} userId 
 * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
 */
export const getUserApplications = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false });

        if (error) {
            console.error("Supabase fetch error:", error);
            return { success: false, error: error.message };
        }

        // Map the database snake_case format back to camelCase mapping frontend uses.
        const mapped = (data || []).map(app => ({
            id: app.application_id, // Exposing the generated SSA- ID as the primary ID used in UI
            internalId: app.id,
            userId: app.user_id,
            serviceId: app.scheme_id,
            serviceName: app.scheme_name,
            status: (app.status || '').toLowerCase().replace(' ', '-'), // Handle generic DB status strings
            dateApplied: app.submitted_at,
            formData: app.form_data
        }));

        return { success: true, data: mapped };
    } catch (error) {
        console.error("Fetching applications failed:", error);
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
};
