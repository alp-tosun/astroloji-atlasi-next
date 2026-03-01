# Astroloji Atlasi - Kapsamli Iyilestirme Plani

## Tarama Ozeti
4 paralel ajan tum projeyi taradi: ~167 kaynak dosya, 19 API route, 40+ component, 9 test dosyasi.

---

## KRITIK GUVENLIK (P0) - Hemen Yapilacak

### 1. Firestore Premium Bypass (KRITIK)
**Sorun:** `firestore.rules` kullanicinin kendi dokumani uzerinde tam yazma izni veriyor. Kullanici client SDK ile `premium: true` yazarak premium erisim elde edebilir.
**Cozum:** Firestore rules'da `premium`, `isPremium`, `subscription` alanlarini yazma disinda tut.

### 2. Premium Expiration Kontrolu Eksik
**Sorun:** `isPremiumUser()` fonksiyonu `premiumExpiresAt` kontrolu yapmiyor. Suresi dolmus premium kullanicilar hala erisebiliyor.
**Cozum:** `premium.ts`'de expiration kontrolu ekle.

### 3. Rate Limiting Sessizce Devre Disi
**Sorun:** Redis yoksa rate limiting tamamen kapaniyor, hicbir uyari yok.
**Cozum:** Redis yokken console.warn bas + in-memory fallback rate limiter ekle.

### 4. Vision/Palm Prompt Injection
**Sorun:** `chatWithVision`/`chatWithVisionStream` fonksiyonlari system prompt almiyorlar. Anti-injection korunmasi yok.
**Cozum:** System prompt parametresi ekle.

### 5. RevenueCat Webhook Guvenlik
**Sorun:** Sadece static Bearer token kontrolu var. Signature verification, replay protection, idempotency yok.
**Cozum:** Webhook imza dogrulama + event timestamp kontrolu ekle.

---

## YUKSEK ONCELIK (P1) - Bug Fix & Altyapi

### 6. Duplicate Auth Middleware Temizligi
**Sorun:** `auth-middleware.ts` ve `api-middleware.ts` iki ayri auth implementasyonu. `auth-middleware.ts` hicbir yerde kullanilmiyor.
**Cozum:** `auth-middleware.ts`'i sil veya birini referans olarak birak.

### 7. /api/daily-content Zod Validasyonu Eksik
**Sorun:** Diger tum AI endpoint'leri Zod kullaniyor ama daily-content manual validasyon yapiyor.
**Cozum:** Zod schema ekle.

### 8. /api/check-premium Rate Limiting Eksik
**Sorun:** Sinirsiz cagrilabilir, Firestore maliyet artisi.
**Cozum:** data tier rate limit ekle.

### 9. /api/gezegenler Cache Calismasi
**Sorun:** `{ next: { revalidate: 3600 } }` Route Handler'da calismaz.
**Cozum:** In-memory cache ile degistir.

### 10. Merkur Retro Faz Tespiti Hatasi
**Sorun:** `mercury-retrograde.ts`'de stationary-direct ve stationary-retrograde mantigi ters.
**Cozum:** Kosullari duzelt.

### 11. Aspect Applying Hesaplama Hatasi
**Sorun:** `aspects.ts`'de `applying` sadece `p1.speed > 0` kontrolu yapiyor, dogru degil.
**Cozum:** Hizli gezegenin exact aspect acisina yaklasip yaklasmadigini kontrol et.

### 12. useToolApi AbortController Eksik
**Sorun:** Tool degistirildiginde eski stream arka planda calismaya devam ediyor.
**Cozum:** AbortController ekle, tool degisince iptal et.

### 13. Firestore Rules: fcmTokens & Analysis Delete
**Sorun:** Client-side `deleteAnalysis` Firestore rules tarafindan engelleniyor. `fcmTokens` subcollection kuralda yok.
**Cozum:** Rules guncelle.

