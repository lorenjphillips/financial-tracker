import React from 'react';
import NumberInput from './NumberInput';

interface AutoDeduction {
  amount: number;
  description: string;
}

interface AutoDeductionsSectionProps {
  automaticDeductions: Record<string, AutoDeduction>;
  onUpdateAmount: (key: string, amount: string) => void;
  onUpdateDescription: (key: string, description: string) => void;
  totalAutomaticDeductions: number;
}

const AutoDeductionsSection: React.FC<AutoDeductionsSectionProps> = React.memo(({
  automaticDeductions,
  onUpdateAmount,
  onUpdateDescription,
  totalAutomaticDeductions
}) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold p-3 bg-blue-100 border-b">
      🏦 Automatic Deductions (Pre-tax/Benefits from Paycheck)
    </h3>
    <div className="bg-blue-25 p-3 text-sm text-blue-800 border-b">
      <p><strong>Note:</strong> These are automatically deducted from your gross pay before you receive your paycheck. 
      Update amounts and descriptions to match your actual deductions. Your net pay already reflects these deductions.</p>
    </div>
    {Object.entries(automaticDeductions).map(([key, data]) => (
      <div key={`deduction-${key}`} className="border-b hover:bg-gray-25">
        <div className="grid grid-cols-12 gap-2 p-3">
          <div className="col-span-3 flex items-center">
            <span className="text-sm font-medium capitalize">
              {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
            </span>
          </div>
          <div className="col-span-2">
            <NumberInput
              value={data.amount}
              onChange={(val) => onUpdateAmount(key, val)}
              id={`deduction-amount-${key}`}
            />
          </div>
          <div className="col-span-2 text-sm font-medium text-right flex items-center">
            ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="col-span-5">
            <input
              type="text"
              value={data.description}
              onChange={(e) => onUpdateDescription(key, e.target.value)}
              className="w-full px-2 py-1 text-xs border rounded text-gray-600"
              placeholder="Description of this deduction..."
              id={`deduction-desc-${key}`}
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
));

AutoDeductionsSection.displayName = 'AutoDeductionsSection';

export default AutoDeductionsSection;