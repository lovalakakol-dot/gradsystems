import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, className = '', children, ...props }, ref) => {
    return (
      <label className="block">
        {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
        <select
          ref={ref}
          id={id}
          className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33] disabled:opacity-60 ${className}`}
          {...props}
        >
          {children}
        </select>
      </label>
    );
  }
);
Select.displayName = 'Select';

export default Select;