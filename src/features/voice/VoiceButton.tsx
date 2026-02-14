import type { RecordingState } from '@/types';
import styles from './VoiceButton.module.css';

interface VoiceButtonProps {
    state: RecordingState;
    duration: number;
    error: string | null;
    onStart: () => void;
    onStop: () => void;
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getButtonConfig(state: RecordingState) {
    switch (state) {
        case 'idle':
            return { icon: '🎙️', style: styles['idle'], label: 'Kayda başla' };
        case 'recording':
            return { icon: '⏹️', style: styles['recording'], label: 'Kaydı durdur' };
        case 'processing':
            return { icon: '', style: styles['processing'], label: 'İşleniyor...' };
        case 'done':
            return { icon: '🎙️', style: styles['idle'], label: 'Yeni kayıt' };
        case 'error':
            return { icon: '🎙️', style: styles['idle'], label: 'Tekrar dene' };
    }
}

export function VoiceButton({ state, duration, error, onStart, onStop }: VoiceButtonProps) {
    const config = getButtonConfig(state);

    const handleClick = () => {
        if (state === 'recording') {
            onStop();
        } else if (state !== 'processing') {
            onStart();
        }
    };

    return (
        <div className={styles['wrapper']}>
            <button
                className={`${styles['recordButton']} ${config.style}`}
                onClick={handleClick}
                disabled={state === 'processing'}
                aria-label={config.label}
            >
                {state === 'processing' ? (
                    <div className={styles['spinner']} />
                ) : (
                    <span className={styles['icon']}>{config.icon}</span>
                )}
            </button>

            {state === 'recording' && (
                <span className={styles['duration']}>{formatDuration(duration)}</span>
            )}

            {state === 'idle' && (
                <p className={styles['hint']}>
                    Butona dokunarak ne yediğinizi söyleyin
                </p>
            )}

            {error && <p className={styles['error']}>{error}</p>}
        </div>
    );
}
