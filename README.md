# TrustNest – AI-Powered Accommodation & City Intelligence Platform

> **Tagline:** Find your place. Know your place. Feel confident.  
> **Pilot Focus:** Hyderabad IT Corridor (HITEC City, Madhapur, Gachibowli & Kondapur)  
> **Project Status:** Hackathon MVP / Prototype (Milestones 1–5 Audited & Verified)

---

## 1. Project Overview

TrustNest is an **AI-powered, human-supported accommodation and city intelligence prototype** engineered for working professionals and students relocating to unfamiliar technology hubs. 

By pairing Google Gemini conversational intelligence with a "Physical Ground-Truth" verification methodology, TrustNest bridges the trust deficit in urban rental housing. Rather than relying on generic, unverified checkmarks, TrustNest provides transparent evidence streams (unedited researcher photos, room hygiene audits, and fire safety checks) alongside geospatial city intelligence (transit nodes, accredited trauma hospitals, and police/SHE teams).

TrustNest is architected as a **100% guest-first platform**: users explore listings, generate explainable AI match scores, inspect multi-source photo streams, and query neighborhood civic facilities without being forced to create an account or sign in.

---

## 2. Problem Statement

Relocating to a new city often involves high stakes and asymmetric information:
1. **Misleading Marketing & Recycled Media:** Landlord listings frequently use wide-angle, heavily edited, or years-old marketing photography that conceals maintenance defects, mold, or missing amenities.
2. **Fabricated Transit Claims:** Listings advertise "5 minutes to Cyber Towers or Metro," which in reality translates to a 35-minute walk along unlit roads.
3. **Empty "Verified" Badges:** Conventional portals offer proprietary badges that indicate an owner paid a listing fee, not that a human inspected the property.
4. **Isolated Civic Context:** Renters cannot easily cross-reference accommodation listings with emergency facilities, women's safety infrastructure (SHE Teams), or reliable water/power supply.
5. **Forced Onboarding Friction:** Most portals lock basic search and contact details behind aggressive registration walls before delivering value.

---

## 3. Solution & Key Features

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRUSTNEST CORE PLATFORM                         │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. AI Intelligence       │ Conversational requirement extraction with   │
│                          │ Google Gemini; explicit vs inferred needs.  │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 2. Ground-Truth Audits   │ Field researcher visits, unedited photo     │
│                          │ streams, hygiene audits, and safety checks. │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 3. Explainable Matching  │ Transparent algorithmic scoring (3.0x /     │
│                          │ 1.5x weighting); decision support, not cert.│
├──────────────────────────┼─────────────────────────────────────────────┤
│ 4. Civic Map & Transit   │ OpenStreetMap + Leaflet; geodetic Haversine │
│                          │ proximity to metro, hospitals, and police.  │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 5. Persistent Reporting  │ Community observations & discrepancy reports│
│                          │ persisted to MongoDB Atlas.                 │
├──────────────────────────┼─────────────────────────────────────────────┤
│ 6. Guest-First UX        │ Full search, filtering, comparison, and     │
│                          │ localStorage bookmarks with no login wall.  │
└──────────────────────────┴─────────────────────────────────────────────┘
```

### Key Capabilities
- **Conversational AI Requirement Extraction:** Users describe their living requirements in natural language (e.g., *"Need a quiet single room near HITEC City under 20k with food and high-speed Wi-Fi"*). Google Gemini extracts structured criteria, distinguishing explicit requirements from inferred preferences.
- **Interactive Requirement Checklist:** An 8-point interactive checklist allows users to toggle, modify, or add criteria (budget limits, meal plans, power backup, quiet environment) in real time.
- **Physical Ground Truth vs. Owner Photos:** Property modals feature a multi-source photo comparison tool contrasting Owner marketing images with unedited Field Researcher audit photos and community uploads.
- **Explainable AI Matching Engine:** Computes an explainable Match Score (%) based on verified property attributes against the user's checklist. Stated preferences receive **3.0x** weight; inferred items receive **1.5x**; unverified records receive **0 points**.
- **Side-by-Side Property Comparison Matrix:** Docked comparison bar allows comparing up to 3 properties simultaneously across rent, security deposits, food inclusion, CCTV, fire safety, and evidence freshness.
- **Civic Intelligence & Interactive Map:** Leaflet-powered map displaying 20+ verified community facilities across HITEC City and Madhapur, categorized by healthcare, police/SHE teams, transit stations, and pharmacies.
- **MongoDB Atlas Persistence:** Community observations and property discrepancy reports are validated and written directly to MongoDB Atlas.
- **Persistent Guest Shortlists:** Saved properties persist across browser reloads via client-side `localStorage` (`trustnest_saved_stays`) without requiring authentication.

---

## 4. Technology Stack

### Frontend Client
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `19.3.1` | Modern UI rendering library |
| **TypeScript** | `~7.0.2` | Type-safe application development |
| **Vite** | `^8.3.6` | Next-generation client build tool and dev server |
| **Tailwind CSS** | `^4.3.5` | Modern utility-first styling with `@tailwindcss/vite` |
| **Lucide React** | `^1.77.0` | Clean, accessible vector UI icons |
| **Leaflet** | `^1.9.4` | Open-source interactive mapping engine |
| **React-Leaflet** | `^5.0.0` | React wrapper components for Leaflet maps |
| **React Router DOM** | `^7.18.6` | Client-side routing and navigation |
| **Oxlint** | `^1.90.0` | High-performance Rust-based linter |
| **Puppeteer Core** | `^25.18.1` | Headless browser QA automation and walkthrough validation |

### Backend Service
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>=18.0.0` | JavaScript runtime environment |
| **Express.js** | `^5.3.0` | Modern REST API framework with native async route handling |
| **TypeScript** | `^7.0.2` | Server-side static typing and compile-time validation |
| **tsx** | `^4.23.15` | Fast TypeScript execution and hot-reload watcher |
| **Mongoose** | `^9.12.3` | Schema-based MongoDB object modeling and validation |
| **MongoDB Atlas** | Cloud | Managed cloud document database for persistent storage |
| **Google Gen AI SDK** | `^3.6.1` | Official `@google/genai` SDK for Gemini API integration |
| **cors** | `^2.8.6` | Cross-Origin Resource Sharing middleware |
| **dotenv** | `^18.0.10` | Environment configuration manager |

