/**
 * Main Application Controller
 * We Do Tax Services (Pty) Ltd
 * 
 * Handles UI interactions and orchestrates calculator functionality
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Get form elements
    const form = document.getElementById('salaryForm');
    const resetBtn = document.getElementById('resetBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    
    // Add event listeners
    form.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', handleReset);
    downloadPdfBtn.addEventListener('click', handleDownloadPDF);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    console.log('We Do Tax Services - Salary Calculator initialized');
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = collectFormData();
    
    // Set inputs in calculator
    salaryCalculator.setInputs(formData);
    
    // Validate inputs
    const validation = salaryCalculator.validate();
    if (!validation.isValid) {
        showError(validation.errors.join('\n'));
        return;
    }
    
    // Calculate
    const results = salaryCalculator.calculate();
    
    // Display results
    displayResults(results);
    
    // Show download button
    document.getElementById('downloadPdfBtn').style.display = 'inline-flex';
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Collect form data
 * @returns {Object} Form data object
 */
function collectFormData() {
    const formElements = document.getElementById('salaryForm').elements;
    const data = {};
    
    for (let element of formElements) {
        if (element.id) {
            data[element.id] = element.value;
        }
    }
    
    return data;
}

/**
 * Display calculation results
 * @param {Object} results - Calculation results
 */
function displayResults(results) {
    const formatted = salaryCalculator.getFormattedResults();
    
    // Show results section
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
    
    // Update summary cards
    document.getElementById('summaryGrossPay').textContent = formatted.summary.grossPay;
    document.getElementById('summaryDeductions').textContent = formatted.summary.totalDeductions;
    document.getElementById('summaryNettPay').textContent = formatted.summary.nettPay;
    document.getElementById('summaryCTC').textContent = formatted.summary.costToCompany;
    
    // Update detailed sections
    displayIncomeBreakdown(formatted.income);
    displayBenefitsBreakdown(formatted.fringeBenefits);
    displayTaxBreakdown(formatted.tax);
    displayDeductionsBreakdown(formatted.deductions);
    displayEmployerBreakdown(formatted.employerContributions);
}

/**
 * Display income breakdown
 * @param {Object} income - Income data
 */
function displayIncomeBreakdown(income) {
    const container = document.getElementById('incomeBreakdown');
    container.innerHTML = '';
    
    const items = [
        { label: 'Basic Salary', value: income.basicSalary, icon: 'fas fa-coins' },
        { label: 'Overtime', value: income.overtime, icon: 'fas fa-clock' },
        { label: 'Annual Bonus', value: income.annualBonus, icon: 'fas fa-gift' },
        { label: 'Other Bonuses', value: income.otherBonus, icon: 'fas fa-award' },
        { label: 'Subsistence Allowance', value: income.subsistenceAllowance, icon: 'fas fa-utensils' },
        { label: 'Travel Allowance', value: income.travelAllowance, icon: 'fas fa-car' },
        { label: 'Other Allowances', value: income.otherAllowances, icon: 'fas fa-hand-holding-usd' }
    ];
    
    items.forEach(item => {
        if (item.value !== 'R 0.00') {
            container.appendChild(createDetailRow(item.label, item.value, item.icon));
        }
    });
    
    // Add total
    container.appendChild(createDetailRow('Total Income', income.total, 'fas fa-equals', true));
}

/**
 * Display fringe benefits breakdown
 * @param {Object} benefits - Benefits data
 */
function displayBenefitsBreakdown(benefits) {
    const container = document.getElementById('benefitsBreakdown');
    container.innerHTML = '';
    
    const items = [
        { label: 'Company Car Benefit', value: benefits.companyCarBenefit, icon: 'fas fa-car-side' },
        { label: 'Taxable Travel Portion', value: benefits.taxableTravelPortion, icon: 'fas fa-route' },
        { label: 'Medical Aid Fringe Benefit', value: benefits.medicalAidFringeBenefit, icon: 'fas fa-heartbeat' },
        { label: 'Provident Fund Fringe Benefit', value: benefits.providentFundFringeBenefit, icon: 'fas fa-piggy-bank' },
        { label: 'Other Fringe Benefits', value: benefits.otherFringeBenefits, icon: 'fas fa-plus-circle' }
    ];
    
    let hasItems = false;
    items.forEach(item => {
        if (item.value !== 'R 0.00') {
            container.appendChild(createDetailRow(item.label, item.value, item.icon));
            hasItems = true;
        }
    });
    
    if (hasItems) {
        container.appendChild(createDetailRow('Total Fringe Benefits', benefits.total, 'fas fa-equals', true));
    } else {
        container.innerHTML = '<div class="detail-row"><div class="detail-label">No fringe benefits</div></div>';
    }
}

/**
 * Display tax calculation breakdown
 * @param {Object} tax - Tax data
 */
function displayTaxBreakdown(tax) {
    const container = document.getElementById('taxBreakdown');
    container.innerHTML = '';
    
    const items = [
        { label: 'Taxable Income', value: tax.taxableIncome },
        { label: 'Gross Tax (Before Rebates)', value: tax.grossTax },
        { label: 'Primary Rebate', value: '(' + tax.primaryRebate + ')' },
        { label: 'Medical Aid Tax Credit', value: '(' + tax.medicalAidTaxCredit + ')' },
        { label: 'PAYE Tax', value: tax.payeTax },
        { label: 'Effective Tax Rate', value: tax.effectiveRate }
    ];
    
    items.forEach(item => {
        container.appendChild(createDetailRow(item.label, item.value, 'fas fa-calculator'));
    });
}

/**
 * Display deductions breakdown
 * @param {Object} deductions - Deductions data
 */
