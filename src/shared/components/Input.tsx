import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className = '', ...props }, ref) => {
    return (
      <label className="block">
        {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
        <input
          ref={ref}
          id={id}
          className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#7A1E33] focus:outline-none focus:ring-1 focus:ring-[#7A1E33] disabled:opacity-60 ${className}`}
          {...props}
        />
      </label>
    );
  }
);
Input.displayName = 'Input';

export default Input;