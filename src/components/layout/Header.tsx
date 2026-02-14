import styles from './Header.module.css';

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function formatTurkishDate(): string {
    const now = new Date();
    const day = DAYS_TR[now.getDay()];
    const date = now.getDate();
    const month = MONTHS_TR[now.getMonth()];
    return `${day}, ${date} ${month}`;
}

export function Header() {
    return (
        <header className={styles['header']}>
            <div className={styles['brand']}>
                <span className={styles['logo']}>🥗</span>
                <h1 className={styles['title']}>VoiceDiet</h1>
            </div>
            <span className={styles['date']}>{formatTurkishDate()}</span>
        </header>
    );
}
