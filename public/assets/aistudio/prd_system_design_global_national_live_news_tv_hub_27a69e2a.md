# Product Requirement Document (PRD) & Technical Design Document
**Project Name:** OmniNews & Live TV Portal (Indonesia & Global)  
**Target Environment:** Google AI Studio Prototype / Full-Stack Web App  
**Document Version:** 1.0  
**Status:** Approved for Prototyping  

---

## 1. Executive Summary & Vision

### 1.1 Objective
Membangun platform agregator berita dan siaran TV *streaming* terpadu berskala nasional (Indonesia) dan global yang menyajikan konten *real-time*, kredibel, hemat *bandwidth*, dan patuh pada aspek legalitas hak cipta (*copyright compliance*).

### 1.2 Target Audience
* Warga Indonesia yang menginginkan portal satu pintu untuk memantau situasi terkini di tanah air dan luar negeri.
* Pengguna yang membutuhkan akses cepat ke siaran langsung TV berita (*breaking news*) tanpa instalasi aplikasi tambahan.
* Pembaca berita lintas wilayah yang membutuhkan kurasi berita multi-kategori (Politik, Ekonomi, Teknologi, Dunia).

### 1.3 Key Value Proposition
* **Legal & Ringan:** Memanfaatkan pemutar sematan resmi (YouTube Live Embed) sehingga bebas beban hosting video dan aman hak siar.
* **Agregator Berita Terbuka:** Mengonsumsi RSS feeds resmi dengan sitasi atribusi langsung ke penerbit asli.
* **AI-Assisted Processing:** Memanfaatkan LLM (Gemini via Google AI Studio) untuk peringkasan otomatis (*auto-summarization*), kategorisasi artikel cerdas, dan deteksi duplikasi sentimen/berita.

---

## 2. Product Requirements (PRD)

### 2.1 Core Features & User Stories

| Feature ID | Modul | Deskripsi | Prioritas (MoSCoW) |
| :--- | :--- | :--- | :--- |
| **FR-01** | Live TV Hub | Direktori saluran TV berita nasional & global dengan pemutar sematan (*embedded player*) responsif. | Must Have |
| **FR-02** | Channel Switcher | Pengguna dapat berpindah channel TV secara instan tanpa memuat ulang seluruh halaman (*single page player*). | Must Have |
| **FR-03** | News Aggregator Feed | Pengambilan dan penampilan ringkasan berita dari RSS feeds/API berita berkala (Indonesia & Global). | Must Have |
| **FR-04** | AI Article Summarizer | Peringkasan berita panjang menjadi 3 poin utama (*bullet points*) menggunakan Gemini API. | Should Have |
| **FR-05** | Region & Category Filter | Filter konten berita berdasarkan cakupan wilayah (Indonesia vs Internasional) dan topik (Politik, Bisnis, Teknologi). | Must Have |
| **FR-06** | Source Attribution | Setiap kartu berita wajib mencantumkan nama media asli, waktu rilis, thumbnail, dan pranala (*outbound link*) ke artikel penuh. | Must Have |
| **FR-07** | Search & Trending Topics | Pencarian kata kunci dan visualisasi topik hangat menggunakan AI clustering. | Could Have |

---

## 3. Data Schema & Contracts

### 3.1 Data Structures (JSON)

#### A. Channel Entity (`Channel`)
```json
{
  "id": "ch_kompas_tv",
  "name": "Kompas TV",
  "category": "News",
  "region": "ID",
  "stream_type": "youtube_live",
  "stream_source": "YOUTUBE_VIDEO_ID_OR_CHANNEL_ID",
  "thumbnail_url": "https://img.youtube.com/vi/STREAM_ID/hqdefault.jpg",
  "is_active": true
}
```

#### B. Article Entity (`Article`)
```json
{
  "id": "art_20261025_001",
  "title": "Judul Berita Terkini",
  "summary": "Ringkasan awal berita dalam satu atau dua kalimat.",
  "ai_takeaways": [
    "Poin kunci pertama dari peristiwa.",
    "Poin kunci kedua terkait dampak kebijakan.",
    "Poin kunci ketiga tentang langkah selanjutnya."
  ],
  "source_name": "Antara News",
  "source_url": "https://antaranews.com/berita/...",
  "image_url": "https://antaranews.com/images/...",
  "published_at": "2026-10-25T14:00:00Z",
  "region": "ID",
  "category": "Technology"
}
```

