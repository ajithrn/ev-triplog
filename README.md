# EV Trip Log

A web application for tracking electric vehicle trips, charging sessions, and efficiency metrics. Built with Next.js, TypeScript, and Clean Architecture principles.

## Features

- Multi-vehicle management with detailed profiles
- Trip tracking with multiple stops and automatic calculations
- Charging session logging with cost and energy tracking
- Real-time efficiency analytics and performance metrics
- Visual charts and statistics across all trips
- Data export to CSV, PDF, and JSON
- Progressive Web App with offline support
- Privacy-focused with local storage only

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript 5
- Zustand for state management
- Tailwind CSS with DaisyUI
- Recharts for visualizations
- Clean Architecture pattern
## Live Demo

🚀 **Try it now**: [https://trip.evaluate.autos/](https://trip.evaluate.autos/)

Experience the full application without any installation required.

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

# Build for production
npm run build

# Start production server
npm start
```

Open http://localhost:3000 in your browser.

## Documentation

- USAGE.md - User guide and features
- DEPLOYMENT.md - Deployment instructions
- CONTRIBUTING.md - Development guide

## Architecture

The application follows Clean Architecture principles:

- Domain Layer: Core business logic and entities
- Application Layer: Use cases and business rules
- Infrastructure Layer: External services and data access
- Presentation Layer: UI components and state management

State management uses Zustand with separate stores for:
- Vehicles
- Trips
- Settings
- Analytics

## Data Storage

All data is stored locally in browser Local Storage:
- Complete privacy, data never leaves your device
- No internet required after first load
- Fast performance with no network latency
- Regular JSON exports recommended for backup

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern browsers with ES6+ support

## License

MIT License

## Links

- Live Demo: https://trip.evaluate.autos/
- GitHub: https://github.com/ajithrn/ev-triplog
- Developer: https://ajithrn.com
- **Support**: [Buy me a coffee](https://buymeacoffee.com/ajithrn)
