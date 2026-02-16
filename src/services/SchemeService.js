/**
 * SchemeService — CRUD for government schemes
 * All data persisted in localStorage under key: scheme_sarthi_schemes
 */

import schemesJson from '@/data/schemes.json';

const STORAGE_KEY = 'scheme_sarthi_schemes';

// ── Category / State Mappings (from services.js) ──
const categoryMap = {
    'Health': 'health', 'Education': 'education', 'Agriculture': 'agriculture',
    'Women Empowerment': 'women-empowerment', 'MSME': 'msme', 'Startup': 'startup',
    'Housing': 'housing', 'Pension': 'pension-scheme', 'Skill Development': 'skill-development',
    'Disability': 'disability', 'Minority': 'minority', 'Tribal Welfare': 'tribal-welfare',
    'Youth': 'youth', 'Digital India': 'digital-india',
};

const stateIdMap = {
    'All India': 'central', 'Gujarat': 'gujarat', 'Maharashtra': 'maharashtra',
    'Rajasthan': 'rajasthan', 'Madhya Pradesh': 'madhyapradesh', 'Uttar Pradesh': 'uttarpradesh',
    'Tamil Nadu': 'tamilnadu', 'Karnataka': 'karnataka', 'Kerala': 'kerala',
    'West Bengal': 'westbengal', 'Bihar': 'bihar', 'Odisha': 'odisha',
    'Andhra Pradesh': 'andhrapradesh', 'Telangana': 'telangana', 'Punjab': 'punjab',
    'Haryana': 'haryana', 'Jharkhand': 'jharkhand', 'Chhattisgarh': 'chhattisgarh',
    'Assam': 'assam', 'Himachal Pradesh': 'himachalpradesh', 'Uttarakhand': 'uttarakhand',
};

