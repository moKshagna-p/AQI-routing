import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        default: 'glass-button glass-button--filled text-white',
        secondary: 'glass-button glass-button--soft text-white/90',
        outline: 'glass-button glass-button--outline text-white',
        ghost: 'glass-button glass-button--ghost text-white/80 hover:text-white',
        destructive: 'bg-danger text-white hover:bg-danger/90'
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8',
        icon: 'h-12 w-12 p-0'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        data-size={size ?? 'default'}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
