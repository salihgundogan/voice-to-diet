import type { FoodAnalysis } from '@/types';

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_RETRIES = 3;

const SYSTEM_PROMPT = `Sen bir beslenme uzmanısın. Kullanıcının sesli kaydını analiz ederek yediği YİYECEKLERİ tespit et.

ÖNEMLİ KURALLAR:
1. Kullanıcı birden fazla yiyecek söylerse, HER BİRİ İÇİN AYRI bir JSON objesi oluştur.
2. Yanıtını HER ZAMAN bir JSON array olarak ver, tek yiyecek olsa bile.
3. Başka bir şey yazma, SADECE JSON array döndür.

Format:
[
  {
    "food_name": "Yiyeceğin Türkçe adı",
    "portion": "Porsiyon miktarı (örn: 1 adet, 200g, 1 bardak)",
    "calories": tahmini_kalori_sayısı,
    "protein": protein_gram,
    "carbs": karbonhidrat_gram,
    "fat": yağ_gram,
    "meal_type": "breakfast|lunch|dinner|snack"
  }
]

Örnek: Kullanıcı "domates salatalık ve biber yedim" derse, 3 AYRI obje döndür:
[
  {"food_name": "Domates", "portion": "1 adet", "calories": 22, "protein": 1, "carbs": 5, "fat": 0, "meal_type": "snack"},
  {"food_name": "Salatalık", "portion": "1 adet", "calories": 15, "protein": 1, "carbs": 3, "fat": 0, "meal_type": "snack"},
  {"food_name": "Biber", "portion": "1 adet", "calories": 20, "protein": 1, "carbs": 4, "fat": 0, "meal_type": "snack"}
]

Öğün tipini saate göre tahmin et:
- 06:00-10:00 → breakfast
- 11:00-14:00 → lunch  
- 17:00-21:00 → dinner
- Diğer saatler → snack

Kalori ve makro değerlerini gerçekçi tut.`;

/**
 * Ses kaydını Gemini API'ye göndererek besin analizi yapar.
 */
export async function analyzeVoiceNote(audioBlob: Blob): Promise<FoodAnalysis[]> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('Gemini API anahtarı bulunamadı. Lütfen .env dosyanızı kontrol edin.');
    }

    const base64Audio = await blobToBase64(audioBlob);
    const mimeType = audioBlob.type || 'audio/webm';

    const currentHour = new Date().getHours();
    const timeContext = `Şu anki saat: ${currentHour}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const body = JSON.stringify({
        contents: [
            {
                parts: [
                    { text: `${SYSTEM_PROMPT}\n\n${timeContext}` },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Audio,
                        },
                    },
                ],
            },
        ],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
        },
    });

    const response = await fetchWithRetry(url, body);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('Gemini API boş yanıt döndürdü.');
    }

    return parseGeminiResponse(text);
}

/**
 * Rate limit (429) hatalarında otomatik yeniden deneyen fetch wrapper.
 */
async function fetchWithRetry(url: string, body: string): Promise<Response> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        if (response.ok) {
            return response;
        }

        if (response.status === 429) {
            const errorData = await response.json().catch(() => ({}));
            const retryInfo = (errorData as Record<string, unknown>)?.error as Record<string, unknown> | undefined;
            const retryDetails = retryInfo?.details as Array<Record<string, unknown>> | undefined;
            const retryDelay = retryDetails?.find(
                (d) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
            );
            const waitSecs = retryDelay
                ? parseInt(String(retryDelay['retryDelay']).replace('s', ''), 10) || 20
                : (attempt + 1) * 15;

            if (attempt < MAX_RETRIES - 1) {
                console.warn(
                    `⏳ Gemini API kota limiti — ${waitSecs} saniye bekleyip tekrar deneniyor... (${attempt + 1}/${MAX_RETRIES})`
                );
                await sleep(waitSecs * 1000);
                continue;
            }

            throw new Error(
                `🚫 Gemini API kota limiti aşıldı. Ücretsiz plan günlük limitiniz dolmuş olabilir.\n\n` +
                `Çözüm önerileri:\n` +
                `• Birkaç dakika bekleyip tekrar deneyin\n` +
                `• .env dosyasında VITE_GEMINI_MODEL değerini değiştirin (örn: gemini-1.5-flash)\n` +
                `• Google AI Studio'dan ücretli plana geçin`
            );
        }

        // Diğer hatalar için direkt fırlat
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `Gemini API hatası: ${response.status} — ${JSON.stringify(errorData)}`
        );
    }

    throw new Error('Gemini API isteği başarısız oldu.');
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Blob'u base64 string'e çevirir.
 */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove data URL prefix (e.g., "data:audio/webm;base64,")
            const base64 = result.split(',')[1];
            if (base64) {
                resolve(base64);
            } else {
                reject(new Error('Base64 dönüşümü başarısız.'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Gemini yanıtını parse eder.
 */
function parseGeminiResponse(text: string): FoodAnalysis[] {
    // Clean markdown code fences if present
    const cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

    try {
        const parsed: unknown = JSON.parse(cleaned);

        if (Array.isArray(parsed)) {
            return parsed.map(validateFoodAnalysis);
        }

        return [validateFoodAnalysis(parsed)];
    } catch {
        throw new Error(`Gemini yanıtı parse edilemedi: ${cleaned.substring(0, 200)}`);
    }
}

/**
 * Tek bir FoodAnalysis objesini doğrular.
 */
function validateFoodAnalysis(data: unknown): FoodAnalysis {
    const obj = data as Record<string, unknown>;

    return {
        food_name: String(obj['food_name'] || 'Bilinmeyen Yiyecek'),
        portion: String(obj['portion'] || '1 porsiyon'),
        calories: Number(obj['calories']) || 0,
        protein: Number(obj['protein']) || 0,
        carbs: Number(obj['carbs']) || 0,
        fat: Number(obj['fat']) || 0,
        meal_type: validateMealType(obj['meal_type']),
    };
}

function validateMealType(value: unknown): FoodAnalysis['meal_type'] {
    const valid = ['breakfast', 'lunch', 'dinner', 'snack'];
    return valid.includes(String(value))
        ? (String(value) as FoodAnalysis['meal_type'])
        : 'snack';
}
