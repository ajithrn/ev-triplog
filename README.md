# EV Trip Log

A comprehensive web application for tracking electric vehicle trips, charging sessions, and efficiency metrics. Built with Next.js 16, TypeScript, and modern web technologies.

## Overview

EV Trip Log is designed for electric vehicle owners who want to track their driving efficiency, charging costs, and trip details. The application provides real-time analytics, detailed trip breakdowns, and comprehensive charging session management—all stored locally in your browser for privacy and offline access.

## Key Features

- **Multi-Vehicle Management** - Add and manage multiple electric vehicles with detailed profiles
- **Trip Tracking** - Create named trips with multiple stops and automatic efficiency calculations
- **Charging Sessions** - Log detailed charging data including costs, duration, and energy added
- **Efficiency Analytics** - Calculate kWh/km, km/kWh, and battery usage metrics for each stretch
- **Visual Analytics** - View trends, statistics, and performance charts across all trips
- **Data Export** - Export trip data to CSV, PDF reports, or JSON backup

## Tech Stack

- Next.js 16.0.1 with App Router
- React 19.2.0
- TypeScript 5.x
- Tailwind CSS 4.1.14
- DaisyUI 5.4.7
- Recharts 3.3.0 for data visualization
- Local Storage for data persistence

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/ajithrn/ev-triplog.git
cd ev-triplog

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Documentation

- [Usage Guide](./USAGE.md) - Detailed instructions for using the application
- [Contributing Guide](./CONTRIBUTING.md) - Developer documentation and contribution guidelines

## Data Storage

All data is stored locally in your browser's Local Storage. This means:
- Complete privacy - data never leaves your device
- No internet connection required
- Fast performance with no network latency
- Data is device and browser specific

**Important**: Regular exports to JSON are recommended for backup purposes.

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES6+ support

## License

MIT License - See LICENSE file for details.

## Links

- **GitHub**: [github.com/ajithrn/ev-triplog](https://github.com/ajithrn/ev-triplog)
- **Developer**: [ajithrn.com](https://ajithrn.com)
- **Support**: [Buy me a coffee](https://buymeacoffee.com/ajithrn)

---

© 2025 EV Trip Log • Made with care for a sustainable future
