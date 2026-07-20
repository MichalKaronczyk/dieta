# Dieta — Redukcja 2400 kcal

Prywatna aplikacja webowa (PWA) do kontroli planu żywieniowego i treningowego.
Działa offline, dane zapisują się lokalnie w przeglądarce telefonu.

## Funkcje
- **Dziś** — posiłki dnia, odhaczanie, pierścień kalorii, gest przesunięcia między dniami
- **Tydzień** — cały plan 7 dni + aktywność fizyczna
- **Zakupy** — lista zakupów z odhaczaniem, pogrupowana po kategoriach
- **Postęp** — średnie kalorie, seria dni, wykres 7 dni, zapis wagi
- Edycja i dodawanie własnych dań, notatki „co zjadłem zamiast"
- Eksport / import danych do pliku JSON (kopia zapasowa)

## Instalacja na iPhone
Otwórz stronę w Safari → **Udostępnij** → **Do ekranu początkowego**.

## Rozwój
Czysty HTML/CSS/JS, bez builda. Domyślny plan siedzi w `data.js`.
Po zmianie plików podbij `V` w `sw.js`, żeby telefony pobrały nową wersję.
