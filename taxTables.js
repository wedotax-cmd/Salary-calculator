/**
 * SARS Tax Tables for South African Salary Calculator
 * We Do Tax Services (Pty) Ltd
 * 
 * Tax tables for years 2024/2025, 2025/2026, and 2026/2027
 */

const SARS_TAX_TABLES = {
    // 2024/2025 Tax Year
    2024: {
        year: "2024/2025",
        primaryRebate: 17235,       // 18% of R95,750
        secondaryRebate: 9444,      // Age 65-74
        tertiaryRebate: 3145,       // Age 75+
        medicalAidCredit: {
            mainMember: 364,
            firstDependent: 364,
            additionalDependents: 246
        },
        uifCap: 177.12,
        uifRate: 0.01,
        sdlRate: 0.01,
        brackets: [
            { min: 0, max: 237100, rate: 0.18, base: 0 },
            { min: 237101, max: 370500, rate: 0.26, base: 42678 },
            { min: 370501, max: 512800, rate: 0.31, base: 77362 },
            { min: 512801, max: 673000, rate: 0.36, base: 121475 },
            { min: 673001, max: 857900, rate: 0.39, base: 179147 },
            { min: 857901, max: Infinity, rate: 0.45, base: 251258 }
        ]
    },
    
    // 2025/2026 Tax Year
    2025: {
        year: "2025/2026",
        primaryRebate: 17235,       // Kept same as 2024/2025
        secondaryRebate: 9444,      // Age 65-74
        tertiaryRebate: 3145,       // Age 75+
        medicalAidCredit: {
            mainMember: 364,
            firstDependent: 364,
            additionalDependents: 246
        },
        uifCap: 177.12,
        uifRate: 0.01,
        sdlRate: 0.01,
        brackets: [
            { min: 0, max: 246000, rate: 0.18, base: 0 },
            { min: 246001, max: 384200, rate: 0.26, base: 44280 },
            { min: 384201, max: 532200, rate: 0.31, base: 80212 },
            { min: 532201, max: 698200, rate: 0.36, base: 126092 },
            { min: 698201, max: 889300, rate: 0.39, base: 185852 },
            { min: 889301, max: Infinity, rate: 0.45, base: 260381 }
        ]
    },
    
    // 2026/2027 Tax Year
    2026: {
        year: "2026/2027",
        primaryRebate: 17235,       // Using confirmed amount (18% of R95,750)
        secondaryRebate: 9444,      // Age 65-74
        tertiaryRebate: 3145,       // Age 75+
        medicalAidCredit: {
            mainMember: 364,
            firstDependent: 364,
            additionalDependents: 246
        },
        uifCap: 177.12,
        uifRate: 0.01,
        sdlRate: 0.01,
        brackets: [
            { min: 0, max: 255000, rate: 0.18, base: 0 },
            { min: 255001, max: 398300, rate: 0.26, base: 45900 },
            { min: 398301, max: 552200, rate: 0.31, base: 83158 },
            { min: 552201, max: 724800, rate: 0.36, base: 130867 },
            { min: 724801, max: 922600, rate: 0.39, base: 193003 },
            { min: 922601, max: Infinity, rate: 0.45, base: 270145 }
        ]
    }
};

/**
 * Get tax table for specific year
 * @param {string|number} year - Tax year (2024, 2025, 2026)
 * @returns {Object} Tax table object
 */
function getTaxTable(year) {
    const yearKey = String(year);
    if (!SARS_TAX_TABLES[yearKey]) {
        console.warn(`Tax table not found for year ${year}, defaulting to 2026`);
        return SARS_TAX_TABLES['2026'];
    }
    return SARS_TAX_TABLES[yearKey];
}

/**
 * Calculate PAYE tax based on taxable income
 * @param {number} monthlyTaxableIncome - Monthly taxable income
 * @param {string|number} year - Tax year
 * @returns {Object} Tax calculation details
 */
function calculatePAYE(monthlyTaxableIncome, year = '2026') {
    const taxTable = getTaxTable(year);
    const brackets = taxTable.brackets;
    
    // Convert monthly income to annual for tax calculation
    const annualTaxableIncome = monthlyTaxableIncome * 12;
    
    let annualTax = 0;
    let bracketDetails = [];
    
    for (let i = 0; i < brackets.length; i++) {
        const bracket = brackets[i];
        
        if (annualTaxableIncome > bracket.min) {
            const taxableInBracket = Math.min(
                annualTaxableIncome - bracket.min,
                bracket.max - bracket.min
            );
            
            const taxInBracket = taxableInBracket * bracket.rate;
            annualTax = bracket.base + taxInBracket;
            
            bracketDetails.push({
                range: `R${bracket.min.toLocaleString()} - R${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
                rate: `${(bracket.rate * 100).toFixed(0)}%`,
                taxableAmount: taxableInBracket,
                taxAmount: taxInBracket
            });
            
            if (annualTaxableIncome <= bracket.max) {
                break;
            }
        }
    }
    
    // Apply primary rebate (annual)
    const annualRebate = taxTable.primaryRebate;
    annualTax = Math.max(0, annualTax - annualRebate);
    
    // Convert to monthly amounts
    const monthlyGrossTax = (annualTax + annualRebate) / 12;
    const monthlyRebate = annualRebate / 12;
    const monthlyNetTax = annualTax / 12;
    
    return {
        grossTax: monthlyGrossTax,
        primaryRebate: monthlyRebate,
        netTax: monthlyNetTax,
        brackets: bracketDetails,
        effectiveRate: monthlyTaxableIncome > 0 ? (monthlyNetTax / monthlyTaxableIncome) * 100 : 0,
        annualTaxableIncome: annualTaxableIncome,
        annualTax: annualTax
    };
}

/**
 * Calculate UIF contribution
 * @param {number} grossIncome - Gross monthly income
 * @param {string|number} year - Tax year
 * @returns {number} UIF amount (capped)
 */
function calculateUIF(grossIncome, year = '2026') {
    const taxTable = getTaxTable(year);
    const uif = grossIncome * taxTable.uifRate;
    return Math.min(uif, taxTable.uifCap);
}

/**
 * Calculate Skills Development Levy
 * @param {number} grossIncome - Gross monthly income
 * @param {string|number} year - Tax year
 * @returns {number} SDL amount
 */
function calculateSDL(grossIncome, year = '2026') {
    const taxTable = getTaxTable(year);
    return grossIncome * taxTable.sdlRate;
}

/**
 * Calculate Medical Aid Tax Credit
 * @param {number} dependents - Number of dependents (excluding main member)
 * @param {string|number} year - Tax year
 * @returns {number} Monthly tax credit
 */
function calculateMedicalAidTaxCredit(dependents = 0, year = '2026') {
    const taxTable = getTaxTable(year);
    const credits = taxTable.medicalAidCredit;
    
    let totalCredit = credits.mainMember; // Main member
    
    if (dependents >= 1) {
        totalCredit += credits.firstDependent; // First dependent
    }
    
    if (dependents > 1) {
        totalCredit += (dependents - 1) * credits.additionalDependents; // Additional dependents
    }
    
    return totalCredit;
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Get all available tax years
 * @returns {Array} Array of tax year objects
 */
function getAvailableTaxYears() {
    return Object.keys(SARS_TAX_TABLES).map(year => ({
        value: year,
        label: SARS_TAX_TABLES[year].year
    }));
}
