# Usage Guide

Complete guide for using EV Trip Log to track your electric vehicle trips and analyze efficiency.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Progressive Web App (PWA)](#progressive-web-app-pwa)
3. [Vehicle Management](#vehicle-management)
4. [Trip Tracking](#trip-tracking)
5. [Charging Sessions](#charging-sessions)
6. [Analytics Dashboard](#analytics-dashboard)
7. [Data Export](#data-export)

## Getting Started

### First Time Setup

1. Open the application in your browser
2. Add your first vehicle from the Vehicles page
3. Start tracking your trips

### Dashboard Overview

The dashboard displays:
- Active trip status (if any)
- Total statistics (trips, distance, energy, efficiency)
- Recent completed trips
- Quick access to start new trips

## Progressive Web App (PWA)

### Installing the App

The app will automatically show an install prompt when you first visit. You can also install manually:

**Desktop (Chrome/Edge/Brave)**:
1. Look for the install icon (⊕) in the address bar
2. Click "Install" to add to your desktop

**Mobile (Android)**:
1. Tap the menu (⋮) and select "Add to Home screen"

**Mobile (iOS/Safari)**:
1. Tap the Share button
2. Select "Add to Home Screen"

### Offline Functionality

The app works completely offline after your first visit. All pages, features, and data are accessible without internet connection.

**What Works Offline**:
- All pages and navigation
- Create and edit trips
- Add stops and charging sessions
- View analytics and export data

### Automatic Updates

The app checks for updates when you open it. If an update is available, you'll see a prompt to reload and get the latest version.

## Vehicle Management

### Adding a Vehicle

1. Navigate to **Vehicles** page
2. Click **"Add Vehicle"**
3. Fill in the required information:
   - **Name**: Custom name for your vehicle (e.g., "My Tesla Model 3")
   - **Make**: Manufacturer (e.g., "Tesla")
   - **Model**: Model name (e.g., "Model 3")
   - **Year**: Manufacturing year
   - **Battery Capacity**: Total battery capacity in kWh (e.g., 75)
   - **Charging Efficiency**: Percentage efficiency (e.g., 88 means 88% efficient, 12% loss)
4. Click **"Add Vehicle"** to save

### Editing a Vehicle

1. Go to Vehicles page
2. Click on the vehicle you want to edit
3. Update the information
4. Save changes

### Deleting a Vehicle

1. Navigate to the vehicle edit page
2. Click the delete button
3. Confirm deletion

**Note**: You cannot delete a vehicle that has associated trips.

## Trip Tracking

### Starting a New Trip

1. Go to **Trips** page
2. Click **"New Trip"**
3. Enter trip details:
   - **Trip Name**: Descriptive name (e.g., "Weekend Road Trip")
   - **Vehicle**: Select from your vehicles
   - **Starting Odometer**: Current odometer reading in km
   - **Starting Battery %**: Current battery percentage
   - **Starting Battery kWh**: Auto-calculated based on vehicle capacity
   - **Location**: Optional starting location
   - **Notes**: Optional trip notes
4. Click **"Start Trip"**

### Adding Stops

During an active trip:

1. Click **"Add Stop"** on the trip details page
2. Enter current readings:
   - **Odometer**: Current odometer reading in km
   - **Battery %**: Current battery percentage
   - **Battery kWh**: Current battery level in kWh
   - **Location**: Optional location name
   - **Notes**: Optional notes about this stop
3. Click **"Add Stop"**

The app automatically calculates for each stretch:
- Distance traveled (km)
- Energy consumed (kWh)
- Efficiency (kWh/km and km/kWh)
- Battery percentage used
- km per percentage point

### Completing a Trip

1. On the trip details page, click **"Complete Trip"**
2. Review the trip summary showing:
   - Total distance
   - Total energy used
   - Average efficiency
   - All stops and stretches
   - Charging sessions (if any)
3. Export the trip data if needed

## Charging Sessions

### Logging a Charging Session

At any stop during a trip:

1. Click **"Add Charging"** on the stop card
2. Enter charging details:
   - **Start SOC**: Battery percentage when charging started
   - **End SOC**: Battery percentage when charging ended
   - **Start kWh**: Battery kWh when charging started
   - **End kWh**: Battery kWh when charging ended
   - **Cost**: Total charging cost in ₹
   - **Duration**: Charging time in minutes
   - **Charger Type**: Optional (e.g., "DC Fast Charger", "AC Slow Charger")
   - **Location**: Optional charging station location
3. Click **"Add Charging Session"**

The app automatically calculates:
- Energy added (kWh)
- Cost per kWh
- Charging efficiency

### Understanding Charging Impact

When you add a charging session at a stop:
- The next stretch calculation uses the **post-charging** battery level
- This ensures accurate efficiency measurements for driving segments
- Charging energy is tracked separately from driving consumption

## Analytics Dashboard

### Viewing Statistics

Navigate to the **Analytics** page to see:

**Aggregate Metrics**:
- Total number of trips
- Total distance traveled
- Total energy consumed
- Average efficiency across all trips
- Total charging costs
- Total charging sessions

**Visual Charts**:
- Efficiency trends over time
- Distance and energy usage patterns
- Charging cost analysis

### Filtering Data

- View all trips or filter by specific vehicle
- Analyze trends over different time periods
- Compare performance across vehicles

### Understanding Efficiency Metrics

**kWh/km** (Energy per distance):
- Lower is better
- Shows how much energy you use per kilometer
- Affected by driving style, speed, terrain, weather

**km/kWh** (Distance per energy):
- Higher is better
- Shows how far you can travel per kWh
- Inverse of kWh/km

**% per km** (Battery percentage per kilometer):
- Shows battery drain rate
- Useful for range estimation

## Data Export

### Exporting Trip Data

From any completed trip page:

**CSV Export**:
1. Click **"Export to CSV"**
2. Opens spreadsheet-compatible file with:
   - All stops and their data
   - Stretch calculations
   - Charging sessions
   - Trip summary

**PDF Report**:
1. Click **"Export to PDF"**
2. Generates detailed trip report with:
   - Trip overview
   - Stop-by-stop breakdown
   - Efficiency metrics
   - Charging session details
   - Charts and visualizations

**JSON Backup**:
1. Click **"Export to JSON"**
2. Downloads complete trip data in JSON format
3. Useful for data backup or migration

### Backing Up All Data

From the Analytics page:
1. Click **"Export All Data"**
2. Downloads JSON file containing:
   - All vehicles
   - All trips
   - All stops
   - All charging sessions

**Recommendation**: Export your data regularly to prevent data loss.

## Data Storage

### Local Storage

All data is stored in your browser's Local Storage:
- **Storage Keys**:
  - `ev-trip-logger-vehicles`: Vehicle data
  - `ev-trip-logger-trips`: Trip data
- **Automatic Saving**: Data is saved immediately on every change
- **Privacy**: Data never leaves your device

### Storage Limitations

**Advantages**:
- Complete privacy
- Works offline
- Fast performance
- No server costs

**Limitations**:
- Data is device-specific
- Data is browser-specific
- Clearing browser data deletes trips
- Storage limit: typically 5-10MB

### Best Practices

1. **Regular Backups**: Export to JSON monthly
2. **Important Trips**: Export to PDF for records
3. **Consistent Browser**: Use the same browser for continuity
4. **Avoid Cache Clearing**: Be careful when clearing browser data

## Tips for Accurate Tracking

### Battery Readings

- Record battery levels at consistent times
- Use the vehicle's displayed percentage
- Note the kWh reading from the vehicle display
- Be consistent with your measurement method

### Odometer Readings

- Always use the same odometer (trip meter or main odometer)
- Record readings at the same point (start/end of charging, etc.)
- Be precise with decimal places if your vehicle shows them

### Charging Sessions

- Record SOC before plugging in
- Record SOC after unplugging
- Note the actual cost from the charging station
- Include charger type for better analysis

### Location Notes

- Use consistent naming for frequent locations
- Include relevant details (highway, city, weather conditions)
- Note any unusual circumstances (heavy traffic, extreme weather)

## Troubleshooting

### Data Not Saving

- Check if browser allows Local Storage
- Ensure you're not in private/incognito mode
- Check browser storage quota

### Incorrect Calculations

- Verify all input values are correct
- Check vehicle battery capacity setting
- Ensure odometer readings are sequential

### Missing Trips

- Check if you're using the same browser
- Verify browser data hasn't been cleared
- Restore from JSON backup if available

## Support

For issues or questions:
- Check the [Contributing Guide](./CONTRIBUTING.md) for technical details
- Open an issue on [GitHub](https://github.com/ajithrn/ev-triplog)
