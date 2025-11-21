# vCards - Intelligenter Visitenkarten-Scanner & Editor

**vCards** ist eine moderne Web-Anwendung (PWA), die physische Visitenkarten und digitale Signaturen blitzschnell in perfekt formatierte Kontakte umwandelt. Sie kombiniert die Geschwindigkeit lokaler Regex-Algorithmen mit der Intelligenz von Google Gemini AI (GPT-4 Level), um maximale Datenqualität zu gewährleisten.

Die App arbeitet nach dem **"Privacy First"** Prinzip: Daten werden standardmäßig nur im Browser gespeichert. KI-Funktionen sind optional und erfordern eine aktive Einwilligung.

---

## 🚀 Hauptfeatures

*   **Hybrider Parser:**
    *   *Offline:* Blitzschnelle Erkennung von Signaturen durch komplexe Regex-Muster (optimiert für DACH-Adressen).
    *   *Online (KI):* Google Gemini 3 Pro für "forensische" Datenextraktion, Korrektur und Anreicherung.
*   **Smart Scan:** Visitenkarten einfach fotografieren (Vorder- & Rückseite). Die KI extrahiert alle Daten.
*   **Stapel-Verarbeitung (Batch Queue):** Mehrere Karten nacheinander scannen – die Verarbeitung läuft asynchron im Hintergrund.
*   **Smart Merge:** Erkennt Dubletten (Name oder Telefonnummer) und führt neue Daten mit bestehenden Einträgen zusammen (Enrichment), statt sie zu überschreiben.
*   **Social Media Intelligence:** Automatische Suche nach LinkedIn/Xing Profilen und direkte Integration.
*   **Daten-Anreicherung:** "Enrich"-Modus, um bestehende Kontakte per KI-Befehl zu aktualisieren (z.B. "Füge private Nummer 0170... hinzu").
*   **Vollständiger Verlauf:** Alle Scans werden lokal gespeichert, inkl. Originalbildern.
*   **Export:** vCard (.vcf), CSV (Excel-kompatibel) und Bilder-Download (ZIP).
*   **Cross-Platform:** Funktioniert als installierbare PWA auf Desktop, iOS und Android.

---

## 🛠️ Technologie-Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **AI Engine:** Google Gemini API (`gemini-3-pro-preview`) via `@google/genai` SDK
*   **Utilities:** `jszip` (Export), `qrcode` (Sharing), `lucide-react` (Icons)
*   **Hosting:** GitHub Pages (Static Site)

---

## 📦 Installation & Entwicklung

### Voraussetzungen
*   Node.js (v18+)
*   Ein Google AI Studio API Key (kostenlos erhältlich)

### Setup
1.  Repository klonen:
    ```bash
    git clone https://github.com/DEIN_USER/vcard.git
    cd vcard
    ```
2.  Abhängigkeiten installieren:
    ```bash
    npm install
    ```
3.  Entwicklungsserver starten:
    ```bash
    npm run dev
    ```
4.  App öffnen: `http://localhost:5173`

### Build für Produktion
```bash
npm run build
```
Der Output landet im `dist/` Ordner und kann auf jedem statischen Webserver gehostet werden.

---

## 🔒 Datenschutz & Sicherheit

*   **Kein Backend:** Die App hat keinen eigenen Server. Alle Logik läuft im Browser des Nutzers.
*   **Bring Your Own Key (BYOK):** Nutzer verwenden ihren eigenen Google API Key. Es gibt keinen Mittelsmann.
*   **Lokaler Speicher:** Kontaktdaten und Bilder liegen im `localStorage` des Browsers.
*   **Transparenz:** Daten verlassen den Browser nur bei aktiver Nutzung der KI-Features (Upload zu Google Gemini).

---

## 📝 Lizenz

MIT License - Alexander Mut
