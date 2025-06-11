import React from 'react';
import NumberInput from './NumberInput';

interface VenmoSectionProps {
  venmoData: Record<string, number>;
  onUpdate: (category: string, key: string, value: string) => void;
  totalVenmo: number;
}

const VenmoSection: React.FC<VenmoSectionProps> = React.memo(({
  venmoData,
  onUpdate,
  totalVenmo
}) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold p-3 bg-green-100 border-b">
      💸 Venmo Cash Flow
    </h3>
    <div className="bg-green-50 p-3 text-sm text-green-900 font-medium border-b">
      <p><strong>Track Venmo activity:</strong> Positive values are money coming in (cashouts, payments received). 
      Negative values are money going out (payments to others).</p>
    </div>
    {Object.entries(venmoData).map(([key, value]) => (
      <div key={`venmo-${key}`} className="grid grid-cols-3 gap-4 p-2 border-b hover:bg-gray-50">
        <div className="flex items-center">
          <span className="text-sm font-semibold text-gray-900 capitalize">
            {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
          </span>
        </div>
        <div>
          <NumberInput
            value={value}
            onChange={(val) => onUpdate('venmo', key, val)}
            id={`venmo-${key}`}
          />
        </div>
        <div className={`text-sm font-bold text-right ${value >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          {value >= 0 ? '+' : ''}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    ))}
    <div className="bg-gray-100 p-3">
      <div className="flex justify-between font-bold text-gray-900">
        <span>Net Venmo Flow:</span>
        <span className={totalVenmo >= 0 ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
          {totalVenmo >= 0 ? '+' : ''}${totalVenmo.toLocaleString()}
        </span>
      </div>
    </div>
  </div>
));

VenmoSection.displayName = 'VenmoSection';

export default VenmoSection;