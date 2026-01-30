/**
 * Salary Calculator Engine
 * We Do Tax Services (Pty) Ltd
 * 
 * Core calculation logic for South African salary calculations
 */

class SalaryCalculator {
    constructor() {
        this.results = {};
        this.inputs = {};
    }

    /**
     * Set input values
     * @param {Object} inputs - All input values from form
     */
    setInputs(inputs) {
        this.inputs = {
            // Employee Info
            employeeName: inputs.employeeName || '',
            companyName: inputs.companyName || '',
            period: inputs.period || '',
            taxYear: inputs.taxYear || '2026',
            
            // Income
            basicSalary: parseFloat(inputs.basicSalary) || 0,
            overtime: parseFloat(inputs.overtime) || 0,
            annualBonus: parseFloat(inputs.annualBonus) || 0,
            otherBonus: parseFloat(inputs.otherBonus) || 0,
            subsistenceAllowance: parseFloat(inputs.subsistenceAllowance) || 0,
            travelAllowance: parseFloat(inputs.travelAllowance) || 0,
            otherAllowances: parseFloat(inputs.otherAllowances) || 0,
            
            // Fringe Benefits
            companyCarBenefit: parseFloat(inputs.companyCarBenefit) || 0,
            taxableTravelPortion: parseFloat(inputs.taxableTravelPortion) || 0,
            medicalAidFringeBenefit: parseFloat(inputs.medicalAidFringeBenefit) || 0,
            providentFundFringeBenefit: parseFloat(inputs.providentFundFringeBenefit) || 0,
            otherFringeBenefits: parseFloat(inputs.otherFringeBenefits) || 0,
            
            // Employee Contributions
            medicalAidEmployee: parseFloat(inputs.medicalAidEmployee) || 0,
            providentFundEmployee: parseFloat(inputs.providentFundEmployee) || 0,
            retirementAnnuity: parseFloat(inputs.retirementAnnuity) || 0,
            medicalAidDependents: parseInt(inputs.medicalAidDependents) || 0,
            
            // Employer Contributions
            medicalAidEmployer: parseFloat(inputs.medicalAidEmployer) || 0,
            providentFundEmployer: parseFloat(inputs.providentFundEmployer) || 0
        };
    }

    /**
     * Calculate all salary components
     * @returns {Object} Complete calculation results
     */
    calculate() {
        const i = this.inputs;
        
        // 1. Calculate Gross Pay (Total Income)
        const grossIncome = 
            i.basicSalary +
            i.overtime +
            i.annualBonus +
            i.otherBonus +
            i.subsistenceAllowance +
            i.travelAllowance +
            i.otherAllowances;
        
        // 2. Calculate Total Fringe Benefits
        const totalFringeBenefits = 
            i.companyCarBenefit +
            i.taxableTravelPortion +
            i.medicalAidFringeBenefit +
            i.providentFundFringeBenefit +
            i.otherFringeBenefits;
        
        // 3. Calculate Taxable Income
        const taxableIncome = grossIncome + totalFringeBenefits;
        
        // 4. Calculate UIF (1% of gross, capped at R177.12)
        const uifEmployee = calculateUIF(grossIncome, i.taxYear);
        const uifEmployer = uifEmployee; // Employer matches
        
        // 5. Calculate Medical Aid Tax Credit
        const medicalAidTaxCredit = calculateMedicalAidTaxCredit(
            i.medicalAidDependents,
            i.taxYear
        );
        
        // 6. Calculate PAYE Tax
        const payeCalculation = calculatePAYE(taxableIncome, i.taxYear);
        let payeTax = payeCalculation.netTax;
        
        // Apply Medical Aid Tax Credit
        payeTax = Math.max(0, payeTax - medicalAidTaxCredit);
        
        // 7. Calculate Total Deductions
        const totalDeductions = 
            payeTax +
            uifEmployee +
            i.medicalAidEmployee +
            i.providentFundEmployee +
            i.retirementAnnuity;
        
        // 8. Calculate Net Pay
        const nettPay = grossIncome - totalDeductions;
        
        // 9. Calculate Employer Contributions
        const sdl = calculateSDL(grossIncome, i.taxYear);
        const totalEmployerContributions = 
            i.medicalAidEmployer +
            i.providentFundEmployer +
            uifEmployer +
            sdl;
        
        // 10. Calculate Cost to Company
        const costToCompany = grossIncome + totalEmployerContributions;
        
        // Store results
        this.results = {
            // Employee Info
            employeeName: i.employeeName,
            companyName: i.companyName,
            period: i.period,
            taxYear: i.taxYear,
            
            // Income Components
            income: {
                basicSalary: i.basicSalary,
                overtime: i.overtime,
                annualBonus: i.annualBonus,
                otherBonus: i.otherBonus,
                subsistenceAllowance: i.subsistenceAllowance,
                travelAllowance: i.travelAllowance,
                otherAllowances: i.otherAllowances,
                total: grossIncome
            },
            
            // Fringe Benefits
            fringeBenefits: {
                companyCarBenefit: i.companyCarBenefit,
                taxableTravelPortion: i.taxableTravelPortion,
                medicalAidFringeBenefit: i.medicalAidFringeBenefit,
                providentFundFringeBenefit: i.providentFundFringeBenefit,
                otherFringeBenefits: i.otherFringeBenefits,
                total: totalFringeBenefits
            },
            
            // Tax Calculation
            tax: {
                taxableIncome: taxableIncome,
                grossTax: payeCalculation.grossTax,
                primaryRebate: payeCalculation.primaryRebate,
                medicalAidTaxCredit: medicalAidTaxCredit,
                payeTax: payeTax,
                effectiveRate: payeTax / taxableIncome * 100,
                brackets: payeCalculation.brackets
            },
            
            // Deductions
            deductions: {
                payeTax: payeTax,
                uif: uifEmployee,
                medicalAidEmployee: i.medicalAidEmployee,
                providentFundEmployee: i.providentFundEmployee,
                retirementAnnuity: i.retirementAnnuity,
                total: totalDeductions
            },
            
            // Employer Contributions
            employerContributions: {
                medicalAidEmployer: i.medicalAidEmployer,
                providentFundEmployer: i.providentFundEmployer,
                uifEmployer: uifEmployer,
                sdl: sdl,
                total: totalEmployerContributions
            },
            
            // Summary Totals
            summary: {
                grossPay: grossIncome,
                totalDeductions: totalDeductions,
                nettPay: nettPay,
                costToCompany: costToCompany
            }
        };
        
        return this.results;
    }

