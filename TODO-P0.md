# P0 - Yapilacaklar (Devam Eden)

## 1. Git Init & Ilk Commit
- [x] git init yapildi
- [x] .gitignore guncellendi
- [ ] Git user config ayarlanacak (isim + email gerekli)
- [ ] Ilk commit atilacak

## 2. API Auth Middleware (Guvenlik)
- [x] `src/lib/auth-middleware.ts` olusturuldu
  - `verifyAuth()` - Firebase ID token dogrulama
  - `withAuth()` - Auth zorunlu wrapper
  - `withPremium()` - Auth + Premium zorunlu wrapper
- [x] Premium route'lar guncellendi:
  - `api/palm` → withPremium
  - `api/horary` → withPremium
  - `api/cosmic` → withPremium
- [x] Frontend `callApi` auth token gonderiyor (Authorization header)
- [x] TypeScript hatasiz (tsc --noEmit basarili)

## 3. Server-Side Premium Verification
- [x] `isPremiumUser()` zaten `src/lib/premium.ts` icinde vardi
- [x] `withPremium` middleware bunu kullaniyor
- [x] 3 premium route'a uygulandi (palm, horary, cosmic)

## Notlar
- Free AI route'lar (burc, gunluk, uyum, rising, numerology, dream) auth gerektirmiyor
  - Rate limiting (Upstash Redis) ile korunuyor
  - Kullanicilar giris yapmadan deneyebilmeli
- Data route'lar (ephemeris, gezegenler) auth gerektirmiyor (pure computation)
