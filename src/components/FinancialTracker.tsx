import React, { useState } from 'react';
import { DollarSign, Plus, Minus, X, Edit3, Settings } from 'lucide-react';

const FinancialTracker = () => {
  // Configuration state for default values
  const [showSettings, setShowSettings] = useState(false);
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
  const [customExpenses, setCustomExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: '', name: '', amount: 0 });

  const updateValue = (category, subcategory, value) => {
    setMonthlyData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: parseFloat(value) || 0
      }
    }));
  };

  const updateDeductionAmount = (key, amount) => {
    setMonthlyData(prev => ({
      ...prev,
      automaticDeductions: {
        ...prev.automaticDeductions,
        [key]: {
          ...prev.automaticDeductions[key],
          amount: parseFloat(amount) || 0
        }
      }
    }));
  };

  const updateDeductionDescription = (key, description) => {
    setMonthlyData(prev => ({
      ...prev,
      automaticDeductions: {
        ...prev.automaticDeductions,
        [key]: {
          ...prev.automaticDeductions[key],
          description: description
        }
      }
    }));
  };

  const updateDefaultConfig = (category, key, field, value) => {
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
          [key]: {
            ...prev.automaticDeductions[key],
            [field]: field === 'amount' ? parseFloat(value) || 0 : value
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

  const removeCustomExpense = (id) => {
    setCustomExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const updateCustomExpense = (id, field, value) => {
    setCustomExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expense, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : expense
    ));
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

  const TableSection = ({ title, data, category, bgColor = "bg-gray-50" }) => (
    <div className="mb-6">
      <h3 className={`text-lg font-semibold p-3 ${bgColor} border-b`}>{title}</h3>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="grid grid-cols-3 gap-4 p-2 border-b hover:bg-gray-25">
          <div className="flex items-center">
            <span className="text-sm capitalize">
              {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
            </span>
          </div>
          <div>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => updateValue(category, key, e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="0"
              step="0.01"
            />
          </div>
          <div className="text-sm font-medium text-right">
            ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      ))}
    </div>
  );

  const AutoDeductionsSection = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold p-3 bg-blue-100 border-b">
        🏦 Automatic Deductions (Pre-tax/Benefits from Paycheck)
      </h3>
      <div className="bg-blue-25 p-3 text-sm text-blue-800 border-b">
        <p><strong>Note:</strong> These are automatically deducted from your gross pay before you receive your paycheck. 
        Update amounts and descriptions to match your actual deductions. Your net pay already reflects these deductions.</p>
      </div>
      {Object.entries(monthlyData.automaticDeductions).map(([key, data]) => (
        <div key={key} className="border-b hover:bg-gray-25">
          <div className="grid grid-cols-12 gap-2 p-3">
            <div className="col-span-3 flex items-center">
              <span className="text-sm font-medium capitalize">
                {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
              </span>
            </div>
            <div className="col-span-2">
              <input
                type="number"
                value={data.amount || ''}
                onChange={(e) => updateDeductionAmount(key, e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded"
                placeholder="0"
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
                onChange={(e) => updateDeductionDescription(key, e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded text-gray-600"
                placeholder="Description of this deduction..."
              />
            </div>
          </div>
        </div>
      ))}
      <div className="bg-gray-100 p-3">
        <div className="flex justify-between font-semibold">
          <span>Total Automatic Deductions:</span>
          <span>${totalAutomaticDeductions.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const VenmoSection = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold p-3 bg-green-100 border-b">
        💸 Venmo Cash Flow
      </h3>
      <div className="bg-green-25 p-3 text-sm text-green-800 border-b">
        <p><strong>Track Venmo activity:</strong> Positive values are money coming in (cashouts, payments received). 
        Negative values are money going out (payments to others).</p>
      </div>
      {Object.entries(monthlyData.venmo).map(([key, value]) => (
        <div key={key} className="grid grid-cols-3 gap-4 p-2 border-b hover:bg-gray-25">
          <div className="flex items-center">
            <span className="text-sm capitalize">
              {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
            </span>
          </div>
          <div>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => updateValue('venmo', key, e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
              placeholder="0"
              step="0.01"
            />
          </div>
          <div className={`text-sm font-medium text-right ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {value >= 0 ? '+' : ''}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      ))}
      <div className="bg-gray-100 p-3">
        <div className="flex justify-between font-semibold">
          <span>Net Venmo Flow:</span>
          <span className={totalVenmo >= 0 ? 'text-green-600' : 'text-red-600'}>
            {totalVenmo >= 0 ? '+' : ''}${totalVenmo.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );

  const CustomExpensesSection = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold p-3 bg-orange-100 border-b">
        📝 Itemized Custom Expenses
      </h3>
      <div className="bg-orange-25 p-3 text-sm text-orange-800 border-b">
        <p><strong>Add specific expenses:</strong> Create custom categories and itemize individual purchases for detailed tracking.</p>
      </div>
      
      {/* Add new expense form */}
      <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 border-b">
        <div className="col-span-3">
          <input
            type="text"
            value={newExpense.category}
            onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-2 py-1 text-sm border rounded"
            placeholder="Category (e.g., Dining)"
          />
        </div>
        <div className="col-span-4">
          <input
            type="text"
            value={newExpense.name}
            onChange={(e) => setNewExpense(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-2 py-1 text-sm border rounded"
            placeholder="Expense name (e.g., Starbucks)"
          />
        </div>
        <div className="col-span-2">
          <input
            type="number"
            value={newExpense.amount || ''}
            onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            className="w-full px-2 py-1 text-sm border rounded"
            placeholder="Amount"
            step="0.01"
          />
        </div>
        <div className="col-span-2">
          <button
            onClick={addCustomExpense}
            className="w-full bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600 flex items-center justify-center"
          >
            <Plus size={14} className="mr-1" />
            Add
          </button>
        </div>
        <div className="col-span-1"></div>
      </div>

      {/* Existing expenses */}
      {customExpenses.length > 0 && (
        <div>
          <div className="grid grid-cols-12 gap-2 p-2 bg-gray-100 border-b text-sm font-semibold">
            <div className="col-span-3">Category</div>
            <div className="col-span-4">Expense Name</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Formatted</div>
            <div className="col-span-1">Action</div>
          </div>
          {customExpenses.map((expense) => (
            <div key={expense.id} className="grid grid-cols-12 gap-2 p-2 border-b hover:bg-gray-25">
              <div className="col-span-3">
                <input
                  type="text"
                  value={expense.category}
                  onChange={(e) => updateCustomExpense(expense.id, 'category', e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  value={expense.name}
                  onChange={(e) => updateCustomExpense(expense.id, 'name', e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={expense.amount || ''}
                  onChange={(e) => updateCustomExpense(expense.id, 'amount', e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded"
                  step="0.01"
                />
              </div>
              <div className="col-span-2 text-sm font-medium text-right flex items-center">
                ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="col-span-1 flex items-center">
                <button
                  onClick={() => removeCustomExpense(expense.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-gray-100 p-3">
        <div className="flex justify-between font-semibold">
          <span>Total Custom Expenses:</span>
          <span>${totalCustomExpenses.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Settings Modal */}
      <SettingsModal />
      
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Tracking Framework</h1>
            <p className="text-gray-600">Track income and allocations across all accounts and spending categories</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
          >
            <Settings size={16} className="mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg border">
          <h3 className="text-green-800 font-semibold flex items-center">
            <Plus className="mr-2" size={16} />
            Total Income
          </h3>
          <p className="text-2xl font-bold text-green-900">${totalIncome.toLocaleString()}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border">
          <h3 className="text-red-800 font-semibold flex items-center">
            <Minus className="mr-2" size={16} />
            Total Outflows
          </h3>
          <p className="text-2xl font-bold text-red-900">${totalOutflows.toLocaleString()}</p>
        </div>
        
        <div className={`${netCashFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg border`}>
          <h3 className={`${netCashFlow >= 0 ? 'text-blue-800' : 'text-orange-800'} font-semibold flex items-center`}>
            <DollarSign className="mr-2" size={16} />
            Net Cash Flow
          </h3>
          <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            ${netCashFlow.toLocaleString()}
          </p>
        </div>
      </div>

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
        />

        {/* Automatic Deductions - Special handling */}
        <AutoDeductionsSection />

        {/* Venmo Section - Special handling */}
        <VenmoSection />

        {/* Investment Accounts */}
        <TableSection 
          title="📈 Investment Accounts" 
          data={monthlyData.investments} 
          category="investments"
          bgColor="bg-purple-100"
        />

        {/* Savings Accounts */}
        <TableSection 
          title="🏛️ Savings & Business Accounts" 
          data={monthlyData.savings} 
          category="savings"
          bgColor="bg-emerald-100"
        />

        {/* Credit Card Spending */}
        <TableSection 
          title="💳 Credit Card Spending" 
          data={monthlyData.creditCards} 
          category="creditCards"
          bgColor="bg-yellow-100"
        />

        {/* Essential Expenses */}
        <TableSection 
          title="🏠 Essential Expenses" 
          data={monthlyData.essentials} 
          category="essentials"
          bgColor="bg-red-100"
        />

        {/* Discretionary Spending */}
        <TableSection 
          title="🎯 Discretionary Spending (Fixed Categories)" 
          data={monthlyData.discretionary} 
          category="discretionary"
          bgColor="bg-pink-100"
        />

        {/* Custom Expenses Section */}
        <CustomExpensesSection />

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
          <li>• <strong>Venmo Tracking:</strong> Use positive values for money coming in, negative for money going out.</li>
          <li>• <strong>Custom Expenses:</strong> Add specific purchases with categories for detailed tracking (e.g., "Dining - Starbucks - $15.50").</li>
          <li>• <strong>Investment Allocation:</strong> Track monthly contributions to each of your investment accounts.</li>
          <li>• <strong>Goal:</strong> Aim for positive net cash flow and 20%+ total investment rate across all accounts.</li>
        </ul>
      </div>
    </div>
  );
};

export default FinancialTracker;