---

## 5. Architecture Overview

```
                               ┌───────────────────────────────────────────────┐
                               │             Client Web Browser                │
                               │  React 19 • Tailwind CSS v4 • React-Leaflet   │
                               │  (Guest-First UI • localStorage Bookmarks)    │
                               └───────────────────────┬───────────────────────┘
                                                       │
                                            HTTP / JSON REST API
                                                       │
                               ┌───────────────────────▼───────────────────────┐
                               │           TrustNest Express 5 API             │
                               │  CORS Middleware • Input Validation • Router  │
                               └───────────┬───────────────────────┬───────────┘
                                           │                       │
                     Internal API Service  │                       │  Mongoose ODM
                                           │                       │
                       ┌───────────────────▼──────────┐   ┌────────▼───────────────────┐
                       │      Google Gemini API       │   │       MongoDB Atlas        │
                       │    @google/genai (Isolated)  │   │     Persistent Database    │
                       │  Natural Language Extraction │   │ Properties • Civic • Reps  │
                       └──────────────────────────────┘   └────────────────────────────┘
```

### Data Flow Breakdown
1. **AI Requirement Extraction:**
   - User inputs freeform search prompt in client textarea.
   - Frontend calls `POST /api/ai/parse-requirements`.
   - Express backend invokes `GeminiService.ts` using the server-isolated `GEMINI_API_KEY`.
   - Structured JSON response categorizes criteria as `explicit`, `inferred`, or `not_specified`.
2. **Property & Civic Intelligence Retrieval:**
   - Client calls `GET /api/properties` and `GET /api/city-services`.
   - Express queries MongoDB Atlas collections (`properties`, `cityservices`).
   - If MongoDB is unavailable, read-only demonstration records are served with clear disclosure flags (`source: 'demonstration_fallback'`, `isDemoData: true`).
3. **User Reporting & Persistence:**
   - Submissions to `POST /api/community/reports` or `POST /api/properties/:id/discrepancies` are validated and saved to MongoDB.
   - If MongoDB is offline, endpoints return HTTP 503 (`DATABASE_UNAVAILABLE`) and **never** simulate fake success.

---

## 6. Demonstration Data & Transparency Disclosures

In compliance with hackathon evaluation standards, TrustNest maintains complete transparency between working production features and prototype demonstration records:

