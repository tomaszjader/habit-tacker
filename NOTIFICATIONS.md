# Powiadomienia w tle - Dokumentacja

## Przegląd

Aplikacja Habit Tracker została rozszerzona o funkcjonalność powiadomień w tle, które działają nawet gdy aplikacja nie jest uruchomiona. System wykorzystuje Service Workers i Progressive Web App (PWA) technologie.

## Jak to działa

### 1. Service Worker (`/public/sw.js`)
- Rejestruje się automatycznie przy starcie aplikacji
- Działa w tle niezależnie od głównej aplikacji
- Obsługuje powiadomienia nawet gdy aplikacja jest zamknięta
- Zarządza harmonogramem powiadomień

### 2. Progressive Web App (PWA)
- Manifest (`/public/manifest.json`) definiuje aplikację jako PWA
- Umożliwia instalację aplikacji na urządzeniu
- Zapewnia lepszą integrację z systemem operacyjnym

### 3. Ulepszone powiadomienia
- **Dwupoziomowy system**: Główna aplikacja + Service Worker
- **Automatyczne planowanie**: Powiadomienia planowane na 24h do przodu
- **Interaktywne powiadomienia**: Przyciski "Otwórz aplikację" i "Zamknij"
- **Inteligentne fokusowanie**: Kliknięcie powiadomienia otwiera/fokusuje aplikację

## Funkcje

### Powiadomienia w tle
- ✅ Działają gdy aplikacja jest zamknięta
- ✅ Automatyczne planowanie na kolejne dni
- ✅ Poranne i wieczorne przypomnienia
- ✅ Konfigurowalne godziny
- ✅ Emoji w powiadomieniach (🌅/🌙)

### Zarządzanie
- ✅ Automatyczna rejestracja Service Worker
- ✅ Synchronizacja ustawień między aplikacją a Service Worker
- ✅ Fallback dla przeglądarek bez obsługi Service Workers
- ✅ Obsługa kliknięć w powiadomienia

## Wymagania techniczne

### Obsługiwane przeglądarki
- Chrome/Edge 40+
- Firefox 44+
- Safari 11.1+
- Opera 27+

### Wymagane uprawnienia
- Powiadomienia (Notifications API)
- Service Workers
- PWA manifest

## Instalacja jako PWA

Użytkownicy mogą zainstalować aplikację jako PWA:

1. **Chrome/Edge**: Kliknij ikonę "Zainstaluj" w pasku adresu
2. **Firefox**: Menu → "Zainstaluj tę stronę"
3. **Safari**: Udostępnij → "Dodaj do ekranu głównego"

## Ograniczenia

### Service Workers
- Timeout dla `setTimeout` ograniczony do ~5 minut w niektórych przeglądarkach
- Powiadomienia planowane maksymalnie na 24h do przodu
- Wymagane ponowne planowanie przy każdym otwarciu aplikacji

### Powiadomienia systemowe
- Wymagają zgody użytkownika
- Mogą być blokowane przez ustawienia systemu
- Różne zachowanie na różnych platformach

## Rozwiązywanie problemów

### Powiadomienia nie działają
1. Sprawdź uprawnienia w przeglądarce
2. Upewnij się, że Service Worker jest zarejestrowany (DevTools → Application → Service Workers)
3. Sprawdź ustawienia powiadomień w systemie operacyjnym

### Service Worker nie rejestruje się
1. Sprawdź konsolę przeglądarki pod kątem błędów
2. Upewnij się, że aplikacja działa przez HTTPS (lub localhost)
3. Sprawdź czy plik `/sw.js` jest dostępny

### Powiadomienia nie pojawiają się w tle
1. Sprawdź czy aplikacja jest zainstalowana jako PWA
2. Upewnij się, że powiadomienia są włączone w ustawieniach
3. Niektóre przeglądarki wymagają interakcji użytkownika przed pokazaniem powiadomień

## Przyszłe ulepszenia

### Planowane funkcje
- [ ] Web Push API dla powiadomień serwerowych
- [ ] Periodic Background Sync dla automatycznego odnawiania
- [ ] Offline synchronizacja danych
- [ ] Zaawansowane planowanie powiadomień
- [ ] Personalizowane treści powiadomień

### Optymalizacje
- [ ] Lepsze zarządzanie cyklem życia Service Worker
- [ ] Inteligentne planowanie na podstawie aktywności użytkownika
- [ ] Analityka skuteczności powiadomień

## Kod źródłowy

### Główne pliki
- `/src/utils/notifications.ts` - Główna logika powiadomień
- `/public/sw.js` - Service Worker
- `/public/manifest.json` - Manifest PWA
- `/src/main.tsx` - Rejestracja Service Worker

### Kluczowe funkcje
- `registerServiceWorker()` - Rejestracja Service Worker
- `scheduleNotifications()` - Planowanie powiadomień
- `showBackgroundNotification()` - Wyświetlanie powiadomień w tle