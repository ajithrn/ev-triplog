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
- npm or yarn package manager
- Git
- Code editor (VS Code recommended)

### Local Development

```bash
# Clone the repository
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
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build optimized production bundle
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

### Environment Setup

No environment variables required. The application uses browser Local Storage for data persistence.

## Project Structure

```
ev-triplog/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Dashboard (home page)
│   ├── globals.css              # Global styles & theme
│   ├── vehicles/                # Vehicle management
│   │   ├── page.tsx            # Vehicle list
│   │   ├── new/                # Add vehicle
│   │   └── [id]/edit/          # Edit vehicle
│   ├── trips/                   # Trip management
│   │   ├── page.tsx            # Trip list
│   │   ├── new/                # Start new trip
│   │   └── [id]/               # Trip details
│   └── analytics/               # Analytics dashboard
│       └── page.tsx
├── components/                   # Reusable React components
│   ├── Navigation.tsx           # Top navigation bar
│   ├── Footer.tsx               # Footer component
│   └── trip-details/            # Trip-specific components
│       ├── StopCard.tsx        # Stop display card
│       ├── StopForm.tsx        # Add stop form
│       └── ChargingForm.tsx    # Add charging form
├── contexts/                     # React Context providers
│   ├── VehicleContext.tsx       # Vehicle state management
│   └── TripContext.tsx          # Trip state management
├── types/                        # TypeScript definitions
│   └── index.ts                 # All type definitions
├── utils/                        # Utility functions
│   ├── calculations.ts          # Efficiency calculations
│   ├── storage.ts               # Local storage operations
│   └── export.ts                # Export functionality
├── public/                       # Static assets
├── package.json                  # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS config
├── postcss.config.mjs           # PostCSS configuration
└── next.config.ts               # Next.js configuration
```

## Architecture

### State Management

The application uses React Context API for global state management:

**VehicleContext** (`contexts/VehicleContext.tsx`):
- Manages vehicle data
- Provides CRUD operations for vehicles
- Automatically persists to Local Storage

**TripContext** (`contexts/TripContext.tsx`):
- Manages trip and stop data
- Handles active trip state
- Provides trip operations (create, update, complete)
- Automatically persists to Local Storage

### Data Flow

1. User interacts with UI components
2. Components call context methods
3. Context updates state
4. Context persists to Local Storage
5. UI re-renders with new state

### Type System

All data structures are defined in `types/index.ts`:

**Core Types**:
- `Vehicle`: Vehicle information and battery specs
- `Trip`: Trip data with stops and metrics
- `Stop`: Individual stop with readings
- `ChargingSession`: Charging session details
- `Stretch`: Calculated metrics between stops

**Form Types**:
- `VehicleFormData`
- `StopFormData`
- `ChargingFormData`

**Analytics Types**:
- `TripStats`
- `EfficiencyDataPoint`
- `ChargingCostDataPoint`

### Calculation Engine

The `utils/calculations.ts` module handles all efficiency calculations:

**Key Functions**:
- `calculateStretch()`: Calculates metrics between two stops
- `calculateTripStretches()`: Processes all stretches in a trip
- `calculateTripMetrics()`: Aggregates trip-level statistics
- `calculateChargingEnergy()`: Computes energy added during charging
- `calculateCostPerKwh()`: Calculates charging cost efficiency

**Charging Session Handling**:
- When a stop has a charging session, the next stretch uses post-charging battery levels
- This ensures accurate efficiency measurements for driving segments
- Charging energy is tracked separately from driving consumption

### Storage Layer

The `utils/storage.ts` module manages Local Storage operations:

**Storage Keys**:
- `ev-trip-logger-vehicles`: Vehicle data
- `ev-trip-logger-trips`: Trip data

**Features**:
- Automatic serialization/deserialization
- Error handling for storage quota
- Type-safe operations

### Export System

The `utils/export.ts` module handles data export:

**Export Formats**:
- **CSV**: Using papaparse for spreadsheet compatibility
- **PDF**: Using jsPDF for detailed reports
- **JSON**: Native format for backup/migration

## Code Style

### TypeScript Guidelines

- Use strict TypeScript mode
- Define interfaces for all data structures
- Avoid `any` types
- Use type guards where appropriate
- Document complex types with comments

### React Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization where needed
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

### Naming Conventions

- **Components**: PascalCase (e.g., `VehicleCard.tsx`)
- **Functions**: camelCase (e.g., `calculateEfficiency`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`)
- **Types/Interfaces**: PascalCase (e.g., `Vehicle`, `TripStats`)