---

## 4. Technical Architecture & System Design

### 4.1 System Diagram
```
+-------------------------------------------------------------------------+
|                               FRONTEND                                  |
|  - Live TV Player (Iframe Component)                                    |
|  - Channel Selector Grid                                                |
|  - News Feed Card Layout (with Region & Topic Filters)                  |
+-------------------+---------------------------------+-------------------+
                    |                                 |
                    v (Fetch Content)                 v (AI Prompt Calls)
+-----------------------------------+   +---------------------------------+
|          BACKEND / FETCHER        |   |   GOOGLE AI STUDIO / GEMINI API |
| - RSS Parser (Antara, BBC, CNN)   |   | - News Summarizer Prompt        |
| - Channel Catalog Service         |   | - Topic Categorizer Prompt      |
| - Caching Layer (KV / SQLite)     |   | - JSON Mode Output Structured   |
+-----------------------------------+   +---------------------------------+
```

### 4.2 Legal & Operational Compliance
1. **Hak Ciar TV:** Hanya menggunakan `<iframe>` resmi YouTube atau HLS stream publik berlisensi CC/Open Stream. Dilarang melakukan re-streaming (*restreaming*) server-side tanpa izin lisensi penyiaran.
2. **Hak Cipta Teks Berita:** Mengikuti konvensi agregasi wajar (*fair use*):
   * Tidak menduplikasi seluruh isi berita (*no full content scraping*).
   * Menampilkan headline, ringkasan pendek AI / excerpt, dan atribusi jelas beserta link rujukan sumber.

---

## 5. Google AI Studio Implementation Plan

Bagian ini dirancang untuk langsung diuji dan diimplementasikan pada Google AI Studio.

### 5.1 System Instruction (Salin ke Google AI Studio)
```text
You are an expert bilingual news summarization and categorization engine for an Indonesian and Global news aggregator.

Tasks:
1. Receive raw article titles and text excerpts.
2. Produce a concise, objective summary in Indonesian.
3. Extract exactly 3 key takeaways (bullet points).
4. Assign the primary category: [Politik, Ekonomi & Bisnis, Teknologi, Dunia, Olahraga, Hiburan].
5. Determine the scope: "Indonesia" or "Global".
6. Return the result strictly in valid JSON format according to the requested schema. No markdown formatting outside the JSON block.
```

### 5.2 Structured Prompt Template
```text
Analyze the following news item:

Source: {{SOURCE_NAME}}
Title: {{ARTICLE_TITLE}}
Content Excerpt: {{ARTICLE_BODY}}

Generate a JSON object with this exact structure:
{
  "title_id": "Judul dalam Bahasa Indonesia yang lugas",
  "summary": "Ringkasan maksimal 2 kalimat.",
  "takeaways": [
    "Poin 1",
    "Poin 2",
    "Poin 3"
  ],
  "category": "Kategori",
  "region": "Indonesia/Global"
}
```

### 5.3 Initial Curated TV Channel Catalog (Seeds)
| Channel Name | Region | Type | Identifier Source |
| :--- | :--- | :--- | :--- |
| Kompas TV | ID | YouTube Live | Official Kompas TV Live Stream ID |
| TV One | ID | YouTube Live | Official tvOneNews Live Stream ID |
| DW News | Global (DE/EN) | YouTube Live | Official DW News 24/7 Stream ID |
| Sky News | Global (UK) | YouTube Live | Official Sky News Live Stream ID |
| France 24 English | Global (FR/EN)| YouTube Live | Official France 24 Live Stream ID |
| Al Jazeera English | Global (QA/EN)| YouTube Live | Official Al Jazeera Live Stream ID |

---

## 6. Implementation Roadmap

### Phase 1: Prototype via Google AI Studio & Static UI (Minggu 1)
* Buat *mockup* antarmuka satu halaman (Single Page App).
* Uji coba prompt peringkasan berita menggunakan Google AI Studio (Gemini 2.5/Gemini 1.5 Pro