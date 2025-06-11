import React, { useState, useEffect } from 'react';
import { X, Settings, Save, Calendar, Archive, Download, ChevronLeft, ChevronRight, Upload, HardDrive } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { generateFinancialPDF } from '../utils/pdfExport';
import TableSection from './TableSection';
import AutoDeductionsSection from './AutoDeductionsSection';
import VenmoSection from './VenmoSection';
import CustomExpensesSection from './CustomExpensesSection';
import SummaryCards from './SummaryCards';

interface MonthlyData {
  income: {
    primarySalary: number;
    businessIncome: number;
    otherIncome: number;
  };
  automaticDeductions: {
    '401k_contribution': { amount: number; description: string };
    'hsa_contribution': { amount: number; description: string };
    'cigna_insurance': { amount: number; description: string };
    'health_insurance': { amount: number; description: string };
    'life_insurance': { amount: number; description: string };
    'disability_insurance': { amount: number; description: string };
    'parking_transit': { amount: number; description: string };
    'dependent_care_fsa': { amount: number; description: string };
    'other_pretax': { amount: number; description: string };
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

interface SavedMonth {
  id: string;
  monthYear: string;
  data: MonthlyData;
  customExpenses: Array<{ id: number; category: string; name: string; amount: number }>;
  timestamp: string;
}

const FinancialTracker = () => {
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [currentMonthYear, setCurrentMonthYear] = useState(() => {
    const now = new Date();
    return format(now, 'yyyy-MM');
  });
  const [savedMonths, setSavedMonths] = useState<SavedMonth[]>([]);
  const [defaultConfig, setDefaultConfig] = useState({
    primarySalary: 6859,
    automaticDeductions: {
      '401k_contribution': { amount: 442, description: '4% of gross salary with employer match' },
      'hsa_contribution': { amount: 72, description: 'Health Savings Account - triple tax advantaged' },
      'cigna_insurance': { amount: 32, description: 'Cigna accident/injury insurance coverage' },
      'health_insurance': { amount: 0, description: 'Medical/dental/vision insurance premiums' },
      'life_insurance': { amount: 0, description: 'Company life insurance premiums' },
      'disability_insurance': { amount: 0, description: 'Short/long term disability coverage' },
      'parking_transit': { amount: 0, description: 'Pre-tax parking or transit benefits' },
      'dependent_care_fsa': { amount: 0, description: 'Dependent Care Flexible Spending Account' },
      'other_pretax': { amount: 155, description: 'Other pre-tax deductions (specify in description)' }
    }
  });

  const [monthlyData, setMonthlyData] = useState({
    // Income Sources
    income: {
      primarySalary: defaultConfig.primarySalary,
      businessIncome: 0,
      otherIncome: 0
    },
    
    // Automatic Deductions (from paycheck) - All editable
    automaticDeductions: { ...defaultConfig.automaticDeductions },
    
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
      phone: 0,
      groceries: 0,
      transportation: 0
    },
    
    // Discretionary Spending - Fixed categories
    discretionary: {
      dining_out: 0,
      entertainment: 0,
      shopping: 0,
      subscriptions: 0,
      travel: 0,
      other: 0
    }
  });

  // Custom itemized expenses
  const [customExpenses, setCustomExpenses] = useState<Array<{ id: number; category: string; name: string; amount: number }>>([]);
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

  const updateValue = (category: string, subcategory: string, value: string) => {
    setMonthlyData(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [subcategory]: parseFloat(value) || 0
      }
    }));
  };

  const updateDeductionAmount = (key: string, amount: string) => {
    setMonthlyData(prev => ({
      ...prev,
      automaticDeductions: {
        ...prev.automaticDeductions,
        [key]: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(prev.automaticDeductions as any)[key],
          amount: parseFloat(amount) || 0
        }
      }
    }));
  };

  const updateDeductionDescription = (key: string, description: string) => {
    setMonthlyData(prev => ({
      ...prev,
      automaticDeductions: {
        ...prev.automaticDeductions,
        [key]: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(prev.automaticDeductions as any)[key],
          description: description
        }
      }
    }));
  };

  const updateDefaultConfig = (category: string, key: string | null, field: string | null, value: string) => {
    if (category === 'primarySalary') {
      setDefaultConfig(prev => ({
        ...prev,
        primarySalary: parseFloat(value) || 0
      }));
    } else if (category === 'automaticDeductions') {
      setDefaultConfig(prev => ({
        ...prev,
        automaticDeductions: {
          ...prev.automaticDeductions,
          [key as string]: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(prev.automaticDeductions as any)[key as string],
            [field as string]: field === 'amount' ? parseFloat(value) || 0 : value
          }
        }
      }));
    }
  };

  const applyDefaultConfig = () => {
    setMonthlyData(prev => ({
      ...prev,
      income: {
        ...prev.income,
        primarySalary: defaultConfig.primarySalary
      },
      automaticDeductions: { ...defaultConfig.automaticDeductions }
    }));
    setShowSettings(false);
  };

  const resetToDefaults = () => {
    setMonthlyData(prev => ({
      ...prev,
      income: {
        primarySalary: defaultConfig.primarySalary,
        businessIncome: 0,
        otherIncome: 0
      },
      automaticDeductions: { ...defaultConfig.automaticDeductions }
    }));
  };

  const addCustomExpense = () => {
    if (newExpense.category && newExpense.name && newExpense.amount) {
      setCustomExpenses(prev => [...prev, { ...newExpense, id: Date.now() }]);
      setNewExpense({ category: '', name: '', amount: 0 });
    }
  };

  const removeCustomExpense = (id: number) => {
    setCustomExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const updateCustomExpense = (id: number, field: string, value: string | number) => {
    setCustomExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, [field]: field === 'amount' ? parseFloat(value as string) || 0 : value } : expense
    ));
  };

  // Month management functions
  const loadMonthData = (monthYear: string) => {
    const saved = savedMonths.find(m => m.monthYear === monthYear);
    if (saved) {
      setMonthlyData(saved.data);
      setCustomExpenses(saved.customExpenses);
    } else {
      // Reset to defaults for new month
      setMonthlyData({
        income: {
          primarySalary: defaultConfig.primarySalary,
          businessIncome: 0,
          otherIncome: 0
        },
        automaticDeductions: { ...defaultConfig.automaticDeductions },
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
        },
        discretionary: {
          dining_out: 0,
          entertainment: 0,
          shopping: 0,
          subscriptions: 0,
          travel: 0,
          other: 0
        }
      });
      setCustomExpenses([]);
    }
  };

  const saveCurrentMonth = () => {
    const existingIndex = savedMonths.findIndex(m => m.monthYear === currentMonthYear);
    const savedMonth: SavedMonth = {
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

  const deleteMonth = (monthYear: string) => {
    setSavedMonths(prev => prev.filter(m => m.monthYear !== monthYear));
    if (monthYear === currentMonthYear) {
      // If deleting current month, reset to current month
      const now = new Date();
      setCurrentMonthYear(format(now, 'yyyy-MM'));
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
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
    };
    
    await generateFinancialPDF(pdfData);
  };

  // Data backup and restore functions
  const exportData = () => {
    const dataToExport = {
      savedMonths,
      defaultConfig,
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

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.savedMonths && Array.isArray(importedData.savedMonths)) {
          setSavedMonths(importedData.savedMonths);
        }
        
        if (importedData.defaultConfig) {
          setDefaultConfig(importedData.defaultConfig);
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

  // Calculate totals
  const totalIncome = Object.values(monthlyData.income).reduce((sum, val) => sum + val, 0);
  const totalAutomaticDeductions = Object.values(monthlyData.automaticDeductions).reduce((sum, val) => sum + val.amount, 0);
  const totalInvestments = Object.values(monthlyData.investments).reduce((sum, val) => sum + val, 0);
  const totalSavings = Object.values(monthlyData.savings).reduce((sum, val) => sum + val, 0);
  const totalVenmo = Object.values(monthlyData.venmo).reduce((sum, val) => sum + val, 0);
  const totalCreditCards = Object.values(monthlyData.creditCards).reduce((sum, val) => sum + val, 0);
  const totalEssentials = Object.values(monthlyData.essentials).reduce((sum, val) => sum + val, 0);
  const totalDiscretionary = Object.values(monthlyData.discretionary).reduce((sum, val) => sum + val, 0);
  const totalCustomExpenses = customExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalOutflows = totalAutomaticDeductions + totalInvestments + totalSavings + Math.abs(totalVenmo) + totalCreditCards + totalEssentials + totalDiscretionary + totalCustomExpenses;
  const netCashFlow = totalIncome - totalOutflows;

  const SettingsModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${showSettings ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Configuration Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Primary Salary Configuration */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-green-800">Default Primary Salary</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <label className="block text-sm font-medium mb-2">Monthly Primary Salary</label>
                <input
                  type="number"
                  value={defaultConfig.primarySalary}
                  onChange={(e) => updateDefaultConfig('primarySalary', null, null, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter your monthly salary"
                  step="0.01"
                />
              </div>
            </div>

            {/* Automatic Deductions Configuration */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">Default Automatic Deductions</h3>
              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                {Object.entries(defaultConfig.automaticDeductions).map(([key, data]) => (
                  <div key={key} className="grid grid-cols-12 gap-3 p-3 bg-white rounded border">
                    <div className="col-span-3 flex items-center">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={data.amount}
                        onChange={(e) => updateDefaultConfig('automaticDeductions', key, 'amount', e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded"
                        placeholder="Amount"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2 text-sm font-medium text-right flex items-center">
                      ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={data.description}
                        onChange={(e) => updateDefaultConfig('automaticDeductions', key, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded"
                        placeholder="Description..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <div className="space-x-3">
                <button
                  onClick={applyDefaultConfig}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Apply Configuration
                </button>
                <button
                  onClick={resetToDefaults}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Reset Current Values
                </button>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
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
                    const monthIncome = Object.values(month.data.income).reduce((sum, val) => sum + val, 0);
                    const monthOutflows = Object.values(month.data.automaticDeductions).reduce((sum, val) => sum + val.amount, 0) +
                                        Object.values(month.data.investments).reduce((sum, val) => sum + val, 0) +
                                        Object.values(month.data.savings).reduce((sum, val) => sum + val, 0) +
                                        Object.values(month.data.creditCards).reduce((sum, val) => sum + val, 0) +
                                        Object.values(month.data.essentials).reduce((sum, val) => sum + val, 0) +
                                        Object.values(month.data.discretionary).reduce((sum, val) => sum + val, 0) +
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

  // Component removed - using modular TableSection component

  // Component removed - using modular AutoDeductionsSection component

  // Component removed - using modular VenmoSection component

  // Component removed - using modular CustomExpensesSection component

  // Custom expense handlers
  const handleNewExpenseChange = (field: string, value: string | number) => {
    setNewExpense(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
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
        totalIncome={totalIncome}
        totalOutflows={totalOutflows}
        netCashFlow={netCashFlow}
      />

      {/* Main Tracking Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 gap-4 p-3 bg-gray-100 font-semibold border-b">
          <div>Category / Account</div>
          <div className="text-center">Monthly Amount</div>
          <div className="text-right">Formatted</div>
        </div>

        {/* Income Section */}
        <TableSection 
          title="💰 Income Sources" 
          data={monthlyData.income} 
          category="income"
          bgColor="bg-green-100"
          onUpdate={updateValue}
        />

        {/* Automatic Deductions - Special handling */}
        <AutoDeductionsSection 
          automaticDeductions={monthlyData.automaticDeductions}
          onUpdateAmount={updateDeductionAmount}
          onUpdateDescription={updateDeductionDescription}
          totalAutomaticDeductions={totalAutomaticDeductions}
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

        {/* Discretionary Spending */}
        <TableSection 
          title="🎯 Discretionary Spending (Fixed Categories)" 
          data={monthlyData.discretionary} 
          category="discretionary"
          bgColor="bg-pink-100"
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
              <h4 className="font-semibold mb-2">Monthly Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Income:</span>
                  <span className="font-medium">${totalIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto Deductions:</span>
                  <span className="font-medium">-${totalAutomaticDeductions.toLocaleString()}</span>
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
                  <span>Discretionary:</span>
                  <span className="font-medium">-${totalDiscretionary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custom Expenses:</span>
                  <span className="font-medium">-${totalCustomExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Account Allocation</h4>
              <div className="space-y-1 text-sm">
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
                  <span className="font-medium">{totalIncome > 0 ? ((totalInvestments / totalIncome) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Savings Rate:</span>
                  <span className="font-medium">{totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Spending:</span>
                  <span className="font-medium">${(totalCreditCards + totalEssentials + totalDiscretionary + totalCustomExpenses).toLocaleString()}</span>
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
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">How to Use This Enhanced Framework:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Settings:</strong> Click the Settings button to configure your default salary and automatic deductions.</li>
          <li>• <strong>Auto Deductions:</strong> Edit amounts and descriptions to match your actual paycheck deductions.</li>
          <li>• <strong>Month Navigation:</strong> Use Previous/Next buttons to navigate between months. Data auto-saves to browser storage.</li>
          <li>• <strong>Data Storage:</strong> All data is stored locally in your browser (localStorage). Use Backup/Restore for file backups.</li>
          <li>• <strong>Archive:</strong> View all saved months with key metrics and options to edit, export PDFs, or delete.</li>
          <li>• <strong>Custom Expenses:</strong> Add specific purchases with categories for detailed tracking (e.g., &ldquo;Dining - Starbucks - $15.50&rdquo;).</li>
          <li>• <strong>Investment Allocation:</strong> Track monthly contributions to each of your investment accounts.</li>
          <li>• <strong>Goal:</strong> Aim for positive net cash flow and 20%+ total investment rate across all accounts.</li>
        </ul>
      </div>
    </div>
  );
};

export default FinancialTracker;