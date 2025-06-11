import React, { useState } from 'react';

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
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value.toString());

  const handleFocus = () => {
    setIsFocused(true);
    if (value === 0) {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (displayValue === '' || displayValue === '0') {
      setDisplayValue('0');
      onChange('0');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    onChange(newValue);
  };

  // Update display value when value prop changes (but not when focused and user is typing)
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toString());
    }
  }, [value, isFocused]);

  return (
    <input
      id={id}
      type="number"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
      step={step}
    />
  );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;