/**
 * PDF Generator for Salary Calculator
 * We Do Tax Services (Pty) Ltd
 * 
 * Generates branded PDF reports with calculation results
 */

class PDFGenerator {
    constructor() {
        this.doc = null;
        this.yPosition = 20;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.contentWidth = this.pageWidth - (2 * this.margin);
        
        // Brand colors
        this.colors = {
            navy: [44, 62, 80],
            gold: [197, 160, 83],
            grey: [139, 157, 172],
            white: [255, 255, 255],
            lightGrey: [248, 249, 250]
        };
    }

    /**
     * Initialize jsPDF document
     */
    init() {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        this.yPosition = 20;
    }

    /**
     * Add company header with branding
     */
    addHeader() {
        // Navy blue header background
        this.doc.setFillColor(...this.colors.navy);
        this.doc.rect(0, 0, this.pageWidth, 50, 'F');
        
        // Company name in white
        this.doc.setTextColor(...this.colors.white);
        this.doc.setFontSize(24);
        this.doc.setFont(undefined, 'bold');
        this.doc.text('WE DO TAX SERVICES', this.pageWidth / 2, 18, { align: 'center' });
        
        // Subtitle in gold
        this.doc.setTextColor(...this.colors.gold);
        this.doc.setFontSize(14);
        this.doc.setFont(undefined, 'normal');
        this.doc.text('South African Salary Calculator', this.pageWidth / 2, 26, { align: 'center' });
        
        // Gold separator line
        this.doc.setDrawColor(...this.colors.gold);
        this.doc.setLineWidth(2);
        this.doc.line(this.margin, 48, this.pageWidth - this.margin, 48);
        
        // Report title
        this.doc.setTextColor(...this.colors.navy);
        this.doc.setFontSize(18);
        this.doc.setFont(undefined, 'bold');
        this.doc.text('SALARY CALCULATION REPORT', this.pageWidth / 2, 60, { align: 'center' });
        
        this.yPosition = 70;
    }

    /**
     * Add employee information section
     * @param {Object} results - Calculation results
     */
    addEmployeeInfo(results) {
        this.doc.setFontSize(12);
        this.doc.setFont(undefined, 'bold');
        this.doc.setTextColor(...this.colors.navy);
        this.doc.text('Employee Information', this.margin, this.yPosition);
        
        this.yPosition += 7;
        
        // Info box with light grey background
        const boxHeight = 28;
        this.doc.setFillColor(...this.colors.lightGrey);
        this.doc.roundedRect(this.margin, this.yPosition, this.contentWidth, boxHeight, 2, 2, 'F');
        
        // Add gold border
        this.doc.setDrawColor(...this.colors.gold);
        this.doc.setLineWidth(0.5);
        this.doc.roundedRect(this.margin, this.yPosition, this.contentWidth, boxHeight, 2, 2, 'S');
        
        this.yPosition += 6;
        
        this.doc.setFontSize(10);
        this.doc.setFont(undefined, 'normal');
        this.doc.setTextColor(60, 60, 60);
        
        const leftCol = this.margin + 5;
        const rightCol = this.pageWidth / 2 + 10;
        
        this.addInfoLine('Employee Name:', results.employeeName || 'N/A', leftCol);
        this.yPosition += 6;
        this.addInfoLine('Company:', results.companyName || 'N/A', leftCol);
        this.yPosition += 6;
        this.addInfoLine('Period:', results.period || 'N/A', leftCol);
        
        this.yPosition -= 12;
        this.addInfoLine('Tax Year:', getTaxTable(results.taxYear).year, rightCol);
        this.yPosition += 6;
        this.addInfoLine('Report Date:', new Date().toLocaleDateString('en-ZA'), rightCol);
        
        this.yPosition += 10;
    }

    /**
     * Add an info line (label: value)
     */
    addInfoLine(label, value, xPos) {
        this.doc.setFont(undefined, 'bold');
        this.doc.text(label, xPos, this.yPosition);
        this.doc.setFont(undefined, 'normal');
        this.doc.text(String(value), xPos + 35, this.yPosition);
    }

