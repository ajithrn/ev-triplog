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
    'Charging Cost (Rs)',
    'Charging Duration (min)',
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
      stop.chargingSession ? stop.chargingSession.cost.toFixed(2) : '',
      stop.chargingSession ? stop.chargingSession.duration : '',
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
  
  // Calculate total charging cost and cost per km
  const totalChargingCost = trip.stops.reduce((sum, stop) => {
    return sum + (stop.chargingSession?.cost || 0);
  }, 0);
  const costPerKm = trip.totalDistance > 0 ? totalChargingCost / trip.totalDistance : 0;
  
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
  
  // ===== DASHBOARD PAGE =====
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EV Trip Dashboard', 105, yPos, { align: 'center' });
  yPos += 12;
  
  // Trip Name
  doc.setFontSize(16);
  doc.text(trip.name, 105, yPos, { align: 'center' });
  yPos += 15;
  
  // Vehicle Info Box
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, yPos, 180, 20, 3, 3, 'FD');
  yPos += 7;
  doc.text(`Vehicle: ${vehicle.name} (${vehicle.make} ${vehicle.model})`, 20, yPos);
  yPos += 6;
  const firstStop = trip.stops[0];
  doc.text(`Battery Capacity: ${vehicle.batteryCapacity} kWh | Trip Date: ${format(new Date(firstStop.timestamp), 'PPP')}`, 20, yPos);
  yPos += 12;
  
  // Key Metrics - 2x3 Grid
  const boxWidth = 58;
  const boxHeight = 35;
  const boxSpacing = 4;
  const startX = 15;
  
  // Row 1
  let boxX = startX;
  let boxY = yPos;
  
  // Distance Box
  doc.setFillColor(59, 130, 246); // Blue
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Total Distance', boxX + boxWidth / 2, boxY + 8, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${trip.totalDistance.toFixed(1)}`, boxX + boxWidth / 2, boxY + 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('kilometers', boxX + boxWidth / 2, boxY + 28, { align: 'center' });
  
  // Energy Box
  boxX += boxWidth + boxSpacing;
  doc.setFillColor(139, 92, 246); // Purple
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.text('Energy Used', boxX + boxWidth / 2, boxY + 8, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${trip.totalEnergyUsed.toFixed(2)}`, boxX + boxWidth / 2, boxY + 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('kWh', boxX + boxWidth / 2, boxY + 28, { align: 'center' });
  
  // Efficiency Box
  boxX += boxWidth + boxSpacing;
  doc.setFillColor(16, 185, 129); // Green
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.text('Efficiency', boxX + boxWidth / 2, boxY + 8, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const efficiency = trip.averageEfficiency > 0 ? (1 / trip.averageEfficiency).toFixed(2) : 'N/A';
  doc.text(`${efficiency}`, boxX + boxWidth / 2, boxY + 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('km/kWh', boxX + boxWidth / 2, boxY + 28, { align: 'center' });
  
  // Row 2
  boxX = startX;
  boxY += boxHeight + boxSpacing;
  
  // Charging Cost Box
  doc.setFillColor(251, 146, 60); // Orange
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.text('Charging Cost', boxX + boxWidth / 2, boxY + 8, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs ${totalChargingCost.toFixed(2)}`, boxX + boxWidth / 2, boxY + 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('total cost', boxX + boxWidth / 2, boxY + 28, { align: 'center' });
  
  // Cost per km Box
  boxX += boxWidth + boxSpacing;
  doc.setFillColor(236, 72, 153); // Pink
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.text('Cost per km', boxX + boxWidth / 2, boxY + 8, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs ${costPerKm.toFixed(2)}`, boxX + boxWidth / 2, boxY + 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('per kilometer', boxX + boxWidth / 2, boxY + 28, { align: 'center' });
  
  // Stops Box
  boxX += boxWidth + boxSpacing;
  doc.setFillColor(34, 197, 94); // Bright Green
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.text('Total Stops', boxX + boxWidth / 2, boxY + 8, { align: 'center' });
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${trip.stops.length}`, boxX + boxWidth / 2, boxY + 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('stops', boxX + boxWidth / 2, boxY + 28, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  yPos = boxY + boxHeight + 15;
  
  // Trip Summary Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Summary', 20, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Basic Info
  doc.text(`Status: ${trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}`, 20, yPos);
  yPos += 6;
  const lastStop = trip.stops[trip.stops.length - 1];
  doc.text(`Start Date: ${format(new Date(firstStop.timestamp), 'PPp')}`, 20, yPos);
  yPos += 6;
  if (trip.status === 'completed') {
    doc.text(`End Date: ${format(new Date(lastStop.timestamp), 'PPp')}`, 20, yPos);
    yPos += 6;
    const duration = lastStop.timestamp - firstStop.timestamp;
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    doc.text(`Trip Duration: ${days} day(s) ${hours} hour(s) ${minutes} minute(s)`, 20, yPos);
    yPos += 6;
  }
  
  // Distance & Energy Details
  doc.text(`Total Distance: ${trip.totalDistance.toFixed(1)} km`, 20, yPos);
  yPos += 6;
  doc.text(`Total Energy Consumed: ${trip.totalEnergyUsed.toFixed(2)} kWh`, 20, yPos);
  yPos += 6;
  doc.text(`Average Efficiency: ${efficiency} km/kWh`, 20, yPos);
  yPos += 6;
  
  // Battery Usage
  const batteryUsed = firstStop.batteryPercent - lastStop.batteryPercent;
  doc.text(`Battery Used: ${batteryUsed.toFixed(1)}% (${firstStop.batteryPercent}% -> ${lastStop.batteryPercent}%)`, 20, yPos);
  yPos += 6;
  
  // Charging Details
  const chargingSessions = trip.stops.filter(s => s.chargingSession).length;
  doc.text(`Number of Charging Sessions: ${chargingSessions}`, 20, yPos);
  yPos += 6;
  
  if (chargingSessions > 0) {
    const totalChargingTime = trip.stops.reduce((sum, stop) => {
      return sum + (stop.chargingSession?.duration || 0);
    }, 0);
    doc.text(`Total Charging Time: ${formatDuration(totalChargingTime)}`, 20, yPos);
    yPos += 6;
    
    const totalEnergyCharged = trip.stops.reduce((sum, stop) => {
      return sum + (stop.chargingSession ? calculateChargingEnergy(stop.chargingSession) : 0);
    }, 0);
    doc.text(`Total Energy Charged: ${totalEnergyCharged.toFixed(2)} kWh`, 20, yPos);
    yPos += 6;
    
    doc.text(`Total Charging Cost: Rs ${totalChargingCost.toFixed(2)}`, 20, yPos);
    yPos += 6;
    
    const avgCostPerKwh = totalEnergyCharged > 0 ? totalChargingCost / totalEnergyCharged : 0;
    doc.text(`Average Cost per kWh: Rs ${avgCostPerKwh.toFixed(2)}`, 20, yPos);
    yPos += 6;
    
    doc.text(`Cost per km: Rs ${costPerKm.toFixed(2)}`, 20, yPos);
    yPos += 6;
  }
  
  // Stop Details
  doc.text(`Total Stops: ${trip.stops.length}`, 20, yPos);
  
  // Add new page for details
  doc.addPage();
  yPos = 20;
  
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
    doc.text(index === 0 ? 'Starting Point' : `Stop ${index}`, 20, yPos);
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
      doc.text(`Cost: Rs ${session.cost.toFixed(2)} (Rs ${costPerKwh.toFixed(2)}/kWh)`, 30, yPos);
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
