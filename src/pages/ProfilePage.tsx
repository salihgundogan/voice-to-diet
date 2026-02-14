import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
    return (
        <PageContainer>
            <div className={styles['page']}>
                <h2 className={styles['pageTitle']}>👤 Profil</h2>

                {/* Avatar */}
                <Card>
                    <div className={styles['avatar']}>
                        <div className={styles['avatarCircle']}>👩</div>
                        <div className={styles['avatarName']}>Demo Kullanıcı</div>
                        <div className={styles['avatarEmail']}>demo@voicediet.app</div>
                    </div>
                </Card>

                {/* Info list */}
                <div className={styles['infoList']}>
                    <div className={styles['infoItem']}>
                        <span className={styles['infoIcon']}>🎯</span>
                        <span className={styles['infoLabel']}>Günlük Hedef</span>
                        <span className={styles['infoValue']}>2000 kcal</span>
                    </div>
                    <div className={styles['infoItem']}>
                        <span className={styles['infoIcon']}>📊</span>
                        <span className={styles['infoLabel']}>Bu Hafta Ort.</span>
                        <span className={styles['infoValue']}>— kcal</span>
                    </div>
                    <div className={styles['infoItem']}>
                        <span className={styles['infoIcon']}>🗓️</span>
                        <span className={styles['infoLabel']}>Kayıt Günü</span>
                        <span className={styles['infoValue']}>1. gün</span>
                    </div>
                    <div className={styles['infoItem']}>
                        <span className={styles['infoIcon']}>🌐</span>
                        <span className={styles['infoLabel']}>Dil</span>
                        <span className={styles['infoValue']}>Türkçe</span>
                    </div>
                </div>

                <p className={styles['version']}>Voice to Diet v1.0.0</p>
            </div>
        </PageContainer>
    );
}
