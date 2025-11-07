import { Trip, Vehicle, Stop } from '@/types';
import { parse } from 'papaparse';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import {
  calculateTripStretches,
  formatDistance,
  formatEnergy,
  formatBatteryPercent,
  formatCost,
  formatEfficiency,
  formatDuration,
  calculateChargingEnergy,
  calculateCostPerKwh,
} from './calculations';

/**
 * Export trip to CSV
 */
export function exportTripToCSV(trip: Trip, vehicle: Vehicle): void {
  const stretches = calculateTripStretches(trip.stops);
  
  // Prepare CSV data
  const csvData = [];
  
  // Add header
  csvData.push([
    'Stop #',
    'Date/Time',
    'Odometer (km)',
    'Battery %',
    'Battery kWh',
    'Location',
    'Distance (km)',
    'Energy Used (kWh)',
    'Efficiency (kWh/km)',
    'Efficiency (km/kWh)',
    'km per %',
    'Charging Start SOC',
    'Charging End SOC',
    'Charging Cost',
    'Notes',
  ]);
  
  // Add data rows
  trip.stops.forEach((stop, index) => {
    const stretch = index > 0 ? stretches[index - 1] : null;
    
    csvData.push([
      index + 1,
      format(new Date(stop.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      stop.odometer,
      stop.batteryPercent,
      stop.batteryKwh,
      stop.location || '',
      stretch ? stretch.distance.toFixed(2) : '',
      stretch ? stretch.energyUsed.toFixed(2) : '',
      stretch ? stretch.efficiencyKwhPerKm.toFixed(3) : '',
      stretch ? stretch.efficiencyKmPerKwh.toFixed(2) : '',
      stretch ? stretch.kmPerPercent.toFixed(2) : '',
      stop.chargingSession ? stop.chargingSession.startSoc : '',
      stop.chargingSession ? stop.chargingSession.endSoc : '',
      stop.chargingSession ? stop.chargingSession.cost : '',
      stop.notes || '',
    ]);
  });
  
  // Convert to CSV string
  const csvContent = csvData.map(row => row.join(',')).join('\n');
  
  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `trip-${trip.id}-${format(new Date(trip.startDate), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export trip to PDF
 */
export function exportTripToPDF(trip: Trip, vehicle: Vehicle): void {
  const doc = new jsPDF();
  const stretches = calculateTripStretches(trip.stops);
  
  let yPos = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  
  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  };
  
  // Title
  doc.setFontSize(18);
  doc.text('EV Trip Report', 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Vehicle Info
  doc.setFontSize(12);
  doc.text(`Vehicle: ${vehicle.name} (${vehicle.make} ${vehicle.model})`, 20, yPos);
  yPos += lineHeight;
  doc.text(`Battery Capacity: ${vehicle.batteryCapacity} kWh`, 20, yPos);
  yPos += lineHeight + 3;
  
  // Trip Info
  doc.text(`Trip Date: ${format(new Date(trip.startDate), 'PPP')}`, 20, yPos);
  yPos += lineHeight;
  doc.text(`Status: ${trip.status}`, 20, yPos);
  yPos += lineHeight;
  doc.text(`Total Distance: ${formatDistance(trip.totalDistance)}`, 20, yPos);
  yPos += lineHeight;
  doc.text(`Total Energy Used: ${formatEnergy(trip.totalEnergyUsed)}`, 20, yPos);
  yPos += lineHeight;
  doc.text(`Average Efficiency: ${formatEfficiency(trip.averageEfficiency, 1 / trip.averageEfficiency)}`, 20, yPos);
  yPos += lineHeight + 5;
  
  // Stops and Stretches
  doc.setFontSize(14);
  doc.text('Trip Details', 20, yPos);
  yPos += lineHeight + 3;
  
  doc.setFontSize(10);
  
  trip.stops.forEach((stop, index) => {
    checkNewPage(40);
    
    // Stop header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Stop ${index + 1}`, 20, yPos);
    yPos += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Time: ${format(new Date(stop.timestamp), 'PPp')}`, 25, yPos);
    yPos += lineHeight;
    doc.text(`Odometer: ${stop.odometer} km`, 25, yPos);
    yPos += lineHeight;
    doc.text(`Battery: ${formatBatteryPercent(stop.batteryPercent)} (${formatEnergy(stop.batteryKwh)})`, 25, yPos);
    yPos += lineHeight;
    
    if (stop.location) {
      doc.text(`Location: ${stop.location}`, 25, yPos);
      yPos += lineHeight;
    }
    
    if (stop.notes) {
      doc.text(`Notes: ${stop.notes}`, 25, yPos);
      yPos += lineHeight;
    }
    
    // Charging session
    if (stop.chargingSession) {
      const session = stop.chargingSession;
      const energyAdded = calculateChargingEnergy(session);
      const costPerKwh = calculateCostPerKwh(session);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Charging Session:', 25, yPos);
      yPos += lineHeight;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`SOC: ${session.startSoc}% → ${session.endSoc}%`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Energy Added: ${formatEnergy(energyAdded)}`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Cost: ${formatCost(session.cost)} (${formatCost(costPerKwh)}/kWh)`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Duration: ${formatDuration(session.duration)}`, 30, yPos);
      yPos += lineHeight;
    }
    
    // Stretch info (if not the first stop)
    if (index > 0) {
      const stretch = stretches[index - 1];
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Stretch ${index}:`, 25, yPos);
      yPos += lineHeight;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Distance: ${formatDistance(stretch.distance)}`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Energy Used: ${formatEnergy(stretch.energyUsed)}`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Efficiency: ${formatEfficiency(stretch.efficiencyKwhPerKm, stretch.efficiencyKmPerKwh)}`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Battery Used: ${formatBatteryPercent(stretch.batteryPercentUsed)} (${stretch.kmPerPercent.toFixed(2)} km/%)`, 30, yPos);
      yPos += lineHeight;
    }
    
    yPos += 3;
  });
  
  // Save PDF
  doc.save(`trip-${trip.id}-${format(new Date(trip.startDate), 'yyyy-MM-dd')}.pdf`);
}

/**
 * Export all data to JSON
 */
export function exportAllDataToJSON(data: { vehicles: Vehicle[]; trips: Trip[] }): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `ev-triplog-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