| Capability | Current MVP Reality | Production / Real-World Destination |
| :--- | :--- | :--- |
| **Physical Audits** | **Demonstration Records:** Property cards and modals display curated audit datasets (field notes, hygiene ratings, audit dates) modeling our verification methodology. | In-person inspection visits conducted by trained local field auditors with geotagged media uploads. |
| **Owner KYC** | **Conceptual Prototype:** Badges represent verified owner identities in demo records. | Automated Aadhaar/PAN identity checks and registered municipal property ownership verification. |
| **Civic Services** | **Curated Pilot Records:** 20 verified facilities in HITEC City/Madhapur with authentic geodetic coordinates and Haversine distance calculations. | Automated synchronization with municipal open data portals and Google Places/OSM Overpass APIs. |
| **AI Match Score** | **Decision Support:** Represents algorithmic alignment with user-selected criteria (3.0x explicit, 1.5x inferred). | **Explicit Disclaimer:** The match score provides decision assistance; it does NOT constitute a safety or habitability guarantee. |
| **Emergency SOS** | **Simulated Interface:** Demonstrates an emergency dispatch workflow and quick-call directory for Hyderabad helplines (112, SHE Teams, Medicover). | **Explicit Notice:** The SOS button triggers a simulated state with an alert notice; no actual emergency services are contacted and no location is broadcast. |
| **Authentication** | **Guest-First MVP:** Users access all platform features without login. Guest bookmarks persist via `localStorage`. The Accounts modal is an honest Phase 6 roadmap preview. | Secure passwordless/OAuth2 resident profiles, synchronized bookmarks, and property owner portals. |
| **Database Persistence** | **Active MongoDB Atlas:** Community reports and discrepancy submissions are persistently stored in MongoDB Atlas collections. | Fully managed production database with automated backups and automated moderation workflows. |

---

## 7. Installation & Local Setup

### Prerequisites
- **Node.js:** `v18.0.0` or `v20.0.0+`
- **npm:** `v9.0.0+`
- **MongoDB Atlas** account (or local MongoDB instance)
- **Google AI Studio API Key** (for Gemini features)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/trust-nest.git
cd "trust-nest"
```

### 2. Install Dependencies
```bash
# Install frontend client dependencies
cd client && npm install && cd ..

# Install backend server dependencies
cd server && npm install && cd ..
```

### 3. Configure Environment Variables
Create `.env` files in both `client` and `server` directories based on the provided examples:

```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```
*(Populate `server/.env` with your `GEMINI_API_KEY` and `MONGODB_URI`.)*

### 4. Seed the Database (Optional but Recommended)
Populate your MongoDB Atlas instance with the initial Hyderabad pilot properties and civic facilities:
```bash
npm run seed
```
*(The seed script uses idempotent upserts based on unique IDs—safe to run multiple times.)*

### 5. Start Development Servers
Run the backend and frontend in separate terminals:

```bash
# Terminal 1: Start Backend Server (runs on http://localhost:5000)
npm run dev:server

# Terminal 2: Start Frontend Client (runs on http://127.0.0.1:5173)
npm run dev
```

Visit `http://localhost:5173` or `http://127.0.0.1:5173` in your browser.

---

## 8. Environment Variables Reference

### Backend Configuration (`server/.env`)
| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `PORT` | No | HTTP port for the Express backend | `5000` |
| `NODE_ENV` | No | Runtime environment (`development` \| `production`) | `development` |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string | `mongodb+srv://<username>:<password>@cluster0.mongodb.net/trustnest?retryWrites=true&w=majority` |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key from Google AI Studio | `AIzaSy...` |
| `GEMINI_MODEL` | No | Target Gemini model | `gemini-2.5-flash` |
| `CORS_ORIGIN` | No | Allowed client origins (comma-separated or `*`) | `http://localhost:5173,http://127.0.0.1:5173` |

### Frontend Configuration (`client/.env`)
| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | No | Base URL of the backend API | `http://localhost:5000` *(Leave blank if backend serves static client)* |

---

## 9. Testing & Quality Assurance

TrustNest features an extensive test suite verifying code health, API contracts, AI parsing, and browser end-to-end functionality.

### Test Commands
```bash
# 1. Run Oxlint static analysis across all client TypeScript files
npm run lint

# 2. Run REST API & database integration tests (19 tests)
npm run test:endpoints

# 3. Run Gemini AI unit & integration tests (24 tests)
npm run test:gemini

# 4. Run automated Puppeteer browser QA suite (56 checks)
npm run test:qa

# 5. Run live browser walkthrough script (25 assertions)
node client/walkthrough.mjs

# 6. Run full production build verification (Client + Server)
npm run build
```

