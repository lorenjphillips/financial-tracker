import React from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  step?: string;
  id?: string;
}

const NumberInput: React.FC<NumberInputProps> = React.memo(({
  value,
  onChange,
  placeholder = "0",
  className = "w-full px-2 py-1 text-sm font-semibold text-gray-900 border rounded",
  step = "0.01",
  id
}) => {
  return (
    <input
      id={id}
      type="number"
      value={value === 0 ? '0' : value.toString()}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      placeholder={placeholder}
      step={step}
    />
  );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;