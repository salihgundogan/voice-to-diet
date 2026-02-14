import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

interface NavItem {
    to: string;
    icon: string;
    label: string;
}

const NAV_ITEMS: NavItem[] = [
    { to: '/', icon: '🏠', label: 'Ana Sayfa' },
    { to: '/report', icon: '📊', label: 'Raporlar' },
    { to: '/profile', icon: '👤', label: 'Profil' },
];

export function BottomNav() {
    return (
        <nav className={styles['bottomNav']} aria-label="Ana navigasyon">
            {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        `${styles['navItem']} ${isActive ? styles['active'] : ''}`
                    }
                >
                    <span className={styles['navIcon']}>{item.icon}</span>
                    <span className={styles['navLabel']}>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