### 14. Modal Focus Trap
**Sorun:** Modal ve dialog'larda focus kaciyor, Tab ile arkadaki sayfaya geciliyor.
**Cozum:** Focus trap implementasyonu ekle.

### 15. Form Label-Input Baglantisi
**Sorun:** Input, Select, TextArea'da `htmlFor`/`id` baglantisi yok.
**Cozum:** `useId` ile baglanti kur.

---

## ORTA ONCELIK (P2) - Kalite & Performans

### 16. i18n Hardcoded String'ler
**Sorun:** Onlarca dosyada Turkce string hardcoded: gezegen adlari, burc adlari, gun adlari, hata mesajlari.
**Dosyalar:** PlanetBar, LivePlanetBand, NatalChartWheel, ElementBalance, KozmikPanel, RitualPanel, LunarCalendarPanel, PlanetaryHoursPanel, TransitCalendarPanel, DashboardCard, TarotPanel, GecmisPanel, ConfirmDialog, ErrorBoundary, StoryCard
**Cozum:** Tum string'leri tr.json/en.json'a tasi.

### 17. DailyContentUseCase Singleton Race Condition
**Sorun:** `this.prefix` instance degiskeni concurrent request'lerde karisabilir.
**Cozum:** prefix'i request-scoped yap.

### 18. Cache Repository TTL Eksik
**Sorun:** Firestore cache entries sonsuza kadar kalir.
**Cozum:** TTL alani ekle, temizlik mantigi kur.

### 19. Geocoding Cache Eksik
**Sorun:** Her seferinde Nominatim API'ye istek atiliyor.
**Cozum:** In-memory LRU cache ekle.

### 20. Planetary Hours Istanbul Default
**Sorun:** Kullanicinin konumunu almadan Istanbul koordinatlari kullaniliyor.
**Cozum:** Kullanici koordinatlarini profil'den al.

### 21. Streak Timezone Sorunu
**Sorun:** UTC tarihi kullaniliyor, Turkiye'de gece yarisi yanlis gun hesabi.
**Cozum:** UTC+3 offset uygula.

### 22. Page.tsx [locale] Param Kullanilmiyor
**Sorun:** `[locale]` route param var ama tamamen ignore ediliyor, i18n client-side JSON import.
**Not:** Buyuk refactoring, sonraya birakilabilir.

### 23. Missing Keyframe Animations
**Sorun:** Modal.tsx `fadeOut`, `slideDownOut`, `slideUp` animasyonlarini kullaniyor ama globals.css'de tanimli degil.
**Cozum:** Eksik keyframe'leri ekle.

### 24. CSP unsafe-eval Kaldirilmasi
**Sorun:** `next.config.ts`'de `unsafe-eval` var, XSS riski.
**Cozum:** Production'da kaldir, nonce-based inline script kullan.

---

## DUSUK ONCELIK (P3) - Nice to Have

### 25. Dead Code Temizligi
- `Card.tsx` hicbir yerde import edilmiyor
- `types/api.ts` duplicate `apiSuccess`/`apiError`
- `DashboardCard.tsx` duplicate `SIGNS`/`SIGNS_TR` dizileri
- `auth-middleware.ts` kullanilmiyor
- Dockerfile'da kullanilmayan `deps` stage

### 26. Test Coverage
- Suan: 35 test, ~%5 coverage
- API route testleri: 0/19
- Component testleri: 0/40+
- Schema validation testleri yok

### 27. CI/CD Iyilestirmeleri
- Coverage threshold eklenmeli
- Prettier enforcement eklenmeli
- npm audit eklenmeli
- E2E test framework (Playwright)

### 28. EnergyBar Accessibility
- `role="progressbar"`, `aria-valuenow` eksik

### 29. ProfileForm Validasyon
- Gelecek tarih kontrolu yok
- Dogum saati 1 saatlik aralik yerine tam saat girilebilmeli

### 30. SpaceBackground Optimizasyon
- Tab backgrounded iken animasyonu durdur
- Star sayisini ekran boyutuna gore ayarla
