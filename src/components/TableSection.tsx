import React from 'react';
import NumberInput from './NumberInput';

interface TableSectionProps {
  title: string;
  data: Record<string, number>;
  category: string;
  bgColor?: string;
  onUpdate: (category: string, subcategory: string, value: string) => void;
}

const TableSection: React.FC<TableSectionProps> = React.memo(({ 
  title, 
  data, 
  category, 
  bgColor = "bg-gray-50",
  onUpdate 
}) => (
  <div className="mb-6">
    <h3 className={`text-lg font-semibold p-3 ${bgColor} border-b`}>{title}</h3>
    {Object.entries(data).map(([key, value]) => (
      <div key={`${category}-${key}`} className="grid grid-cols-3 gap-4 p-2 border-b hover:bg-gray-25">
        <div className="flex items-center">
          <span className="text-sm capitalize">
            {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}
          </span>
        </div>
        <div>
          <NumberInput
            value={value}
            onChange={(val) => onUpdate(category, key, val)}
            id={`${category}-${key}`}
          />
        </div>
        <div className="text-sm font-medium text-right">
          ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    ))}
  </div>
));

TableSection.displayName = 'TableSection';

export default TableSection;