// ── Original non-welfare services ──
const originalServices = [
    { id: 'epf-balance', name: 'Check EPF Balance', description: 'View your Employee Provident Fund balance and recent contributions', category: 'pensions', eligibility: 'Any EPF member with UAN', documents: ['UAN Number', 'Aadhaar Card'], state: 'central' },
    { id: 'epf-claim', name: 'EPF Withdrawal Claim', description: 'Submit a claim for EPF withdrawal', category: 'pensions', eligibility: 'EPF members who have left employment', documents: ['UAN Number', 'Bank Account Details', 'Aadhaar Card', 'PAN Card'], state: 'central' },
    { id: 'pension-status', name: 'Pension Status Check', description: 'Check the status of your pension application', category: 'pensions', eligibility: 'Retired employees who have applied for pension', documents: ['PPO Number', 'Aadhaar Card'], state: 'central' },
    { id: 'atal-pension', name: 'Atal Pension Yojana', description: 'Guaranteed pension scheme for unorganized sector workers', category: 'pensions', eligibility: 'Indian citizens aged 18-40 with bank account', documents: ['Aadhaar Card', 'Bank Account Details', 'Mobile Number'], state: 'central' },
    { id: 'old-age-pension', name: 'Old Age Pension Scheme', description: 'Monthly pension for senior citizens above 60 years', category: 'pensions', eligibility: 'Citizens above 60 years with income below poverty line', documents: ['Aadhaar Card', 'Age Proof', 'Income Certificate', 'Bank Account'], state: 'central' },
    { id: 'varishtha-pension', name: 'Varishtha Pension Bima Yojana', description: 'Pension scheme for senior citizens with assured returns', category: 'pensions', eligibility: 'Senior citizens above 60 years', documents: ['Aadhaar Card', 'Age Proof', 'PAN Card', 'Bank Account'], state: 'central' },
    { id: 'driving-license', name: 'Driving License Application', description: 'Apply for new driving license or renewal', category: 'transport', eligibility: 'Indian citizens above 18 years', documents: ['Aadhaar Card', 'Address Proof', 'Passport Photo', 'Medical Certificate'], state: 'central' },
    { id: 'vehicle-registration', name: 'Vehicle Registration (RC)', description: 'Register new vehicle or transfer ownership', category: 'transport', eligibility: 'Vehicle owners', documents: ['Invoice', 'Insurance', 'Aadhaar Card', 'Address Proof'], state: 'delhi' },
    { id: 'international-dl', name: 'International Driving Permit', description: 'Apply for International Driving Permit', category: 'transport', eligibility: 'Valid Indian DL holders travelling abroad', documents: ['Valid DL', 'Passport', 'Passport Photos', 'Travel Documents'], state: 'central' },
    { id: 'learner-license', name: 'Learner License Application', description: 'Apply for learner driving license', category: 'transport', eligibility: 'Indian citizens above 16 years (for motorcycle without gear)', documents: ['Aadhaar Card', 'Age Proof', 'Passport Photo', 'Address Proof'], state: 'central' },
    { id: 'vehicle-fitness', name: 'Vehicle Fitness Certificate', description: 'Renew fitness certificate for commercial vehicles', category: 'transport', eligibility: 'Commercial vehicle owners', documents: ['RC Book', 'Insurance', 'Pollution Certificate', 'Tax Receipt'], state: 'central' },
    { id: 'fastag', name: 'FASTag Application', description: 'Apply for FASTag for electronic toll collection', category: 'transport', eligibility: 'All vehicle owners', documents: ['RC Book', 'Aadhaar Card', 'Passport Photo'], state: 'central' },
    { id: 'e-challan', name: 'E-Challan Payment', description: 'Pay traffic violation challans online', category: 'transport', eligibility: 'Anyone with pending traffic challan', documents: ['Challan Number', 'Vehicle Number'], state: 'central' },
    { id: 'electricity-bill', name: 'Pay Electricity Bill', description: 'Pay your electricity bill online', category: 'utilities', eligibility: 'All electricity consumers', documents: ['Consumer Number', 'Bill Copy'], state: 'central' },
    { id: 'gas-booking', name: 'LPG Gas Booking', description: 'Book LPG cylinder refill online', category: 'utilities', eligibility: 'LPG connection holders', documents: ['Consumer Number', 'Registered Mobile'], state: 'central' },
    { id: 'water-bill', name: 'Pay Water Bill', description: 'Pay your municipal water bill', category: 'utilities', eligibility: 'All water connection holders', documents: ['Consumer Number'], state: 'maharashtra' },
    { id: 'new-electricity', name: 'New Electricity Connection', description: 'Apply for new electricity connection', category: 'utilities', eligibility: 'Property owners without electricity connection', documents: ['Property Documents', 'Aadhaar Card', 'NOC from Society', 'Passport Photo'], state: 'central' },
    { id: 'new-water', name: 'New Water Connection', description: 'Apply for new municipal water connection', category: 'utilities', eligibility: 'Property owners without water connection', documents: ['Property Documents', 'Aadhaar Card', 'Building Plan Approval'], state: 'central' },
    { id: 'gas-subsidy', name: 'LPG Subsidy Status', description: 'Check LPG subsidy credit status', category: 'utilities', eligibility: 'LPG consumers enrolled in DBTL', documents: ['LPG Consumer Number', 'Aadhaar Number'], state: 'central' },
    { id: 'piped-gas', name: 'PNG Connection Application', description: 'Apply for Piped Natural Gas connection', category: 'utilities', eligibility: 'Residents in PNG service areas', documents: ['Property Documents', 'Aadhaar Card', 'NOC', 'Passport Photo'], state: 'central' },
    { id: 'income-tax', name: 'File Income Tax Return', description: 'File your annual income tax return online', category: 'tax-finance', eligibility: 'All taxpayers', documents: ['PAN Card', 'Aadhaar Card', 'Form 16', 'Bank Statements'], state: 'central' },
    { id: 'jan-dhan', name: 'Jan Dhan Account', description: 'Open zero-balance bank account under PMJDY', category: 'tax-finance', eligibility: 'Indian citizens without bank account', documents: ['Aadhaar Card', 'Passport Photo'], state: 'central' },
    { id: 'nps', name: 'National Pension System', description: 'Open NPS account for retirement savings', category: 'tax-finance', eligibility: 'Indian citizens aged 18-65', documents: ['Aadhaar Card', 'PAN Card', 'Bank Account Details'], state: 'central' },
    { id: 'pan-card', name: 'PAN Card Application', description: 'Apply for new PAN card or correction', category: 'tax-finance', eligibility: 'All Indian citizens and entities', documents: ['Aadhaar Card', 'Passport Photo', 'Address Proof'], state: 'central' },
    { id: 'gst-registration', name: 'GST Registration', description: 'Register for Goods and Services Tax', category: 'tax-finance', eligibility: 'Businesses with turnover above threshold', documents: ['PAN Card', 'Aadhaar Card', 'Business Proof', 'Bank Account', 'Photos'], state: 'central' },
    { id: 'pm-svanidhi', name: 'PM SVANidhi Scheme', description: 'Micro loans for street vendors', category: 'tax-finance', eligibility: 'Street vendors with certificate of vending', documents: ['Vending Certificate', 'Aadhaar Card', 'Bank Account', 'Passport Photo'], state: 'central' },
    { id: 'stand-up-india', name: 'Stand Up India Loan', description: 'Loans for SC/ST and women entrepreneurs', category: 'tax-finance', eligibility: 'SC/ST/Women entrepreneurs above 18 years', documents: ['Caste Certificate', 'Business Plan', 'Aadhaar Card', 'Bank Statements'], state: 'central' },
    { id: 'ppf', name: 'Public Provident Fund Account', description: 'Long-term savings with tax benefits', category: 'tax-finance', eligibility: 'All Indian citizens', documents: ['Aadhaar Card', 'PAN Card', 'Passport Photo', 'Address Proof'], state: 'central' },
    { id: 'tax-refund', name: 'Income Tax Refund Status', description: 'Check status of your income tax refund', category: 'tax-finance', eligibility: 'Taxpayers who have filed returns', documents: ['PAN Card', 'Acknowledgment Number'], state: 'central' },
    { id: 'property-tax', name: 'Pay Property Tax', description: 'Pay your municipal property tax online', category: 'tax-finance', eligibility: 'All property owners', documents: ['Property ID', 'Previous Receipt'], state: 'central' },
];

