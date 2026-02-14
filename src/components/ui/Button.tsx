import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    iconOnly?: boolean;
    children: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    iconOnly = false,
    className = '',
    children,
    ...props
}: ButtonProps) {
    const classNames = [
        styles['button'],
        styles[variant],
        size !== 'medium' ? styles[size] : '',
        fullWidth ? styles['fullWidth'] : '',
        iconOnly ? styles['iconOnly'] : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classNames} {...props}>
            {children}
        </button>
    );
}
