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

The dashboard displays active trip status, total statistics, recent trips, and quick access to start new trips.

## Progressive Web App

### Installing the App

Desktop (Chrome/Edge/Brave):
- Click the install icon in the address bar
- Select "Install"

Mobile (Android):
- Tap menu and select "Add to Home screen"

Mobile (iOS/Safari):
- Tap Share button
- Select "Add to Home Screen"

### Offline Functionality

The app works completely offline after first visit. All features are accessible without internet connection.

## Vehicle Management

### Adding a Vehicle

1. Navigate to Vehicles page
2. Click "Add Vehicle"
3. Fill in required information:
   - Name: Custom name for your vehicle
   - Make: Manufacturer
   - Model: Model name
   - Year: Manufacturing year
   - Battery Capacity: Total capacity in kWh
   - Charging Efficiency: Percentage efficiency
4. Click "Add Vehicle" to save

### Editing and Deleting

- Click on vehicle to edit details
- Use delete button to remove (cannot delete vehicles with trips)

## Trip Tracking

### Starting a New Trip

1. Go to Trips page
2. Click "New Trip"
3. Enter trip details:
   - Trip Name
   - Vehicle selection
   - Starting Odometer (km)
   - Starting Battery percentage
   - Optional: Location and notes
4. Click "Start Trip"

### Adding Stops

During an active trip:

1. Click "Add Stop" on trip details page
2. Enter current readings:
   - Odometer reading
   - Battery percentage
   - Battery kWh
   - Optional: Location and notes
3. Click "Add Stop"

The app automatically calculates:
- Distance traveled
- Energy consumed
- Efficiency metrics
- Battery usage

### Completing a Trip

1. Click "Complete Trip" on trip details page
2. Review trip summary
3. Export data if needed

## Charging Sessions

### Logging a Charging Session

At any stop during a trip:

1. Click "Add Charging" on the stop card
2. Enter charging details:
   - Start and End SOC (percentage)
   - Start and End kWh
   - Cost
   - Duration (minutes)
   - Optional: Charger type and location
3. Click "Add Charging Session"

The app automatically calculates energy added, cost per kWh, and charging efficiency.

## Analytics Dashboard

### Viewing Statistics

Navigate to Analytics page to see:

- Total trips, distance, energy consumed
- Average efficiency across all trips
- Charging costs and sessions
- Visual charts and trends
- Time period filtering

### Understanding Efficiency Metrics

kWh/km (Energy per distance):
- Lower is better
- Shows energy use per kilometer

km/kWh (Distance per energy):
- Higher is better
- Shows distance per kWh

Percentage per km:
- Shows battery drain rate
- Useful for range estimation

## Data Export

### Exporting Trip Data

From any completed trip page:

CSV Export:
- Spreadsheet-compatible file with all trip data

PDF Report:
- Detailed trip report with charts

JSON Backup:
- Complete trip data for backup

### Backing Up All Data

From Analytics page:
- Click "Export All Data"
- Downloads JSON file with all vehicles, trips, and sessions
- Recommended: Export regularly to prevent data loss

## Data Storage

### Local Storage

All data is stored in browser Local Storage:
- Complete privacy, data never leaves device
- Works offline
- Fast performance
- Device and browser specific

### Storage Limitations

Advantages:
- Complete privacy
- Offline functionality
- Fast performance

Limitations:
- Data is device-specific
- Data is browser-specific
- Clearing browser data deletes trips
- Storage limit: typically 5-10MB

### Best Practices

1. Export to JSON monthly for backup
2. Export important trips to PDF
3. Use same browser for continuity
4. Avoid clearing browser data

## Tips for Accurate Tracking

### Battery Readings

- Record levels at consistent times
- Use vehicle's displayed percentage
- Note kWh reading from vehicle display
- Be consistent with measurement method

### Odometer Readings

- Use same odometer consistently
- Record at same points
- Be precise with decimal places

### Charging Sessions

- Record SOC before and after charging
- Note actual cost from station
- Include charger type for analysis

### Location Notes

- Use consistent naming for frequent locations
- Include relevant details
- Note unusual circumstances

## Troubleshooting

### Data Not Saving

- Check if browser allows Local Storage
- Ensure not in private/incognito mode
- Check browser storage quota

### Incorrect Calculations

- Verify all input values
- Check vehicle battery capacity setting
- Ensure odometer readings are sequential

### Missing Trips

- Check same browser is being used
- Verify browser data hasn't been cleared
- Restore from JSON backup if available

## Support

For issues or questions:
- Check the [Contributing Guide](./CONTRIBUTING.md) for technical details
- Open an issue on [GitHub](https://github.com/ajithrn/ev-triplog)