### Verified Test Results Summary
| Test Suite | Command | Total Checks | Result | Coverage |
| :--- | :--- | :--- | :--- | :--- |
| **Oxlint Static Analysis** | `npm run lint` | 51 files | **0 errors, 0 warnings** | Client code hygiene & type safety |
| **Automated QA Suite** | `npm run test:qa` | 56 checks | **56 / 56 Passed (100%)** | Layout, AI search, modals, Leaflet map, filters |
| **Live Browser Walkthrough**| `node client/walkthrough.mjs` | 25 checks | **25 / 25 Passed (100%)** | Header bounds, mobile drawer, AI flow, comparisons |
| **Gemini Integration Suite**| `npm run test:gemini` | 24 tests | **24 / 24 Passed (100%)** | Input validation, timeout handling, schema checks |
| **REST API Controller Suite**| `npm run test:endpoints` | 19 tests | **19 / 19 Passed (100%)** | CRUD operations, fallback labeling, offline 503 |
| **Production Build Check**  | `npm run build` | Full App | **Exit Code 0** | Vite client bundle + TypeScript server compilation |

---

## 10. Deployment Instructions

### Strategy A: Decoupled Hosting (Recommended)
Host the frontend and backend independently on specialized cloud platforms:

1. **Frontend (Vercel / Netlify / Cloudflare Pages):**
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL=https://your-backend-service.onrender.com`

2. **Backend (Render / Railway / Fly.io):**
   - Root Directory: `server`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     - `PORT=5000`
     - `NODE_ENV=production`
     - `MONGODB_URI=mongodb+srv://...`
     - `GEMINI_API_KEY=AIzaSy...`
     - `CORS_ORIGIN=https://your-frontend.vercel.app`

### Strategy B: Unified Full-Stack Node.js Service
Deploy the entire repository as a single Node.js instance (Render Web Service, Railway, or AWS Elastic Beanstalk):

1. **Build Process:**
   - Execute root build script: `npm run build` (builds `client/dist` and compiles `server/dist`).
2. **Start Process:**
   - Start server: `npm run start:server` (executes `node server/dist/index.js`).
3. **SPA Fallback Routing:**
   - The Express server detects `client/dist` and serves static files automatically.
   - Any non-API route falls back to `client/dist/index.html` via Express 5 pathless middleware.
4. **Environment Variables:**
   - Set `PORT`, `NODE_ENV=production`, `MONGODB_URI`, and `GEMINI_API_KEY`.
   - `VITE_API_URL` and `CORS_ORIGIN` can be omitted in unified mode as client and API share origin.

---

## 11. Security & Responsible AI Practices

1. **Server-Side API Key Isolation:**
   - The `GEMINI_API_KEY` is strictly loaded into backend memory via `server/src/config/env.ts` and consumed exclusively by `geminiService.ts`.
   - The client application never receives, bundles, or has network access to the API key.
2. **Credential Protection:**
   - All `.env` and `.env.local` files are ignored across `.gitignore` files at the root, client, and server levels.
   - Only sanitized `.env.example` templates with empty placeholders are committed to version control.
3. **No Third-Party Map Key Requirements:**
   - Map tiles are rendered using OpenStreetMap standard raster tiles via Leaflet, requiring no proprietary API keys or client tracking.
4. **Offline Database Resilience:**
   - The API will never falsely claim that a user's community report or property discrepancy was recorded if the database connection is broken; it returns an explicit HTTP 503 error.
5. **Security Audit Disclosure:**
   - *Note:* While standard secure coding practices and isolation patterns are implemented, no formal external penetration test or security audit has been conducted on this hackathon prototype.

---

## 12. Future Enhancements (Phase 6 Roadmap)

- **Resident Accounts & Authentication:** Implement OAuth2 / WebAuthn passwordless authentication with cross-device bookmark synchronization.
- **Automated Vacancy & Price Alerts:** Enable SMS and WhatsApp alerts for rent reductions or verified vacancies in watched localities.
- **Verified Property Owner Portal:** A dedicated dashboard for landlords to submit tenancy agreements, schedule physical audit visits, and resolve discrepancy notices.
- **Municipal Open Data Integration:** Connect live data pipelines for Hyderabad water tanker schedules, power maintenance schedules, and GHMC sanitation updates.
- **Multi-City Pilot Expansion:** Extend verification network and civic intelligence to Bengaluru (Whitefield, Koramangala) and Pune (Hinjawadi).

---

## License

This project is developed for hackathon evaluation under the **ISC License**. See the repository package configurations for details.
