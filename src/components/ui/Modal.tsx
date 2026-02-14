import { type ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className={styles['overlay']}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className={styles['modal']}>
                <div className={styles['header']}>
                    <h2 id="modal-title" className={styles['title']}>
                        {title}
                    </h2>
                    <button
                        className={styles['closeButton']}
                        onClick={onClose}
                        aria-label="Kapat"
                    >
                        ✕
                    </button>
                </div>
                <div className={styles['body']}>{children}</div>
                {footer && <div className={styles['footer']}>{footer}</div>}
            </div>
        </div>
    );
}
