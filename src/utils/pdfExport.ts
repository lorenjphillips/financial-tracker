import jsPDF from 'jspdf';
import { format, parseISO } from 'date-fns';

interface MonthlyData {
  income: {
    primarySalary: number;
    businessIncome: number;
    otherIncome: number;
  };
  automaticDeductions: {
    [key: string]: { amount: number; description: string };
  };
  investments: {
    fidelity: number;
    vanguard: number;
    schwab_roth_ira: number;
    swan_crypto: number;
    river_crypto: number;
  };
  savings: {
    marcus_hysa_emergency: number;
    chase_business_checking: number;
  };
  venmo: {
    venmo_cashout: number;
    venmo_payments: number;
    venmo_received: number;
  };
  creditCards: {
    discover: number;
    chase_sapphire: number;
    x1: number;
    wells_fargo: number;
  };
  essentials: {
    rent_mortgage: number;
    utilities: number;
    insurance: number;
    phone: number;
    groceries: number;
    transportation: number;
  };
  discretionary: {
    dining_out: number;
    entertainment: number;
    shopping: number;
    subscriptions: number;
    travel: number;
    other: number;
  };
}

interface CustomExpense {
  id: number;
  category: string;
  name: string;
  amount: number;
}

interface PDFExportData {
  currentMonthYear: string;
  monthlyData: MonthlyData;
  customExpenses: CustomExpense[];
  totals: {
    totalIncome: number;
    totalOutflows: number;
    netCashFlow: number;
    totalInvestments: number;
    totalSavings: number;
    totalCreditCards: number;
    totalEssentials: number;
    totalDiscretionary: number;
    totalCustomExpenses: number;
  };
}

export const generateFinancialPDF = async (data: PDFExportData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const {
    currentMonthYear,
    monthlyData,
    customExpenses,
    totals: {
      totalIncome,
      totalOutflows,
      netCashFlow,
      totalInvestments,
      totalSavings,
      totalCreditCards,
      totalEssentials,
      totalDiscretionary,
      totalCustomExpenses
    }
  } = data;
  
  // Header
  pdf.setFontSize(20);
  pdf.text('Financial Summary Report', pageWidth / 2, 20, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text(`Month: ${format(parseISO(currentMonthYear + '-01'), 'MMMM yyyy')}`, pageWidth / 2, 30, { align: 'center' });
  
  let yPosition = 45;
  
  // Summary section
  pdf.setFontSize(16);
  pdf.text('Financial Summary', 20, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.text(`Total Income: $${totalIncome.toLocaleString()}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Total Outflows: $${totalOutflows.toLocaleString()}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Net Cash Flow: $${netCashFlow.toLocaleString()}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Investment Rate: ${totalIncome > 0 ? ((totalInvestments / totalIncome) * 100).toFixed(1) : 0}%`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Savings Rate: ${totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0}%`, 20, yPosition);
  yPosition += 15;
  
  // Categories breakdown
  const categories = [
    { name: 'Income', total: totalIncome, items: monthlyData.income },
    { name: 'Investments', total: totalInvestments, items: monthlyData.investments },
    { name: 'Savings', total: totalSavings, items: monthlyData.savings },
    { name: 'Credit Cards', total: totalCreditCards, items: monthlyData.creditCards },
    { name: 'Essentials', total: totalEssentials, items: monthlyData.essentials },
    { name: 'Discretionary', total: totalDiscretionary, items: monthlyData.discretionary }
  ];
  
  for (const category of categories) {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(14);
    pdf.text(`${category.name}: $${category.total.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    Object.entries(category.items).forEach(([key, value]) => {
      if (typeof value === 'number' && value > 0) {
        const displayName = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1');
        pdf.text(`  ${displayName}: $${value.toLocaleString()}`, 25, yPosition);
        yPosition += 5;
      }
    });
    yPosition += 5;
  }
  
  // Custom expenses
  if (customExpenses.length > 0) {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(14);
    pdf.text(`Custom Expenses: $${totalCustomExpenses.toLocaleString()}`, 20, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    customExpenses.forEach(expense => {
      pdf.text(`  ${expense.category} - ${expense.name}: $${expense.amount.toLocaleString()}`, 25, yPosition);
      yPosition += 5;
    });
  }
  
  // Save the PDF
  pdf.save(`financial-summary-${currentMonthYear}.pdf`);
}; 