    /**
     * Add summary section with colored boxes
     * @param {Object} summary - Summary data
     */
    addSummary(summary) {
        this.doc.setFontSize(12);
        this.doc.setFont(undefined, 'bold');
        this.doc.setTextColor(...this.colors.navy);
        this.doc.text('Summary', this.margin, this.yPosition);
        
        this.yPosition += 8;
        
        const boxWidth = (this.contentWidth - 9) / 4;
        const boxHeight = 22;
        
        // Summary boxes
        const summaryData = [
            { label: 'Gross Pay', value: summary.grossPay, color: this.colors.navy },
            { label: 'Deductions', value: summary.totalDeductions, color: this.colors.grey },
            { label: 'Net Pay', value: summary.nettPay, color: this.colors.gold },
            { label: 'Cost to Company', value: summary.costToCompany, color: this.colors.navy }
        ];
        
        summaryData.forEach((item, index) => {
            const xPos = this.margin + (index * (boxWidth + 3));
            
            // Box background
            this.doc.setFillColor(...item.color);
            this.doc.roundedRect(xPos, this.yPosition, boxWidth, boxHeight, 2, 2, 'F');
            
            // Label
            this.doc.setTextColor(...this.colors.white);
            this.doc.setFontSize(8);
            this.doc.setFont(undefined, 'normal');
            this.doc.text(item.label, xPos + boxWidth / 2, this.yPosition + 6, { align: 'center' });
            
            // Value
            this.doc.setFontSize(11);
            this.doc.setFont(undefined, 'bold');
            this.doc.text(item.value, xPos + boxWidth / 2, this.yPosition + 15, { align: 'center' });
        });
        
        this.yPosition += boxHeight + 10;
    }

    /**
     * Add a detailed section (income, deductions, etc.)
     * @param {string} title - Section title
     * @param {Object} data - Section data
     * @param {boolean} showTotal - Whether to show total row
     */
    addDetailSection(title, data, showTotal = true) {
        // Check if we need a new page
        if (this.yPosition > 240) {
            this.addNewPage();
        }
        
        // Section header
        this.doc.setFillColor(...this.colors.navy);
        this.doc.rect(this.margin, this.yPosition, this.contentWidth, 8, 'F');
        
        this.doc.setTextColor(...this.colors.gold);
        this.doc.setFontSize(11);
        this.doc.setFont(undefined, 'bold');
        this.doc.text(title, this.margin + 3, this.yPosition + 5.5);
        
        this.yPosition += 10;
        
        // Data rows
        this.doc.setFontSize(9);
        let rowCount = 0;
        
        for (const [key, value] of Object.entries(data)) {
            if (key === 'total') continue;
            if (value === 'R 0.00' || value === '0.00') continue;
            
            const isEven = rowCount % 2 === 0;
            if (isEven) {
                this.doc.setFillColor(...this.colors.lightGrey);
                this.doc.rect(this.margin, this.yPosition - 3, this.contentWidth, 6, 'F');
            }
            
            this.doc.setTextColor(60, 60, 60);
            this.doc.setFont(undefined, 'normal');
            const label = this.formatLabel(key);
            this.doc.text(label, this.margin + 3, this.yPosition);
            
            this.doc.setFont(undefined, 'bold');
            this.doc.setTextColor(...this.colors.navy);
            this.doc.text(String(value), this.pageWidth - this.margin - 3, this.yPosition, { align: 'right' });
            
            this.yPosition += 6;
            rowCount++;
        }
        
        // Total row if requested
        if (showTotal && data.total) {
            this.doc.setFillColor(...this.colors.gold);
            this.doc.rect(this.margin, this.yPosition - 3, this.contentWidth, 7, 'F');
            
            this.doc.setTextColor(...this.colors.navy);
            this.doc.setFontSize(10);
            this.doc.setFont(undefined, 'bold');
            this.doc.text('TOTAL', this.margin + 3, this.yPosition);
            this.doc.text(data.total, this.pageWidth - this.margin - 3, this.yPosition, { align: 'right' });
            
            this.yPosition += 9;
        }
        
        this.yPosition += 3;
    }