// ── Transform JSON schemes into app format ──
function transformScheme(scheme) {
    const incomeNum = parseInt(scheme.income_limit.replace(/[₹,\s]/g, '').replace('perannum', ''), 10) || 0;
    return {
        id: scheme.scheme_id.toLowerCase(),
        name: scheme.scheme_name,
        description: scheme.benefits.financial_assistance,
        category: categoryMap[scheme.category] || scheme.category.toLowerCase().replace(/\s+/g, '-'),
        state: stateIdMap[scheme.state] || scheme.state.toLowerCase().replace(/\s+/g, ''),
        eligibility: `${scheme.target_beneficiaries} | ${scheme.age_criteria} | Income limit: ${scheme.income_limit}`,
        documents: scheme.required_documents,
        estimatedBenefitAmount: incomeNum,
        governmentLevel: scheme.government_level,
        targetBeneficiaries: scheme.target_beneficiaries,
        incomeLimit: scheme.income_limit,
        ageCriteria: scheme.age_criteria,
        benefits: scheme.benefits,
        applicationMode: scheme.application_mode,
        applicationProcessSummary: scheme.application_process_summary,
        validityPeriod: scheme.validity_period,
        renewalRequired: scheme.renewal_required,
        applicationFee: scheme.application_fee,
        processingTimeDays: scheme.processing_time_days,
        priorityScore: scheme.priority_score,
        digitalFeatures: scheme.digital_features,
        isScheme: true,
        status: 'active',
    };
}

// ── Build seed data ──
function buildSeedData() {
    const transformed = schemesJson.map(transformScheme);
    const withStatus = originalServices.map(s => ({ ...s, status: 'active' }));
    return [...withStatus, ...transformed];
}

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
const SchemeService = {
    /** Seed localStorage if empty. Returns the full list. */
    seed() {
        if (!readFromStorage()) {
            writeToStorage(buildSeedData());
        }
        return readFromStorage();
    },

    getAll() {
        return readFromStorage() || [];
    },

    /** Only active schemes (for user-facing pages) */
    getAllActive() {
        return this.getAll().filter(s => s.status === 'active');
    },

    getById(id) {
        return this.getAll().find(s => s.id === id) || null;
    },

    /** Add a scheme (admin). Returns { success, scheme?, error? } */
    add(schemeData) {
        const all = this.getAll();
        // Duplicate name check
        if (all.some(s => s.name.toLowerCase() === schemeData.name.toLowerCase())) {
            return { success: false, error: 'A scheme with this name already exists' };
        }
        const newScheme = {
            ...schemeData,
            id: schemeData.id || `scheme-${Date.now()}`,
            status: schemeData.status || 'active',
            isScheme: true,
            createdAt: new Date().toISOString(),
        };
        all.push(newScheme);
        writeToStorage(all);
        return { success: true, scheme: newScheme };
    },

    /** Update a scheme by id (admin). Returns { success, scheme?, error? } */
    update(id, updates) {
        const all = this.getAll();
        const idx = all.findIndex(s => s.id === id);
        if (idx === -1) return { success: false, error: 'Scheme not found' };
        // Duplicate name check (excluding self)
        if (updates.name && all.some(s => s.id !== id && s.name.toLowerCase() === updates.name.toLowerCase())) {
            return { success: false, error: 'A scheme with this name already exists' };
        }
        all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
        writeToStorage(all);
        return { success: true, scheme: all[idx] };
    },

    /** Delete a scheme by id (admin) */
    remove(id) {
        const all = this.getAll().filter(s => s.id !== id);
        writeToStorage(all);
        return { success: true };
    },

    /** Toggle active/inactive */
    toggleStatus(id) {
        const all = this.getAll();
        const idx = all.findIndex(s => s.id === id);
        if (idx === -1) return { success: false, error: 'Scheme not found' };
        all[idx].status = all[idx].status === 'active' ? 'inactive' : 'active';
        writeToStorage(all);
        return { success: true, scheme: all[idx] };
    },

    /** Search schemes */
    search(query) {
        const lower = query.toLowerCase();
        return this.getAll().filter(s =>
            s.name.toLowerCase().includes(lower) ||
            s.description.toLowerCase().includes(lower) ||
            s.category.toLowerCase().includes(lower) ||
            (s.targetBeneficiaries && s.targetBeneficiaries.toLowerCase().includes(lower)) ||
            (s.governmentLevel && s.governmentLevel.toLowerCase().includes(lower))
        );
    },

    /** Filter by category and/or state */
    filter(filters) {
        return this.getAll().filter(s => {
            if (filters.category && s.category !== filters.category) return false;
            if (filters.state && s.state !== filters.state && s.state !== 'central') return false;
            if (filters.status && s.status !== filters.status) return false;
            return true;
        });
    },
};

export default SchemeService;
