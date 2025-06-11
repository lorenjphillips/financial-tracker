import React from 'react';
import { Plus, X } from 'lucide-react';
import NumberInput from './NumberInput';

interface CustomExpense {
  id: number;
  category: string;
  name: string;
  amount: number;
}

interface CustomExpensesSectionProps {
  customExpenses: CustomExpense[];
  newExpense: { category: string; name: string; amount: number };
  onNewExpenseChange: (field: string, value: string | number) => void;
  onAddCustomExpense: () => void;
  onRemoveCustomExpense: (id: number) => void;
  onUpdateCustomExpense: (id: number, field: string, value: string | number) => void;
  totalCustomExpenses: number;
}

const CustomExpensesSection: React.FC<CustomExpensesSectionProps> = React.memo(({
  customExpenses,
  newExpense,
  onNewExpenseChange,
  onAddCustomExpense,
  onRemoveCustomExpense,
  onUpdateCustomExpense,
  totalCustomExpenses
}) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold p-3 bg-orange-100 border-b">
      📝 Itemized Custom Expenses
    </h3>
    <div className="bg-orange-50 p-3 text-sm text-orange-900 font-medium border-b">
      <p><strong>Add specific expenses:</strong> Create custom categories and itemize individual purchases for detailed tracking.</p>
    </div>
    
    {/* Add new expense form */}
    <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 border-b">
      <div className="col-span-3">
        <input
          type="text"
          value={newExpense.category}
          onChange={(e) => onNewExpenseChange('category', e.target.value)}
          className="w-full px-2 py-1 text-sm font-semibold text-gray-900 border rounded"
          placeholder="Category (e.g., Dining)"
          id="new-expense-category"
        />
      </div>
      <div className="col-span-4">
        <input
          type="text"
          value={newExpense.name}
          onChange={(e) => onNewExpenseChange('name', e.target.value)}
          className="w-full px-2 py-1 text-sm font-semibold text-gray-900 border rounded"
          placeholder="Expense name (e.g., Starbucks)"
          id="new-expense-name"
        />
      </div>
      <div className="col-span-2">
        <NumberInput
          value={newExpense.amount}
          onChange={(val) => onNewExpenseChange('amount', parseFloat(val) || 0)}
          placeholder="Amount"
          id="new-expense-amount"
        />
      </div>
      <div className="col-span-2">
        <button
          onClick={onAddCustomExpense}
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
        <div className="grid grid-cols-12 gap-2 p-2 bg-gray-100 border-b text-sm font-bold text-gray-900">
          <div className="col-span-3">Category</div>
          <div className="col-span-4">Expense Name</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Formatted</div>
          <div className="col-span-1">Action</div>
        </div>
        {customExpenses.map((expense) => (
          <div key={`expense-${expense.id}`} className="grid grid-cols-12 gap-2 p-2 border-b hover:bg-gray-50">
            <div className="col-span-3">
              <input
                type="text"
                value={expense.category}
                onChange={(e) => onUpdateCustomExpense(expense.id, 'category', e.target.value)}
                className="w-full px-2 py-1 text-sm font-semibold text-gray-900 border rounded"
                id={`expense-category-${expense.id}`}
              />
            </div>
            <div className="col-span-4">
              <input
                type="text"
                value={expense.name}
                onChange={(e) => onUpdateCustomExpense(expense.id, 'name', e.target.value)}
                className="w-full px-2 py-1 text-sm font-semibold text-gray-900 border rounded"
                id={`expense-name-${expense.id}`}
              />
            </div>
            <div className="col-span-2">
              <NumberInput
                value={expense.amount}
                onChange={(val) => onUpdateCustomExpense(expense.id, 'amount', val)}
                id={`expense-amount-${expense.id}`}
              />
            </div>
            <div className="col-span-2 text-sm font-bold text-gray-900 text-right flex items-center">
              ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="col-span-1 flex items-center">
              <button
                onClick={() => onRemoveCustomExpense(expense.id)}
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
      <div className="flex justify-between font-bold text-gray-900">
        <span>Total Custom Expenses:</span>
        <span>${totalCustomExpenses.toLocaleString()}</span>
      </div>
    </div>
  </div>
));

CustomExpensesSection.displayName = 'CustomExpensesSection';

export default CustomExpensesSection;