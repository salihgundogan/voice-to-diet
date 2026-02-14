import type { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    interactive?: boolean;
    noPadding?: boolean;
    glow?: boolean;
    children: ReactNode;
}

export function Card({
    interactive = false,
    noPadding = false,
    glow = false,
    className = '',
    children,
    ...props
}: CardProps) {
    const classNames = [
        styles['card'],
        interactive ? styles['interactive'] : '',
        noPadding ? styles['noPadding'] : '',
        glow ? styles['glow'] : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classNames} {...props}>
            {children}
        </div>
    );
}