    /**
     * Add tax calculation details
     * @param {Object} taxData - Tax calculation data
     */
    addTaxDetails(taxData) {
        if (this.yPosition > 200) {
            this.addNewPage();
        }
        
        // Section header
        this.doc.setFillColor(...this.colors.navy);
        this.doc.rect(this.margin, this.yPosition, this.contentWidth, 8, 'F');
        
        this.doc.setTextColor(...this.colors.gold);
        this.doc.setFontSize(11);
        this.doc.setFont(undefined, 'bold');
        this.doc.text('Tax Calculation Details', this.margin + 3, this.yPosition + 5.5);
        
        this.yPosition += 10;
        
        // Tax details
        const details = [
            ['Taxable Income', taxData.taxableIncome],
            ['Gross Tax Before Rebates', taxData.grossTax],
            ['Primary Rebate', '(' + taxData.primaryRebate + ')'],
            ['Medical Aid Tax Credit', '(' + taxData.medicalAidTaxCredit + ')'],
            ['PAYE Tax', taxData.payeTax],
            ['Effective Tax Rate', taxData.effectiveRate]
        ];
        
        this.doc.setFontSize(9);
        details.forEach(([label, value], index) => {
            const isEven = index % 2 === 0;
            if (isEven) {
                this.doc.setFillColor(...this.colors.lightGrey);
                this.doc.rect(this.margin, this.yPosition - 3, this.contentWidth, 6, 'F');
            }
            
            this.doc.setTextColor(60, 60, 60);
            this.doc.setFont(undefined, 'normal');
            this.doc.text(label, this.margin + 3, this.yPosition);
            
            this.doc.setFont(undefined, 'bold');
            this.doc.setTextColor(...this.colors.navy);
            this.doc.text(String(value), this.pageWidth - this.margin - 3, this.yPosition, { align: 'right' });
            
            this.yPosition += 6;
        });
        
        this.yPosition += 5;
    }

    /**
     * Add footer with branding and disclaimer
     */
    addFooter() {
        const footerY = this.pageHeight - 25;
        
        // Gold separator line
        this.doc.setDrawColor(...this.colors.gold);
        this.doc.setLineWidth(1);
        this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);
        
        // Company info
        this.doc.setFontSize(9);
        this.doc.setTextColor(...this.colors.navy);
        this.doc.setFont(undefined, 'bold');
        this.doc.text('We Do Tax Services (Pty) Ltd', this.pageWidth / 2, footerY + 5, { align: 'center' });
        
        this.doc.setFont(undefined, 'normal');
        this.doc.setFontSize(8);
        this.doc.setTextColor(...this.colors.grey);
        this.doc.text('Professional Tax Calculation Services', this.pageWidth / 2, footerY + 10, { align: 'center' });
        
        // Disclaimer
        this.doc.setFontSize(7);
        this.doc.text('This calculator provides estimates based on SARS tax tables. Consult a tax professional for personalized advice.', 
            this.pageWidth / 2, footerY + 15, { align: 'center', maxWidth: this.contentWidth });
    }

    /**
     * Add new page with header and footer
     */
    addNewPage() {
        this.doc.addPage();
        this.yPosition = 20;
        
        // Simplified header for additional pages
        this.doc.setFillColor(...this.colors.navy);
        this.doc.rect(0, 0, this.pageWidth, 15, 'F');
        
        this.doc.setTextColor(...this.colors.gold);
        this.doc.setFontSize(12);
        this.doc.setFont(undefined, 'bold');
        this.doc.text('WE DO TAX SERVICES - Salary Report (continued)', this.pageWidth / 2, 9, { align: 'center' });
        
        this.yPosition = 25;
    }

    /**
     * Format label for display
     */
    formatLabel(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Generate complete PDF report
     * @param {Object} results - Calculation results
     */
    generate(results) {
        this.init();
        
        const formatted = results;
        
        // Add sections
        this.addHeader();
        this.addEmployeeInfo(formatted);
        this.addSummary(formatted.summary);
        
        // Income
        this.addDetailSection('Income Components', formatted.income, true);
        
        // Fringe Benefits
        if (formatted.fringeBenefits.total !== 'R 0.00') {
            this.addDetailSection('Fringe Benefits', formatted.fringeBenefits, true);
        }
        
        // Tax Details
        this.addTaxDetails(formatted.tax);
        
        // Deductions
        this.addDetailSection('Employee Deductions', formatted.deductions, true);
        
        // Employer Contributions
        this.addDetailSection('Employer Contributions', formatted.employerContributions, true);
        
        // Footer
        this.addFooter();
        
        // Generate filename
        const empName = results.employeeName || 'Employee';
        const period = results.period || 'Report';
        const filename = `Salary_Report_${empName.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.pdf`;
        
        // Save PDF
        this.doc.save(filename);
    }
}

// Create global PDF generator instance
const pdfGenerator = new PDFGenerator();
