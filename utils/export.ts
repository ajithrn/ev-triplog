import { Trip, Vehicle, Stop } from '@/types';
import { parse } from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { getEfficiencyRating, calculateICESavings } from './analyticsHelpers';

/**
 * Export trip to CSV
 */
export function exportTripToCSV(trip: Trip, vehicle: Vehicle): void {
  const stretches = calculateTripStretches(trip.stops);
  
  // Calculate aggregated stats for summary
  const totalChargingCost = trip.stops.reduce((sum, stop) => {
    return sum + (stop.chargingSession?.cost || 0);
  }, 0);
  const costPerKm = trip.totalDistance > 0 ? totalChargingCost / trip.totalDistance : 0;
  const savings = calculateICESavings(trip.totalDistance, totalChargingCost);
  const efficiencyKmPerKwh = trip.averageEfficiency > 0 ? 1 / trip.averageEfficiency : 0;

  // Prepare CSV data
  const csvData = [];

  // Add Summary Section
  csvData.push(['EV TRIP REPORT']);
  csvData.push(['Trip Name', trip.name]);
  csvData.push(['Vehicle', `${vehicle.name} (${vehicle.make} ${vehicle.model})`]);
  csvData.push(['Date', format(new Date(trip.startDate), 'yyyy-MM-dd')]);
  csvData.push(['Status', trip.status]);
  csvData.push([]); // Empty row
  
  csvData.push(['PERFORMANCE METRICS']);
  csvData.push(['Total Distance (km)', trip.totalDistance.toFixed(1)]);
  csvData.push(['Total Energy (kWh)', trip.totalEnergyUsed.toFixed(2)]);
  csvData.push(['Avg Efficiency (km/kWh)', efficiencyKmPerKwh.toFixed(2)]);
  csvData.push(['Total Cost (Rs)', totalChargingCost.toFixed(2)]);
  csvData.push(['Cost per km (Rs)', costPerKm.toFixed(2)]);
  csvData.push(['Est. Savings vs ICE (Rs)', savings.savings.toFixed(2)]);
  csvData.push([]); // Empty row

  // Add Detailed Log Header
  csvData.push(['DETAILED TRIP LOG']);
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
  
  // Calculate aggregated stats
  const totalChargingCost = trip.stops.reduce((sum, stop) => {
    return sum + (stop.chargingSession?.cost || 0);
  }, 0);
  const costPerKm = trip.totalDistance > 0 ? totalChargingCost / trip.totalDistance : 0;
  
  const totalEnergyCharged = trip.stops.reduce((sum, stop) => {
    return sum + (stop.chargingSession ? calculateChargingEnergy(stop.chargingSession) : 0);
  }, 0);
  
  const chargingSessions = trip.stops.filter(s => s.chargingSession).length;
  const efficiencyKmPerKwh = trip.averageEfficiency > 0 ? 1 / trip.averageEfficiency : 0;
  
  // Calculate km/%
  const kwhPerPercent = vehicle.batteryCapacity / 100;
  const kmPerPercent = efficiencyKmPerKwh * kwhPerPercent;

  // Calculate Avg Cost per kWh
  const avgCostPerKwh = totalEnergyCharged > 0 ? totalChargingCost / totalEnergyCharged : 0;
  
  // Analytics
  const efficiencyRating = getEfficiencyRating(efficiencyKmPerKwh);
  const savings = calculateICESavings(trip.totalDistance, totalChargingCost);
  
  let yPos = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  // Header with Logo/Brand
  doc.setFillColor(31, 41, 55); // Dark Gray
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('EV TRIP REPORT', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), 'MMMM d, yyyy'), pageWidth / 2, 30, { align: 'center' });
  
  yPos = 55;
  doc.setTextColor(0, 0, 0);

  // Vehicle & Trip Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Overview', 14, yPos);
  
  const firstStop = trip.stops[0];
  const lastStop = trip.stops[trip.stops.length - 1];
  const duration = lastStop.timestamp - firstStop.timestamp;
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Trip Name', 'Vehicle', 'Date', 'Duration']],
    body: [[
      trip.name,
      `${vehicle.name} (${vehicle.make} ${vehicle.model})`,
      format(new Date(trip.startDate), 'MMM d, yyyy'),
      `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m`
    ]],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [243, 244, 246], textColor: 0, fontStyle: 'bold' }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Key Performance Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Metrics', 14, yPos);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Metric', 'Value', 'Rating/Notes']],
    body: [
      ['Total Distance', `${trip.totalDistance.toFixed(1)} km`, ''],
      ['Energy Consumed', `${trip.totalEnergyUsed.toFixed(2)} kWh`, ''],
      ['Efficiency', `${efficiencyKmPerKwh.toFixed(2)} km/kWh (${kmPerPercent.toFixed(2)} km/%)`, efficiencyRating.rating],
      ['Total Cost', `Rs ${totalChargingCost.toFixed(2)}`, `Rs ${costPerKm.toFixed(2)}/km`],
      ['Est. Savings', `Rs ${savings.savings.toFixed(2)}`, ''] // Empty string as placeholder
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 60 },
      2: { fontStyle: 'italic' }
    },
    didDrawCell: (data) => {
      // Custom render for Est. Savings note to mix font sizes
      if (data.section === 'body' && data.row.index === 4 && data.column.index === 2) {
        const { doc, cell } = data;
        const x = cell.x + cell.padding('left');
        const y = cell.y + cell.height / 2 + 1; // Approximate vertical center

        // Draw "vs ICE"
        doc.setFontSize(10);
        doc.text('vs ICE ', x, y);
        
        // Draw bracket text smaller
        const textWidth = doc.getTextWidth('vs ICE ');
        doc.setFontSize(7);
        doc.text('(At Rs 100/liter, 15 km/l)', x + textWidth, y);
      }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Charging Summary
  if (chargingSessions > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Charging Summary', 14, yPos);

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Metric', 'Value']],
      body: [
        ['Sessions', `${chargingSessions}`],
        ['Energy Charged', `${totalEnergyCharged.toFixed(2)} kWh`],
        ['Total Cost', `Rs ${totalChargingCost.toFixed(2)}`],
        ['Avg Cost per kWh', `Rs ${avgCostPerKwh.toFixed(2)}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22], textColor: 255 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Detailed Trip Log
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Trip Log', 14, 20);

  const tableData = trip.stops.map((stop, index) => {
    const stretch = index > 0 ? stretches[index - 1] : null;
    const chargingInfo = stop.chargingSession 
      ? `Charge: +${(stop.chargingSession.endKwh - stop.chargingSession.startKwh).toFixed(1)} kWh (Rs ${stop.chargingSession.cost})`
      : '';
    
    return [
      `Stop ${index + 1}`,
      stop.location || '-',
      format(new Date(stop.timestamp), 'HH:mm'),
      `${stop.odometer} km`,
      `${stop.batteryPercent}%`,
      stretch ? `${stretch.distance.toFixed(1)} km` : '-',
      stretch ? `${stretch.efficiencyKmPerKwh.toFixed(2)}` : '-',
      chargingInfo
    ];
  });

  autoTable(doc, {
    startY: 25,
    head: [['#', 'Location', 'Time', 'Odo', 'Batt', 'Dist', 'Eff', 'Notes/Charging']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [31, 41, 55], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 35 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 15 },
      5: { cellWidth: 20 },
      6: { cellWidth: 15 },
      7: { cellWidth: 'auto' }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} - Generated by EV Trip Log`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

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
