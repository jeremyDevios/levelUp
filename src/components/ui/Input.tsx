import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = '', ...rest }: InputProps) {
  return (
    <input
      className={`w-full px-4 py-2 rounded-md border bg-transparent text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 ${className}`}
      {...rest}
    />
  );
}

/*
Usage example:
<Input placeholder="Email" />
*/
