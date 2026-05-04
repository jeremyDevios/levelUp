import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };
  const variants: Record<string, string> = {
    primary: 'text-white bg-gradient-to-r from-orange-500 to-yellow-300 shadow-sm',
    ghost: 'bg-transparent text-current',
    outline: 'bg-transparent border border-current',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/*
Usage examples (presentational only):
<Button onClick={() => {}} >Primary</Button>
<Button variant="outline" size="sm">Outline</Button>
*/
