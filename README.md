# 🎯 Habit Tracker - Aplikacja do Śledzenia Nawyków

Nowoczesna aplikacja webowa do śledzenia i budowania codziennych nawyków, zbudowana jako Progressive Web App (PWA) z obsługą powiadomień w tle.

## 📱 Demo i Funkcje

### Główne funkcjonalności
- ✅ **Śledzenie nawyków** - Dodawanie, edytowanie i usuwanie nawyków
- 📅 **Elastyczne planowanie** - Wybór konkretnych dni tygodnia dla każdego nawyku
- 📊 **Statusy wykonania** - Ukończone, częściowe, nieudane, nieobowiązujące
- 🏆 **Statystyki** - Licznik sukcesów i najdłuższa seria
- 🎉 **Efekty wizualne** - Konfetti i dźwięki przy osiągnięciach
- 🔔 **Powiadomienia w tle** - Przypomnienia działające nawet gdy aplikacja jest zamknięta
- 🌙 **Tryb ciemny/jasny** - Przełączanie motywów
- 🌍 **Wielojęzyczność** - Polski i angielski
- 📱 **PWA** - Instalacja jako aplikacja mobilna
- 💾 **Lokalne przechowywanie** - Wszystkie dane zapisywane lokalnie

## 🚀 Technologie

### Frontend
- **React 18** - Biblioteka UI
- **TypeScript** - Typowanie statyczne
- **Vite** - Narzędzie budowania
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ikony

### Funkcjonalności zaawansowane
- **i18next** - Internacjonalizacja
- **Service Workers** - Powiadomienia w tle
- **PWA Manifest** - Instalacja aplikacji
- **Local Storage** - Przechowywanie danych

### Narzędzia deweloperskie
- **ESLint** - Linting kodu
- **PostCSS** - Przetwarzanie CSS
- **TypeScript** - Kompilacja i typowanie

## 📁 Struktura projektu

```
project/
├── public/                 # Pliki statyczne
│   ├── manifest.json      # Manifest PWA
│   ├── sw.js             # Service Worker
│   └── favicon.svg       # Ikona aplikacji
├── src/
│   ├── components/        # Komponenty React
│   │   ├── AddHabitForm.tsx
│   │   ├── HabitItem.tsx
│   │   ├── HabitList.tsx
│   │   ├── NotificationSettings.tsx
│   │   └── ...
│   ├── contexts/          # Konteksty React
│   │   └── ThemeContext.tsx
│   ├── i18n/             # Tłumaczenia
│   │   ├── en/           # Angielski
│   │   └── pl/           # Polski
│   ├── types/            # Definicje TypeScript
│   │   └── habit.ts
│   ├── utils/            # Funkcje pomocnicze
│   │   ├── notifications.ts
│   │   ├── storage.ts
│   │   ├── habitUtils.ts
│   │   └── celebrationEffects.ts
│   ├── App.tsx           # Główny komponent
│   └── main.tsx          # Punkt wejścia
├── package.json          # Zależności
└── vite.config.ts       # Konfiguracja Vite
```

## 🛠️ Instalacja i uruchomienie

### Wymagania
- Node.js 16+
- npm lub yarn

### Kroki instalacji

1. **Klonowanie repozytorium**
```bash
git clone <repository-url>
cd project
```

2. **Instalacja zależności**
```bash
npm install
```

3. **Uruchomienie w trybie deweloperskim**
```bash
npm run dev
```

4. **Budowanie do produkcji**
```bash
npm run build
```

5. **Podgląd wersji produkcyjnej**
```bash
npm run preview
```

## 📱 Instalacja jako PWA

Aplikacja może być zainstalowana jako Progressive Web App:

### Desktop
- **Chrome/Edge**: Kliknij ikonę "Zainstaluj" w pasku adresu
- **Firefox**: Menu → "Zainstaluj tę stronę"

### Mobile
- **Android**: Chrome → Menu → "Dodaj do ekranu głównego"
- **iOS**: Safari → Udostępnij → "Dodaj do ekranu głównego"

## 🔔 System powiadomień

### Funkcje powiadomień
- **Powiadomienia w tle** - Działają nawet gdy aplikacja jest zamknięta
- **Konfigurowalne godziny** - Poranne i wieczorne przypomnienia
- **Automatyczne planowanie** - Na 24h do przodu
- **Interaktywne powiadomienia** - Przyciski akcji

### Wymagania
- Zgoda na powiadomienia w przeglądarce
- Obsługa Service Workers
- HTTPS (lub localhost w trybie dev)

## 🎨 Personalizacja

### Motywy
- **Jasny** - Gradient niebieski
- **Ciemny** - Gradient szary

### Języki
- **Polski** (domyślny)
- **Angielski**

### Nawyki
- **Elastyczne dni** - Wybór konkretnych dni tygodnia
- **Nawyki awaryjne** - Łatwiejsza wersja nawyku
- **Statusy** - 4 poziomy wykonania

## 📊 Funkcje śledzenia

### Statusy nawyków
- 🟢 **Ukończone** - Nawyk w pełni wykonany
- 🟡 **Częściowe** - Nawyk częściowo wykonany
- 🔴 **Nieudane** - Nawyk niewykonany
- ⚪ **Nieobowiązujące** - Dzień wolny od nawyku

### Statystyki
- **Licznik sukcesów** - Całkowita liczba ukończonych dni
- **Najdłuższa seria** - Rekordowa seria kolejnych sukcesów
- **Postęp dzienny** - Procent ukończonych nawyków

## 🎉 Efekty motywacyjne

### Celebracje
- **Konfetti** - Przy ukończeniu nawyku
- **Dźwięki** - Efekty audio sukcesu
- **Animacje** - Płynne przejścia i efekty
- **Komunikaty** - Motywacyjne wiadomości

### Gamifikacja
- **Serie** - Śledzenie kolejnych sukcesów
- **Rekordy** - Najlepsze osiągnięcia
- **Postęp** - Wizualizacja rozwoju

## 🔧 Konfiguracja

### Zmienne środowiskowe
Aplikacja nie wymaga zmiennych środowiskowych - wszystkie dane przechowywane lokalnie.

### Dostosowanie
- Edytuj pliki w `src/i18n/` dla nowych tłumaczeń
- Modyfikuj `tailwind.config.js` dla zmian w stylach
- Dostosuj `public/manifest.json` dla ustawień PWA

## 🚀 Deployment

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Vercel
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### GitHub Pages
```bash
npm run build
# Push dist/ folder to gh-pages branch
```

## 🤝 Rozwój

### Dodawanie nowych funkcji
1. Utwórz komponent w `src/components/`
2. Dodaj typy w `src/types/`
3. Zaimplementuj logikę w `src/utils/`
4. Dodaj tłumaczenia w `src/i18n/`

### Testowanie
```bash
npm run lint  # Sprawdzenie kodu
```

## 📄 Licencja

Ten projekt jest dostępny na licencji MIT.

## 🐛 Zgłaszanie błędów

Jeśli znajdziesz błąd lub masz sugestię:
1. Sprawdź istniejące issues
2. Utwórz nowy issue z opisem problemu
3. Dołącz kroki do reprodukcji

## 🎯 Roadmapa

### Planowane funkcje
- [ ] Synchronizacja w chmurze
- [ ] Eksport/import danych
- [ ] Zaawansowane statystyki
- [ ] Społeczność i wyzwania
- [ ] Integracje z innymi aplikacjami
- [ ] Aplikacja mobilna natywna

---

**Zbudowano z ❤️ używając React, TypeScript i Vite**