### File Organization

- One component per file
- Co-locate related components in subdirectories
- Keep utility functions in separate modules
- Group related types together

### CSS/Styling

- Use Tailwind CSS utility classes
- Leverage DaisyUI components
- Follow mobile-first responsive design
- Use custom theme variables from `globals.css`

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m 'Add amazing feature'`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Pull Request Guidelines

**Before Submitting**:
- Ensure code follows style guidelines
- Test all functionality
- Update documentation if needed
- Add comments for complex logic
- Verify no console errors or warnings

**PR Description Should Include**:
- Clear description of changes
- Motivation and context
- Screenshots for UI changes
- Testing steps
- Related issues (if any)

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(trips): add charging session support
fix(analytics): correct efficiency calculation
docs(readme): update installation instructions
```

### Code Review Process

1. Maintainer reviews PR
2. Feedback provided if needed
3. Changes requested or approved
4. PR merged into main branch

## Roadmap

### Phase 1: Cloud Integration
- User authentication system
- Cloud storage with sync
- Multi-device support
- Data backup to cloud

### Phase 2: Mobile Experience
- Progressive Web App (PWA) enhancements
- Native mobile app (React Native)
- Offline-first architecture
- Push notifications

### Phase 3: Advanced Features
- GPS integration for automatic tracking
- Route planning and optimization
- Weather data integration
- Charging station finder
- Real-time efficiency predictions

### Phase 4: Social Features
- Community comparisons
- Leaderboards
- Trip sharing
- Gamification elements
- Achievement system

### Phase 5: AI & Automation
- AI-powered efficiency recommendations
- Automatic trip detection
- Predictive range calculations
- Smart charging suggestions

## Technical Debt & Known Issues

### Current Limitations

1. **No Cloud Sync**: Data is device-specific
2. **No Multi-User**: Single-user application
3. **Storage Limits**: Browser storage constraints
4. **No GPS**: Manual location entry required
5. **No Real-Time**: Manual data entry

### Areas for Improvement

- Add comprehensive test coverage
- Implement error boundaries
- Add loading states for better UX
- Optimize bundle size
- Add service worker for offline support
- Implement data migration system

## Testing

### Manual Testing Checklist

**Vehicle Management**:
- [ ] Add vehicle
- [ ] Edit vehicle
- [ ] Delete vehicle (with/without trips)
- [ ] Validate form inputs

**Trip Tracking**:
- [ ] Start new trip
- [ ] Add stops
- [ ] Add charging sessions
- [ ] Complete trip
- [ ] View trip details

**Analytics**:
- [ ] View statistics
- [ ] Check charts render correctly
- [ ] Filter by vehicle
- [ ] Verify calculations

**Export**:
- [ ] Export to CSV
- [ ] Export to PDF
- [ ] Export to JSON
- [ ] Verify data integrity

### Browser Testing

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Support & Contact

- **GitHub Issues**: [github.com/ajithrn/ev-triplog/issues](https://github.com/ajithrn/ev-triplog/issues)
- **Developer**: [ajithrn.com](https://ajithrn.com)
- **Support**: [Buy me a coffee](https://buymeacoffee.com/ajithrn)

## License

MIT License - See LICENSE file for details.

---

Thank you for contributing to EV Trip Log!
