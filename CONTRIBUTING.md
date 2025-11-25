# Contributing Guide

Developer documentation for contributing to EV Trip Log.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Architecture](#architecture)
4. [Code Style](#code-style)
5. [Contributing](#contributing)
6. [Roadmap](#roadmap)

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Local Development

```bash
# Clone repository
git clone https://github.com/ajithrn/ev-triplog.git
cd ev-triplog

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build production bundle
npm start            # Start production server
npm run lint         # Run ESLint
```

### Testing PWA Features

PWA features only work with production builds:

```bash
# Build production version
npm run build

# Serve production build
npx serve out

# Test offline mode in DevTools:
# Application > Service Workers > Check "Offline"
```

## Project Structure

```
ev-triplog/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard
│   ├── vehicles/          # Vehicle management
│   ├── trips/             # Trip management
│   └── analytics/         # Analytics dashboard
├── components/            # React components
├── src/                   # Clean Architecture layers
│   ├── core/             # Domain layer
│   ├── application/      # Use cases
│   ├── infrastructure/   # Data access
│   ├── presentation/     # State management
│   └── shared/           # Shared utilities
├── types/                # TypeScript definitions
├── utils/                # Utility functions
└── public/               # Static assets
```

## Architecture

### Clean Architecture

The application follows Clean Architecture principles:

Domain Layer (src/core):
- Core business logic and entities
- Independent of frameworks

Application Layer (src/application):
- Use cases and business rules
- Orchestrates domain logic

Infrastructure Layer (src/infrastructure):
- External services and data access
- Local storage implementation

Presentation Layer (src/presentation):
- UI components and state management
- Zustand stores for state

### State Management

Zustand stores for global state:

- vehicleStore: Vehicle CRUD operations
- tripStore: Trip and stop management
- settingsStore: App preferences
- analyticsStore: Analytics data and filters

### Data Flow

1. User interacts with UI
2. Components call store actions
3. Stores execute use cases
4. Use cases update domain entities
5. Infrastructure persists to Local Storage
6. UI re-renders with new state

### Type System

All types defined in types/ and src/core/domain/entities:

Core Types:
- Vehicle: Vehicle information
- Trip: Trip data with stops
- Stop: Individual stop readings
- ChargingSession: Charging details
- Stretch: Calculated metrics

### Calculation Engine

utils/calculations.ts handles efficiency calculations:

Key Functions:
- calculateStretch(): Metrics between stops
- calculateTripStretches(): All stretches
- calculateTripMetrics(): Trip statistics
- calculateChargingEnergy(): Energy added
- calculateCostPerKwh(): Cost efficiency

### Storage Layer

utils/storage.ts manages Local Storage:

Storage Keys:
- ev-trip-logger-vehicles
- ev-trip-logger-trips
- settings-storage
- analytics-storage

Features:
- Automatic serialization
- Error handling
- Type-safe operations

## Code Style

### TypeScript Guidelines

- Use strict TypeScript mode
- Define interfaces for all structures
- Avoid any types
- Use type guards
- Document complex types

### React Best Practices

- Functional components with hooks
- Proper error boundaries
- React.memo for optimization
- Single-purpose components
- Custom hooks for reusable logic

### Naming Conventions

- Components: PascalCase (VehicleCard.tsx)
- Functions: camelCase (calculateEfficiency)
- Constants: UPPER_SNAKE_CASE (STORAGE_KEY)
- Types: PascalCase (Vehicle, TripStats)

### File Organization

- One component per file
- Co-locate related components
- Separate utility modules
- Group related types

### Styling

- Tailwind CSS utility classes
- DaisyUI components
- Mobile-first responsive design
- Custom theme variables

## Contributing

### Getting Started

1. Fork the repository
2. Create feature branch: git checkout -b feature/name
3. Make changes
4. Test thoroughly
5. Commit: git commit -m 'Add feature'
6. Push: git push origin feature/name
7. Open Pull Request

### Pull Request Guidelines

Before Submitting:
- Follow style guidelines
- Test all functionality
- Update documentation
- Add comments for complex logic
- No console errors

PR Description:
- Clear description of changes
- Motivation and context
- Screenshots for UI changes
- Testing steps
- Related issues

### Commit Message Format

```
type(scope): subject

body (optional)
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style
- refactor: Code refactoring
- test: Tests
- chore: Maintenance

Examples:
```
feat(trips): add charging session support
fix(analytics): correct efficiency calculation
docs(readme): update installation
```

### Code Review Process

1. Maintainer reviews PR
2. Feedback provided
3. Changes requested or approved
4. PR merged to main

## PWA Development

### Service Worker

Updating Service Worker:
1. Modify public/sw.js
2. Update CACHE_VERSION
3. Test with production build

Adding New Pages:
Add routes to PRECACHE_ASSETS in public/sw.js

Key Files:
- public/sw.js: Service worker
- app/register-sw.tsx: Registration
- public/manifest.json: PWA manifest
- app/layout.tsx: PWA metadata

## Testing

### Manual Testing Checklist

Vehicle Management:
- Add, edit, delete vehicle
- Validate form inputs

Trip Tracking:
- Start trip, add stops
- Add charging sessions
- Complete trip

Analytics:
- View statistics
- Check charts
- Filter data

Export:
- CSV, PDF, JSON export
- Verify data integrity

### Browser Testing

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Support

- GitHub Issues: github.com/ajithrn/ev-triplog/issues
- Developer: ajithrn.com

## Roadmap

### Planned Features

Cloud & Sync:
- User authentication
- Multi-device sync
- Cloud backup

Mobile:
- Native mobile app
- Push notifications
- Enhanced offline

Smart Features:
- GPS integration
- Route planning
- Weather data
- Charging station finder
- AI recommendations
- Automatic tracking

Social:
- Trip sharing
- Community leaderboards
- Achievements

Future:
- Vehicle API integration
- Smart charging suggestions
- Carbon footprint tracking

## Known Issues

Current Limitations:
- No cloud sync
- Single-user only
- Browser storage limits
- Manual data entry
- No GPS integration

Areas for Improvement:
- Test coverage
- Error boundaries
- Loading states
- Bundle optimization
- Data migration system

## License

MIT License

Thank you for contributing to EV Trip Log!
