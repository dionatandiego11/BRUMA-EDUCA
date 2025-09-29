// src/components/Button.tsx
import React from 'react';

// Este é um padrão comum para criar componentes polimórficos em React com TypeScript.
// Ele permite que o componente `Button` renderize como diferentes elementos HTML.
type PropsOf<C extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> =
  JSX.LibraryManagedAttributes<C, React.ComponentPropsWithoutRef<C>>;

type ButtonProps<C extends React.ElementType> = {
  /**
   * O elemento a ser renderizado. Pode ser 'button', 'a', 'span', etc.
   * @default 'button'
   */
  as?: C;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & Omit<PropsOf<C>, 'as' | 'children' | 'className'>;

const Button = <C extends React.ElementType = 'button'>({
  as,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps<C>) => {
  const Component = as || 'button';

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const isDisabled = (props as any).disabled;

  return (
    <Component
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;