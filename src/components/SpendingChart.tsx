import React from 'react';

interface SpendingChartProps {
  categories: Array<{
    name: string;
    amount: number;
    color: string;
  }>;
  totalSpending: number;
}

const SpendingChart: React.FC<SpendingChartProps> = React.memo(({ categories, totalSpending }) => {
  if (totalSpending === 0) {
    return (
      <div className="mb-8 p-6 bg-white border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Monthly Spending Breakdown</h3>
        <p className="text-gray-500 text-center py-8">No spending data to display</p>
      </div>
    );
  }

  const maxAmount = Math.max(...categories.map(cat => cat.amount));

  return (
    <div className="mb-8 p-6 bg-white border rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Monthly Spending Breakdown</h3>
        <span className="text-sm text-gray-600">
          Total: ${totalSpending.toLocaleString()}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {categories.filter(cat => cat.amount > 0).map((category) => (
          <div key={`legend-${category.name}`} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-sm text-gray-700">{category.name}</span>
            <span className="text-xs text-gray-500">
              ${category.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-3">
        {categories
          .filter(cat => cat.amount > 0)
          .sort((a, b) => b.amount - a.amount)
          .map((category) => {
            const percentage = maxAmount > 0 ? (category.amount / maxAmount) * 100 : 0;
            const spendingPercentage = totalSpending > 0 ? (category.amount / totalSpending) * 100 : 0;

            return (
              <div key={`bar-${category.name}`} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {category.name}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-semibold">
                      ${category.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({spendingPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-300 ease-in-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {/* Summary bar showing all categories proportionally */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Distribution</span>
          <span className="text-sm text-gray-600">${totalSpending.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 flex overflow-hidden">
          {categories
            .filter(cat => cat.amount > 0)
            .map((category) => {
              const percentage = totalSpending > 0 ? (category.amount / totalSpending) * 100 : 0;
              return (
                <div
                  key={`total-bar-${category.name}`}
                  className="h-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: category.color
                  }}
                  title={`${category.name}: $${category.amount.toLocaleString()} (${percentage.toFixed(1)}%)`}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
});

SpendingChart.displayName = 'SpendingChart';

export default SpendingChart;