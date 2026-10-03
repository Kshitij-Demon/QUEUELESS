
# QueueLess — Real-Time Virtual Queue Platform 🚀

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**QueueLess** is a modern, zero-friction virtual queuing platform designed to eliminate physical waiting lines for customers while equipping businesses with a real-time admin dispatch console, multi-counter routing, live waitlist analytics, and automated check-ins.

---

## 🌟 Key Features

### 🎟️ Zero-Friction Customer Experience
- **Remote Queue Joining**: Join virtual waitlists from anywhere without standing in line.
- **Real-Time Position Tracking**: Dynamic position counter and dynamic wait-time estimation based on average desk service speeds.
- **QR & Geolocation Check-In**: Verify customer physical presence automatically via browser Geolocation API or Admin QR scanner.
- **Audio & Push Notifications**: Instant audio chimes and browser alerts when a ticket is called to a specific desk or counter.
- **Interactive Ticket View**: Digital pass featuring venue details, distance, estimated wait times, and direct cancel/check-in controls.

### ⚡ Live Admin Dispatch Console
- **Multi-Counter Dispatching**: Route customers dynamically to specific desks (e.g., Desk A, Counter 3, Room 102).
- **One-Click Queue Operations**: Call next customer, mark as serving, complete visit, or log no-shows seamlessly.
- **Live Venue Capacity Monitor**: Real-time visualization of queue utilization, average cycle time, and active desk counts.
- **QR Code Generator**: Instant venue QR generation for physical storefront scans.

### 📊 Operational Analytics & Export
- **Performance Metrics**: Monitor peak waiting counts, average cycle time, daily completed visits, and throughput efficiency %.
- **Visual Charts**: Interactive queue volume breakdown by service category powered by Recharts.
- **CSV Data Export**: Export daily queue logs and ticket performance stats with one click.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript |
| **State Management** | React Hooks & Centralized Store (`queueStore`) |
| **Styling & UI** | Tailwind CSS v4, Motion (Framer Motion), Confetti |
| **Icons & Visuals** | Lucide React Icons, QRCode.js |
| **Data Visualization** | Recharts |
| **Build & Tooling** | Vite 8, TypeScript Compiler |
| **AI Integration Ready**| Google GenAI SDK (`@google/genai`) |

---

## 📁 Project Structure

```text
queueless/
├── public/
│   └── sw.js                   # Service Worker for offline / push notification support
├── src/
│   ├── components/            # Reusable UI Components
│   │   ├── AdminLoginModal.tsx # Admin authentication modal
│   │   ├── AdminQrModal.tsx    # Venue QR generation for quick scanning
│   │   ├── AnalyticsOverview.tsx # Metrics & Recharts visualization
│   │   ├── Footer.tsx          # App footer component
│   │   ├── Header.tsx          # Navigation bar with real-time status badge
│   │   ├── JoinQueueModal.tsx  # Customer queue entry form
│   │   └── QrScannerModal.tsx  # Camera QR scanner for fast check-in
│   ├── hooks/                 # Custom React Hooks
│   │   └── useQueuePosition.ts # Real-time position tracking hook
│   ├── store/                 # State management
│   │   └── queueStore.ts       # Centralized queue state & simulated live updates
│   ├── types/                 # TypeScript type definitions
│   │   └── queue.ts            # QueueEntry, BusinessVenue, AdminStats interfaces
│   ├── utils/                 # Utility helpers
│   │   ├── audio.ts            # Audio notification chime player
│   │   ├── exportAnalyticsCsv.ts # CSV exporter for queue logs
│   │   ├── geolocation.ts      # Distance & location check-in validator
│   │   └── notifications.ts    # Browser push notification wrapper
│   ├── views/                 # Top-Level Views & Pages
│   │   ├── AdminLiveControl.tsx # Admin desk management console
│   │   ├── CustomerTicketView.tsx # Active customer ticket view
│   │   ├── HomeHero.tsx        # Landing page hero & features
│   │   └── ServiceDirectory.tsx # Multi-category venue finder
│   ├── App.tsx                # Main App component with view routing
│   ├── index.css              # Global styles & Tailwind imports
│   └── main.tsx               # Application entry point
├── metadata.json              # Platform capability manifest
├── package.json               # Dependencies & scripts
└── vite.config.ts             # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **bun**

### 1. Clone the Repository

```bash
git clone https://github.com/Kshitij-Demon/QUEUELESS.git
cd QUEUELESS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory (optional for Gemini AI features):

```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. Start Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches local Vite development server at `http://localhost:3000` |
| `npm run build` | Compiles TypeScript and builds production distribution artifacts |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript type check (`tsc --noEmit`) |
| `npm run clean` | Cleans `dist` build folder |

---

## 🤝 Contributing

Contributions are welcome! Follow these simple steps:

1. **Fork** the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
