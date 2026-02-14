import { useState, useRef, useCallback } from 'react';
import type { RecordingState } from '@/types';

interface UseVoiceRecorderReturn {
    state: RecordingState;
    audioBlob: Blob | null;
    duration: number;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    reset: () => void;
    error: string | null;
}

/**
 * MediaRecorder API ile ses kaydı yapan custom hook.
 * Otomatik zaman damgası ve hata yönetimi içerir.
 */
export function useVoiceRecorder(): UseVoiceRecorderReturn {
    const [state, setState] = useState<RecordingState>('idle');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    const cleanup = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        }
        mediaRecorderRef.current = null;
        chunksRef.current = [];
    }, []);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setAudioBlob(null);
            setDuration(0);
            chunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                setState('done');
                cleanup();
            };

            mediaRecorder.onerror = () => {
                setError('Ses kaydı sırasında bir hata oluştu.');
                setState('error');
                cleanup();
            };

            mediaRecorder.start(250); // Collect data every 250ms
            startTimeRef.current = Date.now();
            setState('recording');

            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 500);
        } catch (err) {
            const message =
                err instanceof DOMException && err.name === 'NotAllowedError'
                    ? 'Mikrofon izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.'
                    : 'Mikrofon erişimi sağlanamadı.';
            setError(message);
            setState('error');
        }
    }, [cleanup]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setState('processing');
        }
    }, []);

    const reset = useCallback(() => {
        cleanup();
        setState('idle');
        setAudioBlob(null);
        setDuration(0);
        setError(null);
    }, [cleanup]);

    return {
        state,
        audioBlob,
        duration,
        startRecording,
        stopRecording,
        reset,
        error,
    };
}
