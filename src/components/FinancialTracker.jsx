import React, { useState, useEffect } from 'react';
import { X, Settings, Save, Calendar, Archive, Download, ChevronLeft, ChevronRight, Upload, HardDrive } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateFinancialPDF } from '../utils/pdfExport';
import TableSection from './TableSection';
import AutoDeductionsSection from './AutoDeductionsSection';
import VenmoSection from './VenmoSection';
import CustomExpensesSection from './CustomExpensesSection';
import SummaryCards from './SummaryCards';
import SpendingChart from './SpendingChart';

const FinancialTracker = () => {
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [currentMonthYear, setCurrentMonthYear] = useState(() => {
    const now = new Date();
    return format(now, 'yyyy-MM');
  });
  const [savedMonths, setSavedMonths] = useState([]);


  const [monthlyData, setMonthlyData] = useState({
    // Payroll Details (Biweekly) - Input Fields
    payroll: {
      // Gross Income
      grossPay: 0.00,
      
      // Tax Deductions
      federalWithholding: 0.00,
      stateTaxCA: 0.00,
      oasdiSocialSecurity: 0.00,
      medicare: 0.00,
      caSDI: 0.00,
      
      // Pre-tax Deductions (formerly automatic deductions)
      contribution401k: 0.00,
      hsaContribution: 0.00,
      healthInsurance: 0.00,
      lifeInsurance: 0.00,
      disabilityInsurance: 0.00,
      parkingTransit: 0.00,
      dependentCareFSA: 0.00,
      otherPretax: 0.00,
      
      // Other Post-tax Deductions
      generalDeductions: 0.00,
      employeePostTaxDeductions: 0.00
    },

    // Additional Income Sources (beyond primary payroll)
    additionalIncome: {
      businessIncome: 0,
      freelanceIncome: 0,
      otherIncome: 0
    },
    
    // Investment Accounts
    investments: {
      fidelity: 0,
      vanguard: 0,
      schwab_roth_ira: 0,
      swan_crypto: 0,
      river_crypto: 0
    },
    
    // Savings
    savings: {
      marcus_hysa_emergency: 0,
      chase_business_checking: 0
    },
    
    // Venmo Cash Flow (can be positive or negative)
    venmo: {
      venmo_cashout: 0, // positive when cashing out TO bank
      venmo_payments: 0, // negative when paying people
      venmo_received: 0  // positive when receiving money
    },
    
    // Credit Card Spending
    creditCards: {
      discover: 0,
      chase_sapphire: 0,
      x1: 0,
      wells_fargo: 0
    },
    
    // Essential Expenses
            essentials: {
          rent_mortgage: 0,
          utilities: 0,
          insurance: 0,
          groceries: 0,
          transportation: 0
        }
  });

  // Custom itemized expenses
  const [customExpenses, setCustomExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: '', name: '', amount: 0 });

  // Load saved months from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('financial-tracker-months');
    if (stored) {
      setSavedMonths(JSON.parse(stored));
    }
    loadMonthData(currentMonthYear);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to localStorage whenever savedMonths changes
  useEffect(() => {
    localStorage.setItem('financial-tracker-months', JSON.stringify(savedMonths));
  }, [savedMonths]);

  // Load month data when currentMonthYear changes
  useEffect(() => {
    loadMonthData(currentMonthYear);
  }, [currentMonthYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateValue = (category, subcategory, value) => {
    setMonthlyData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: parseFloat(value) || 0
      }
    }));
  };



  const addCustomExpense = () => {
    if (newExpense.category && newExpense.name && newExpense.amount) {
      setCustomExpenses(prev => [...prev, { ...newExpense, id: Date.now() }]);
      setNewExpense({ category: '', name: '', amount: 0 });
    }
  };

  const removeCustomExpense = (id) => {
    setCustomExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const updateCustomExpense = (id, field, value) => {
    setCustomExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : expense
    ));
  };

  // Month management functions
  const loadMonthData = (monthYear) => {
    const saved = savedMonths.find(m => m.monthYear === monthYear);
    if (saved) {
      setMonthlyData(saved.data);
      setCustomExpenses(saved.customExpenses);
    } else {
      // Reset to defaults for new month
      setMonthlyData({
        payroll: {
          grossPay: 0.00,
          federalWithholding: 0.00,
          stateTaxCA: 0.00,
          oasdiSocialSecurity: 0.00,
          medicare: 0.00,
          caSDI: 0.00,
          contribution401k: 0.00,
          hsaContribution: 0.00,
          healthInsurance: 0.00,
          lifeInsurance: 0.00,
          disabilityInsurance: 0.00,
          parkingTransit: 0.00,
          dependentCareFSA: 0.00,
          otherPretax: 0.00,
          generalDeductions: 0.00,
          employeePostTaxDeductions: 0.00
        },
        additionalIncome: {
          businessIncome: 0,
          freelanceIncome: 0,
          otherIncome: 0
        },
        investments: {
          fidelity: 0,
          vanguard: 0,
          schwab_roth_ira: 0,
          swan_crypto: 0,
          river_crypto: 0
        },
        savings: {
          marcus_hysa_emergency: 0,
          chase_business_checking: 0
        },
        venmo: {
          venmo_cashout: 0,
          venmo_payments: 0,
          venmo_received: 0
        },
        creditCards: {
          discover: 0,
          chase_sapphire: 0,
          x1: 0,
          wells_fargo: 0
        },
        essentials: {
          rent_mortgage: 0,
          utilities: 0,
          insurance: 0,
          phone: 0,
          groceries: 0,
          transportation: 0
        }
      });
      setCustomExpenses([]);
    }
  };

  const saveCurrentMonth = () => {
    const existingIndex = savedMonths.findIndex(m => m.monthYear === currentMonthYear);
    const savedMonth = {
      id: currentMonthYear,
      monthYear: currentMonthYear,
      data: monthlyData,
      customExpenses: customExpenses,
      timestamp: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      setSavedMonths(prev => prev.map((m, i) => i === existingIndex ? savedMonth : m));
    } else {
      setSavedMonths(prev => [...prev, savedMonth]);
    }
  };

  const deleteMonth = (monthYear) => {
    setSavedMonths(prev => prev.filter(m => m.monthYear !== monthYear));
    if (monthYear === currentMonthYear) {
      // If deleting current month, reset to current month
      const now = new Date();
      setCurrentMonthYear(format(now, 'yyyy-MM'));
    }
  };

  const navigateMonth = (direction) => {
    const currentDate = parseISO(currentMonthYear + '-01');
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    setCurrentMonthYear(format(newDate, 'yyyy-MM'));
  };

  // PDF Export functionality
  const generatePDF = async () => {
    const pdfData = {
      currentMonthYear,
      monthlyData,
      customExpenses,
      totals: {
        totalIncome: totalMonthlyIncome, // Keep the old name for PDF compatibility
        totalMonthlyIncome,
        monthlyGrossPay,
        biweeklyGrossPay,
        biweeklyNetPay,
        monthlyNetPay,
        totalTaxDeductions,
        totalPretaxDeductions,
        totalOtherDeductions,
        totalAdditionalIncome,
        totalOutflows,
        netCashFlow,
        totalInvestments,
        totalSavings,
        totalCreditCards,
        totalEssentials,
        totalCustomExpenses
      }
    };
    
    await generateFinancialPDF(pdfData);
  };

  // Data backup and restore functions
  const exportData = () => {
    const dataToExport = {
      savedMonths,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result);
        
        if (importedData.savedMonths && Array.isArray(importedData.savedMonths)) {
          setSavedMonths(importedData.savedMonths);
        }
        
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  // Custom expense handlers
  const handleNewExpenseChange = (field, value) => {
    setNewExpense(prev => ({ ...prev, [field]: value }));
  };

  // Calculate payroll totals
  const biweeklyGrossPay = monthlyData.payroll.grossPay;
  const monthlyGrossPay = biweeklyGrossPay * 2.17; // Standard payroll calculation
  
  // Tax deductions
  const totalTaxDeductions = monthlyData.payroll.federalWithholding + 
                            monthlyData.payroll.stateTaxCA + 
                            monthlyData.payroll.oasdiSocialSecurity + 
                            monthlyData.payroll.medicare + 
                            monthlyData.payroll.caSDI;
  
  // Pre-tax deductions  
  const totalPretaxDeductions = monthlyData.payroll.contribution401k +
                               monthlyData.payroll.hsaContribution +
                               monthlyData.payroll.healthInsurance +
                               monthlyData.payroll.lifeInsurance +
                               monthlyData.payroll.disabilityInsurance +
                               monthlyData.payroll.parkingTransit +
                               monthlyData.payroll.dependentCareFSA +
                               monthlyData.payroll.otherPretax;
  
  // Other deductions
  const totalOtherDeductions = monthlyData.payroll.generalDeductions + 
                              monthlyData.payroll.employeePostTaxDeductions;
  
  // Calculate net pay
  const biweeklyNetPay = biweeklyGrossPay - totalTaxDeductions - totalPretaxDeductions - totalOtherDeductions;
  const monthlyNetPay = biweeklyNetPay * 2.17;
  
  // Additional income
  const totalAdditionalIncome = Object.values(monthlyData.additionalIncome).reduce((sum, val) => sum + val, 0);
  
  // Total monthly income
  const totalMonthlyIncome = monthlyNetPay + totalAdditionalIncome;
  
  // Other totals
  const totalInvestments = Object.values(monthlyData.investments).reduce((sum, val) => sum + val, 0);
  const totalSavings = Object.values(monthlyData.savings).reduce((sum, val) => sum + val, 0);
  const totalVenmo = Object.values(monthlyData.venmo).reduce((sum, val) => sum + val, 0);
  const totalCreditCards = Object.values(monthlyData.creditCards).reduce((sum, val) => sum + val, 0);
  const totalEssentials = Object.values(monthlyData.essentials).reduce((sum, val) => sum + val, 0);
  const totalCustomExpenses = customExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalOutflows = totalInvestments + totalSavings + Math.abs(totalVenmo) + totalCreditCards + totalEssentials + totalCustomExpenses;
  const netCashFlow = totalMonthlyIncome - totalOutflows;

  // Prepare spending chart data
  const spendingCategories = [
    { name: 'Investments', amount: totalInvestments, color: '#8b5cf6' },
    { name: 'Savings', amount: totalSavings, color: '#10b981' },
    { name: 'Credit Cards', amount: totalCreditCards, color: '#f59e0b' },
    { name: 'Essentials', amount: totalEssentials, color: '#ef4444' },
    { name: 'Custom Expenses', amount: totalCustomExpenses, color: '#f97316' }
  ];

  const totalSpending = spendingCategories.reduce((sum, cat) => sum + cat.amount, 0);

  const SettingsModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${showSettings ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">💼 Payroll-Based Tracking</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">How This Works</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Enter your actual <strong>biweekly payroll details</strong> from your pay stub</li>
                  <li>• Include gross pay, taxes, and all deductions</li>
                  <li>• Net income is <strong>calculated automatically</strong></li>
                  <li>• Monthly amounts use the standard 2.17 multiplier</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Benefits</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• More accurate than manual entry</li>
                  <li>• Matches your actual take-home pay</li>
                  <li>• Shows effective tax rate</li>
                  <li>• Proper payroll-to-monthly conversion</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ArchiveModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${showArchive ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Monthly Archive</h2>
              <button
                onClick={() => setShowArchive(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {savedMonths.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved months yet. Save your current month to get started!</p>
              ) : (
                savedMonths
                  .sort((a, b) => b.monthYear.localeCompare(a.monthYear))
                  .map((month) => {
                                          // Calculate net income from payroll
                      const payrollTaxes = (month.data.payroll?.federalWithholding || 0) + 
                                           (month.data.payroll?.stateTaxCA || 0) + 
                                           (month.data.payroll?.oasdiSocialSecurity || 0) + 
                                           (month.data.payroll?.medicare || 0) + 
                                           (month.data.payroll?.caSDI || 0);
                      const payrollPretax = (month.data.payroll?.contribution401k || 0) +
                                           (month.data.payroll?.hsaContribution || 0) +
                                           (month.data.payroll?.healthInsurance || 0) +
                                           (month.data.payroll?.lifeInsurance || 0) +
                                           (month.data.payroll?.disabilityInsurance || 0) +
                                           (month.data.payroll?.parkingTransit || 0) +
                                           (month.data.payroll?.dependentCareFSA || 0) +
                                           (month.data.payroll?.otherPretax || 0);
                      const payrollOther = (month.data.payroll?.generalDeductions || 0) + 
                                          (month.data.payroll?.employeePostTaxDeductions || 0);
                      const biweeklyNet = (month.data.payroll?.grossPay || 0) - payrollTaxes - payrollPretax - payrollOther;
                      const monthlyNet = biweeklyNet * 2.17;
                      const additionalIncome = Object.values(month.data.additionalIncome || {}).reduce((sum, val) => sum + val, 0);
                      const monthIncome = monthlyNet + additionalIncome;
                      const monthOutflows = Object.values(month.data.investments).reduce((sum, val) => sum + val, 0) +
                                         Object.values(month.data.savings).reduce((sum, val) => sum + val, 0) +
                                         Object.values(month.data.creditCards).reduce((sum, val) => sum + val, 0) +
                                         Object.values(month.data.essentials).reduce((sum, val) => sum + val, 0) +
                                         month.customExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                    const monthNetCashFlow = monthIncome - monthOutflows;
                    
                    return (
                      <div key={month.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {format(parseISO(month.monthYear + '-01'), 'MMMM yyyy')}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                              Last updated: {format(parseISO(month.timestamp), 'MMM dd, yyyy HH:mm')}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div className="bg-green-50 p-3 rounded">
                                <p className="font-medium text-green-800">Income</p>
                                <p className="text-lg font-bold text-green-900">${monthIncome.toLocaleString()}</p>
                              </div>
                              <div className="bg-red-50 p-3 rounded">
                                <p className="font-medium text-red-800">Outflows</p>
                                <p className="text-lg font-bold text-red-900">${monthOutflows.toLocaleString()}</p>
                              </div>
                              <div className={`${monthNetCashFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-3 rounded`}>
                                <p className={`font-medium ${monthNetCashFlow >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Net Cash Flow</p>
                                <p className={`text-lg font-bold ${monthNetCashFlow >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                                  ${monthNetCashFlow.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-purple-50 p-3 rounded">
                                <p className="font-medium text-purple-800">Investments</p>
                                <p className="text-lg font-bold text-purple-900">
                                  ${Object.values(month.data.investments).reduce((sum, val) => sum + val, 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => {
                                setCurrentMonthYear(month.monthYear);
                                setShowArchive(false);
                              }}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              View/Edit
                            </button>
                            <button
                              onClick={() => {
                                setCurrentMonthYear(month.monthYear);
                                setShowArchive(false);
                                setTimeout(() => generatePDF(), 500);
                              }}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              Export PDF
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete ${format(parseISO(month.monthYear + '-01'), 'MMMM yyyy')}?`)) {
                                  deleteMonth(month.monthYear);
                                }
                              }}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white text-gray-900">
      {/* Modals */}
      <SettingsModal />
      <ArchiveModal />
      
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Tracking Framework</h1>
            <p className="text-gray-600">Track income and allocations across all accounts and spending categories</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSettings(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
            >
              <Settings size={16} className="mr-2" />
              Settings
            </button>
            <button
              onClick={() => setShowArchive(true)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center"
            >
              <Archive size={16} className="mr-2" />
              Archive
            </button>
            <button
              onClick={exportData}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg flex items-center"
              title="Export all data as JSON backup file"
            >
              <HardDrive size={16} className="mr-2" />
              Backup
            </button>
            <label className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg flex items-center cursor-pointer">
              <Upload size={16} className="mr-2" />
              Restore
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="bg-white hover:bg-gray-100 text-gray-700 px-3 py-2 rounded border flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-600" />
              <span className="text-lg font-semibold">
                {format(parseISO(currentMonthYear + '-01'), 'MMMM yyyy')}
              </span>
            </div>
            <button
              onClick={() => navigateMonth('next')}
              className="bg-white hover:bg-gray-100 text-gray-700 px-3 py-2 rounded border flex items-center"
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={saveCurrentMonth}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
            >
              <Save size={16} className="mr-2" />
              Save Month
            </button>
            <button
              onClick={generatePDF}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center"
            >
              <Download size={16} className="mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards 
        totalIncome={totalMonthlyIncome}
        totalOutflows={totalOutflows}
        netCashFlow={netCashFlow}
      />

      {/* Spending Chart */}
      <SpendingChart 
        categories={spendingCategories}
        totalSpending={totalSpending}
      />

      {/* Main Tracking Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-100 font-semibold border-b">
          <div>Category / Account</div>
          <div className="text-center">Monthly Amount</div>
          <div className="text-right">Formatted</div>
        </div>

        {/* Payroll Section */}
        <TableSection 
          title="💼 Payroll Details (Biweekly)" 
          data={monthlyData.payroll} 
          category="payroll"
          bgColor="bg-blue-100"
          onUpdate={updateValue}
        />

        {/* Net Income Display - Calculated, Not Editable */}
        <div className="bg-green-50 border-l-4 border-green-400">
          <div className="grid grid-cols-3 gap-4 p-3 bg-green-100 font-semibold border-b">
            <div>💰 Net Income (Calculated)</div>
            <div className="text-center">Amount</div>
            <div className="text-right">Monthly Equivalent</div>
          </div>
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-3 gap-4 py-1">
              <div className="font-medium">Biweekly Net Pay:</div>
              <div className="text-center font-bold text-green-600">${biweeklyNetPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div className="text-right">${monthlyNetPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 py-1 text-sm text-gray-600">
              <div>Gross Pay (Biweekly):</div>
              <div className="text-center">${biweeklyGrossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div className="text-right">${monthlyGrossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 py-1 text-sm text-gray-600">
              <div>Total Deductions:</div>
              <div className="text-center">-${(totalTaxDeductions + totalPretaxDeductions + totalOtherDeductions).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div className="text-right">-${((totalTaxDeductions + totalPretaxDeductions + totalOtherDeductions) * 2.17).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 py-1 text-xs text-gray-500 border-t pt-2">
              <div>Effective Tax Rate:</div>
              <div className="text-center">{biweeklyGrossPay > 0 ? (((totalTaxDeductions + totalPretaxDeductions + totalOtherDeductions) / biweeklyGrossPay) * 100).toFixed(1) : 0}%</div>
              <div className="text-right">Monthly calculation: biweekly × 2.17</div>
            </div>
          </div>
        </div>

        {/* Additional Income Sources */}
        <TableSection 
          title="💰 Additional Income Sources" 
          data={monthlyData.additionalIncome} 
          category="additionalIncome"
          bgColor="bg-green-100"
          onUpdate={updateValue}
        />

        {/* Venmo Section - Special handling */}
        <VenmoSection 
          venmoData={monthlyData.venmo}
          onUpdate={updateValue}
          totalVenmo={totalVenmo}
        />

        {/* Investment Accounts */}
        <TableSection 
          title="📈 Investment Accounts" 
          data={monthlyData.investments} 
          category="investments"
          bgColor="bg-purple-100"
          onUpdate={updateValue}
        />

        {/* Savings Accounts */}
        <TableSection 
          title="🏛️ Savings & Business Accounts" 
          data={monthlyData.savings} 
          category="savings"
          bgColor="bg-emerald-100"
          onUpdate={updateValue}
        />

        {/* Credit Card Spending */}
        <TableSection 
          title="💳 Credit Card Spending" 
          data={monthlyData.creditCards} 
          category="creditCards"
          bgColor="bg-yellow-100"
          onUpdate={updateValue}
        />

        {/* Essential Expenses */}
        <TableSection 
          title="🏠 Essential Expenses" 
          data={monthlyData.essentials} 
          category="essentials"
          bgColor="bg-red-100"
          onUpdate={updateValue}
        />



        {/* Custom Expenses Section */}
        <CustomExpensesSection 
          customExpenses={customExpenses}
          newExpense={newExpense}
          onNewExpenseChange={handleNewExpenseChange}
          onAddCustomExpense={addCustomExpense}
          onRemoveCustomExpense={removeCustomExpense}
          onUpdateCustomExpense={updateCustomExpense}
          totalCustomExpenses={totalCustomExpenses}
        />

        {/* Summary Row */}
        <div className="bg-gray-200 p-4 border-t-2">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Monthly Summary</h4>
              <div className="space-y-1 text-sm font-medium text-gray-900">
                <div className="flex justify-between">
                  <span>Monthly Net Income:</span>
                  <span className="font-bold text-gray-900">${totalMonthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>  • Payroll Net:</span>
                  <span>${monthlyNetPay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>  • Additional:</span>
                  <span>${totalAdditionalIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Venmo Net Flow:</span>
                  <span className={`font-medium ${totalVenmo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalVenmo >= 0 ? '+' : ''}${totalVenmo.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Investments:</span>
                  <span className="font-medium">-${totalInvestments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Savings:</span>
                  <span className="font-medium">-${totalSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Cards:</span>
                  <span className="font-medium">-${totalCreditCards.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Essentials:</span>
                  <span className="font-medium">-${totalEssentials.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custom Expenses:</span>
                  <span className="font-medium">-${totalCustomExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Account Allocation</h4>
              <div className="space-y-1 text-sm font-medium text-gray-900">
                <div className="flex justify-between">
                  <span>Total Investments:</span>
                  <span className="font-medium text-purple-600">${totalInvestments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Savings:</span>
                  <span className="font-medium text-emerald-600">${totalSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Investment Rate:</span>
                  <span className="font-medium">{totalMonthlyIncome > 0 ? ((totalInvestments / totalMonthlyIncome) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Savings Rate:</span>
                  <span className="font-medium">{totalMonthlyIncome > 0 ? ((totalSavings / totalMonthlyIncome) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Spending:</span>
                  <span className="font-medium">${(totalCreditCards + totalEssentials + totalCustomExpenses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Net Cash Flow:</span>
                  <span className={`${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netCashFlow.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">How to Use This Enhanced Framework:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Settings:</strong> Click the Settings button to configure your default salary and automatic deductions.</li>
          <li>• <strong>Auto Deductions:</strong> Edit amounts and descriptions to match your actual paycheck deductions.</li>
          <li>• <strong>Month Navigation:</strong> Use Previous/Next buttons to navigate between months. Data auto-saves to browser storage.</li>
          <li>• <strong>Data Storage:</strong> All data is stored locally in your browser (localStorage). Use Backup/Restore for file backups.</li>
          <li>• <strong>Archive:</strong> View all saved months with key metrics and options to edit, export PDFs, or delete.</li>
          <li>• <strong>Custom Expenses:</strong> Add specific purchases with categories for detailed tracking (e.g., "Dining - Starbucks").</li>
          <li>• <strong>Investment Allocation:</strong> Track monthly contributions to each of your investment accounts.</li>
          <li>• <strong>Goal:</strong> Aim for positive net cash flow and 20%+ total investment rate across all accounts.</li>
        </ul>
      </div> */}
    </div>
  );
};

export default FinancialTracker;