function displayDeductionsBreakdown(deductions) {
    const container = document.getElementById('deductionsBreakdown');
    container.innerHTML = '';
    
    const items = [
        { label: 'PAYE Tax', value: deductions.payeTax, icon: 'fas fa-file-invoice-dollar' },
        { label: 'UIF Employee Contribution', value: deductions.uif, icon: 'fas fa-shield-alt' },
        { label: 'Medical Aid Contribution', value: deductions.medicalAidEmployee, icon: 'fas fa-hospital-user' },
        { label: 'Provident Fund Contribution', value: deductions.providentFundEmployee, icon: 'fas fa-wallet' },
        { label: 'Retirement Annuity', value: deductions.retirementAnnuity, icon: 'fas fa-umbrella' }
    ];
    
    items.forEach(item => {
        if (item.value !== 'R 0.00') {
            container.appendChild(createDetailRow(item.label, item.value, item.icon));
        }
    });
    
    container.appendChild(createDetailRow('Total Deductions', deductions.total, 'fas fa-equals', true));
}

/**
 * Display employer contributions breakdown
 * @param {Object} employer - Employer data
 */
function displayEmployerBreakdown(employer) {
    const container = document.getElementById('employerBreakdown');
    container.innerHTML = '';
    
    const items = [
        { label: 'Medical Aid - Employer', value: employer.medicalAidEmployer, icon: 'fas fa-hand-holding-medical' },
        { label: 'Provident Fund - Employer', value: employer.providentFundEmployer, icon: 'fas fa-hand-holding-usd' },
        { label: 'UIF - Employer', value: employer.uifEmployer, icon: 'fas fa-shield-alt' },
        { label: 'Skills Development Levy', value: employer.sdl, icon: 'fas fa-graduation-cap' }
    ];
    
    items.forEach(item => {
        if (item.value !== 'R 0.00') {
            container.appendChild(createDetailRow(item.label, item.value, item.icon));
        }
    });
    
    container.appendChild(createDetailRow('Total Employer Contributions', employer.total, 'fas fa-equals', true));
}

/**
 * Create a detail row element
 * @param {string} label - Row label
 * @param {string} value - Row value
 * @param {string} icon - Font Awesome icon class
 * @param {boolean} isTotal - Whether this is a total row
 * @returns {HTMLElement} Detail row element
 */
function createDetailRow(label, value, icon = '', isTotal = false) {
    const row = document.createElement('div');
    row.className = isTotal ? 'detail-row total' : 'detail-row';
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'detail-label';
    if (icon) {
        const iconElement = document.createElement('i');
        iconElement.className = icon;
        labelDiv.appendChild(iconElement);
    }
    labelDiv.appendChild(document.createTextNode(' ' + label));
    
    const valueDiv = document.createElement('div');
    valueDiv.className = 'detail-value';
    valueDiv.textContent = value;
    
    row.appendChild(labelDiv);
    row.appendChild(valueDiv);
    
    return row;
}

/**
 * Handle reset button click
 */
function handleReset() {
    if (confirm('Are you sure you want to reset the form? All data will be cleared.')) {
        document.getElementById('salaryForm').reset();
        document.getElementById('results').style.display = 'none';
        document.getElementById('downloadPdfBtn').style.display = 'none';
        salaryCalculator.reset();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Handle download PDF button click
 */
function handleDownloadPDF() {
    const results = salaryCalculator.getFormattedResults();
    pdfGenerator.generate(results);
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboardShortcuts(e) {
    // Ctrl+Enter: Calculate
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('salaryForm').dispatchEvent(new Event('submit'));
    }
    
    // Ctrl+R: Reset (prevent browser refresh)
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        handleReset();
    }
    
    // Ctrl+P: Download PDF
    if (e.ctrlKey && e.key === 'p') {
        const pdfBtn = document.getElementById('downloadPdfBtn');
        if (pdfBtn.style.display !== 'none') {
            e.preventDefault();
            handleDownloadPDF();
        }
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    alert('Error:\n\n' + message);
}

/**
 * Load example data (for testing)
 */
function loadExampleData() {
    // Brent Waller example from January 2026
    document.getElementById('employeeName').value = 'Brent Waller';
    document.getElementById('companyName').value = 'Globecast South Africa (PTY) Ltd';
    document.getElementById('period').value = 'January 2026';
    document.getElementById('taxYear').value = '2026';
    
    // Income
    document.getElementById('basicSalary').value = '76135';
    document.getElementById('overtime').value = '4000';
    document.getElementById('annualBonus').value = '0';
    document.getElementById('otherBonus').value = '10000';
    document.getElementById('subsistenceAllowance').value = '2450';
    document.getElementById('travelAllowance').value = '4500';
    document.getElementById('otherAllowances').value = '910';
    
    // Fringe Benefits
    document.getElementById('companyCarBenefit').value = '0';
    document.getElementById('taxableTravelPortion').value = '3600';
    document.getElementById('medicalAidFringeBenefit').value = '31195';
    document.getElementById('providentFundFringeBenefit').value = '11932';
    document.getElementById('otherFringeBenefits').value = '5170';
    
    // Employee Contributions
    document.getElementById('medicalAidEmployee').value = '0';
    document.getElementById('providentFundEmployee').value = '11932';
    document.getElementById('retirementAnnuity').value = '321';
    document.getElementById('medicalAidDependents').value = '0';
    
    // Employer Contributions
    document.getElementById('medicalAidEmployer').value = '31195';
    document.getElementById('providentFundEmployer').value = '11932';
    
    console.log('Example data loaded successfully');
    alert('Example data has been loaded. Click "Calculate Salary" to see results.');
}

// Expose loadExampleData globally for console access
window.loadExampleData = loadExampleData;
