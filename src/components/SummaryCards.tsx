import React from 'react';
import { Plus, Minus, DollarSign } from 'lucide-react';

interface SummaryCardsProps {
  totalIncome: number;
  totalOutflows: number;
  netCashFlow: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = React.memo(({
  totalIncome,
  totalOutflows,
  netCashFlow
}) => (
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
));

SummaryCards.displayName = 'SummaryCards';

export default SummaryCards;