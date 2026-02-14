# 🥗 Voice to Diet — Kurulum Kılavuzu

Bu dökümanda projeyi sıfırdan çalıştırmak için gereken tüm adımlar yer almaktadır.

---

## 1. Ön Gereksinimler

- **Node.js** v18+ → [nodejs.org](https://nodejs.org)
- **npm** v9+ (Node.js ile birlikte gelir)
- **Supabase** hesabı → [supabase.com](https://supabase.com)
- **Google AI Studio** hesabı → [aistudio.google.com](https://aistudio.google.com)

---

## 2. Bağımlılıkları Yükleme

```bash
cd /home/salih/Belgeler/diyet
npm install
```

---

## 3. Environment Variables (.env)

Proje kök dizininde `.env` dosyası oluşturun:

```bash
touch .env
```

Aşağıdaki içeriği yapıştırın ve değerleri kendi anahtarlarınızla değiştirin:

```env
# Supabase
VITE_SUPABASE_URL=https://PROJE_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Google Gemini API
VITE_GEMINI_API_KEY=AIzaSy...
```

### Değişken Açıklamaları

| Değişken | Açıklama | Nereden Alınır? |
|----------|----------|-----------------|
| `VITE_SUPABASE_URL` | Supabase proje URL'si | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonim (public) anahtarı | Supabase Dashboard → Settings → API → `anon` `public` key |
| `VITE_GEMINI_API_KEY` | Google Gemini API anahtarı | [Google AI Studio](https://aistudio.google.com/apikey) → "Create API Key" |

---

## 4. Supabase Kurulumu

### 4.1 Yeni Proje Oluşturma

1. [supabase.com](https://supabase.com) adresine gidin
2. "New Project" tıklayın
3. Proje adı: `voice-to-diet` (veya istediğiniz isim)
4. Veritabanı şifresini belirleyin ve kaydedin
5. Region: Bölgenize en yakın sunucu (örn: `eu-central-1`)

### 4.2 Tabloları Oluşturma

Supabase Dashboard → **SQL Editor** → "New query" tıklayın ve aşağıdaki SQL kodunu yapıştırıp çalıştırın:

```sql
-- ═══════════════════════════════════════════════════
-- Voice to Diet — Veritabanı Şeması
-- ═══════════════════════════════════════════════════

-- UUID extension (genellikle varsayılan olarak etkindir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Yiyecek Kayıtları Tablosu ──
CREATE TABLE food_entries (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  food_name   TEXT NOT NULL,
  portion     TEXT NOT NULL DEFAULT '1 porsiyon',
  calories    INTEGER NOT NULL DEFAULT 0,
  protein     REAL NOT NULL DEFAULT 0,
  carbs       REAL NOT NULL DEFAULT 0,
  fat         REAL NOT NULL DEFAULT 0,
  meal_type   TEXT NOT NULL DEFAULT 'snack'
                CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── İndeksler ──
CREATE INDEX idx_food_entries_user_id ON food_entries (user_id);
CREATE INDEX idx_food_entries_recorded_at ON food_entries (recorded_at DESC);
CREATE INDEX idx_food_entries_user_date ON food_entries (user_id, recorded_at DESC);

-- ── Row Level Security (RLS) ──
-- MVP için RLS kapatılmış durumda. Üretim ortamında mutlaka etkinleştirin.
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

-- Tüm işlemlere izin veren geçici politika (demo amaçlı)
CREATE POLICY "Allow all operations for demo"
  ON food_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 4.3 API Anahtarlarını Alma

1. Supabase Dashboard → sol menüden **Settings** (⚙️)
2. **API** sekmesine tıklayın
3. **Project URL** → `.env` dosyasında `VITE_SUPABASE_URL` olarak yapıştırın
4. **Project API keys** → `anon` `public` anahtarını kopyalayın → `VITE_SUPABASE_ANON_KEY` olarak yapıştırın

---

## 5. Gemini API Anahtarı Alma

1. [Google AI Studio](https://aistudio.google.com/apikey) adresine gidin
2. Google hesabınızla giriş yapın
3. **"Create API Key"** butonuna tıklayın
4. Yeni bir proje oluşturun veya mevcut bir projeyi seçin
5. Oluşturulan API anahtarını kopyalayın
6. `.env` dosyasında `VITE_GEMINI_API_KEY` olarak yapıştırın

> ⚠️ **Not**: Gemini API ücretsiz kullanım kotası günlük sınırlıdır. Detaylar için [Google AI Studio fiyatlandırma sayfasını](https://ai.google.dev/pricing) inceleyin.

---

## 6. Geliştirme Sunucusunu Başlatma

```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` adresinden uygulamaya erişebilirsiniz.

---

## 7. Production Build

```bash
npm run build
npm run preview
```

`dist/` klasöründeki dosyalar herhangi bir statik hosting servisine (Netlify, Vercel, Firebase Hosting vb.) deploy edilebilir.

---

## 8. PWA Kurulumu

Uygulama PWA olarak yapılandırılmıştır. Production build sonrasında:

1. Tarayıcıda uygulamayı açın
2. Chrome'da adres çubuğundaki **"Yükle"** ikonuna tıklayın
3. Veya mobil cihazda **"Ana ekrana ekle"** seçeneğini kullanın

---

## Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| Mikrofon çalışmıyor | HTTPS veya `localhost` üzerinde olduğunuzdan emin olun |
| Gemini API hatası | API anahtarınızı ve kotanızı kontrol edin |
| Supabase bağlantı hatası | URL ve Anon Key'in doğru olduğunu teyit edin |
| PWA yüklenmiyor | Production build ile test edin (`npm run build && npm run preview`) |
