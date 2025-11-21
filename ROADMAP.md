# 🗺️ vCardAI Roadmap

Diese Datei trackt den aktuellen Entwicklungsstand und geplante Features.

## ✅ Fertiggestellt (Done)

### Core
- [x] Projekt-Setup (React, Vite, TS, Tailwind)
- [x] Offline-First Architektur
- [x] PWA Support (Manifest, Icons, Service Worker Vorbereitung)

### Editor & Parser
- [x] Regex-Parser für Text-Input (Immpressum, Signaturen)
- [x] Unterstützung für DACH-Adressformate & Städte-Datenbank
- [x] vCard 3.0 Generator & Parser
- [x] Editor-Tabs: Text, Code, Enrich
- [x] Drag & Drop für Bilder

### AI Integration
- [x] Google Gemini Anbindung (`gemini-3-pro-preview`)
- [x] Intelligentes Prompting (Context-Aware, Noise Removal)
- [x] Vision-Support (Visitenkarten-Scan)
- [x] Update-Modus ("Füge LinkedIn hinzu...")

### Workflow & UX
- [x] Scan-Modal mit "Scan & Next" Workflow
- [x] Hintergrund-Warteschlange (Queue) für Scans
- [x] Visueller Queue-Indikator
- [x] Smart Merge (Dubletten-Erkennung via Name & Telefon)
- [x] Verlauf (History) mit Originalbildern
- [x] Dark Mode / Light Mode
- [x] Mehrsprachigkeit (DE / EN)

### Export
- [x] vCard Download (.vcf)
- [x] CSV Export (Excel-optimiert)
- [x] Bilder-Export (ZIP)
- [x] QR-Code Generierung

### Rechtliches
- [x] Impressum (DDG konform)
- [x] Datenschutz (Google Cloud & AI spezifisch)

---

## 🚧 In Arbeit / Verbesserungswürdig

- [ ] **Performance:** Optimierung der `cities.ts` (Lazy Loading), da sie das Bundle groß macht.
- [ ] **Offline-OCR:** Integration von Tesseract.js als Fallback, wenn kein Internet/API-Key vorhanden ist.

## 🔮 Zukunftsvisionen (Backlog)

- [ ] **WebDAV Sync:** Direkte Synchronisation mit CardDAV Servern (Nextcloud, iCloud).
- [ ] **CRM Integration:** Direkter Export zu HubSpot / Salesforce via API.
- [ ] **Team-Modus:** Teilen von gescannten Kontakten in einem Team (verschlüsselt).
- [ ] **KI-Recherche:** Echte Websuche ("Grounding") zur automatischen Vervollständigung von fehlenden Daten.