    /**
     * Get calculation results
     * @returns {Object} Results object
     */
    getResults() {
        return this.results;
    }

    /**
     * Format results for display
     * @returns {Object} Formatted results
     */
    getFormattedResults() {
        const r = this.results;
        
        return {
            employeeName: r.employeeName,
            companyName: r.companyName,
            period: r.period,
            taxYear: r.taxYear,
            
            income: this.formatSection(r.income),
            fringeBenefits: this.formatSection(r.fringeBenefits),
            deductions: this.formatSection(r.deductions),
            employerContributions: this.formatSection(r.employerContributions),
            
            tax: {
                taxableIncome: formatCurrency(r.tax.taxableIncome),
                grossTax: formatCurrency(r.tax.grossTax),
                primaryRebate: formatCurrency(r.tax.primaryRebate),
                medicalAidTaxCredit: formatCurrency(r.tax.medicalAidTaxCredit),
                payeTax: formatCurrency(r.tax.payeTax),
                effectiveRate: r.tax.effectiveRate.toFixed(1) + '%',
                brackets: r.tax.brackets
            },
            
            summary: {
                grossPay: formatCurrency(r.summary.grossPay),
                totalDeductions: formatCurrency(r.summary.totalDeductions),
                nettPay: formatCurrency(r.summary.nettPay),
                costToCompany: formatCurrency(r.summary.costToCompany)
            }
        };
    }

    /**
     * Format a section object
     * @param {Object} section - Section object
     * @returns {Object} Formatted section
     */
    formatSection(section) {
        const formatted = {};
        for (const key in section) {
            if (typeof section[key] === 'number') {
                formatted[key] = formatCurrency(section[key]);
            } else {
                formatted[key] = section[key];
            }
        }
        return formatted;
    }

    /**
     * Validate inputs
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];
        const i = this.inputs;
        
        // Check if at least basic salary is provided
        if (i.basicSalary <= 0 && 
            i.overtime <= 0 && 
            i.annualBonus <= 0 && 
            i.otherBonus <= 0) {
            errors.push('Please enter at least one income component.');
        }
        
        // Validate negative values
        for (const key in i) {
            if (typeof i[key] === 'number' && i[key] < 0) {
                errors.push(`${key} cannot be negative.`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Reset calculator
     */
    reset() {
        this.inputs = {};
        this.results = {};
    }
}

// Create global calculator instance
const salaryCalculator = new SalaryCalculator();
