'use client';

import { useState, useRef } from 'react';
import { Download, Upload, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { exportAllDataToJSON } from '@/utils/export';
import { exportAllData, importAllData, clearAllData } from '@/utils/storage';
import { parseAndValidateJSON } from '@/utils/validation';
import { useSettings } from '@/contexts/SettingsContext';
import { format } from 'date-fns';

export default function DataManagement() {
  const { settings, updateSettings } = useSettings();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    details?: string[];
  }>({ show: false, success: false, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    const data = exportAllData();
    exportAllDataToJSON(data);
    
    // Update last backup date
    updateSettings({ lastBackupDate: Date.now() });
    
    // Show success message
    setImportStatus({
      show: true,
      success: true,
      message: 'Data exported successfully!',
      details: [
        `${data.vehicles.length} vehicle(s)`,
        `${data.trips.length} trip(s)`,
      ],
    });
    
    setTimeout(() => setImportStatus({ show: false, success: false, message: '' }), 5000);
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validate the file
      const validationResult = await parseAndValidateJSON(file);
      
      if (!validationResult.success) {
        setImportStatus({
          show: true,
          success: false,
          message: validationResult.message,
          details: validationResult.errors,
        });
        return;
      }

      // Parse and import the data
      const text = await file.text();
      const data = JSON.parse(text);
      
      importAllData(data);
      
      // Update last backup date
      updateSettings({ lastBackupDate: Date.now() });
      
      setImportStatus({
        show: true,
        success: true,
        message: 'Data imported successfully!',
        details: [
          `${validationResult.vehiclesImported} vehicle(s) imported`,
          `${validationResult.tripsImported} trip(s) imported`,
        ],
      });
      
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setImportStatus({
        show: true,
        success: false,
        message: 'Failed to import data',
        details: [error instanceof Error ? error.message : 'Unknown error'],
      });
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    
    setImportStatus({
      show: true,
      success: true,
      message: 'All data cleared successfully!',
    });
    
    // Reload the page to reflect changes
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Data Management</h3>
        <p className="text-sm opacity-70 mb-4">
          Export, import, or clear your trip and vehicle data
        </p>
      </div>

      {/* Status Alert */}
      {importStatus.show && (
        <div
          className={`alert ${
            importStatus.success ? 'alert-success' : 'alert-error'
          } shadow-lg`}
        >
          <div className="flex items-start gap-2">
            {importStatus.success ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-semibold">{importStatus.message}</div>
              {importStatus.details && importStatus.details.length > 0 && (
                <ul className="text-sm mt-1 list-disc list-inside">
                  {importStatus.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Last Backup Info */}
      {settings.lastBackupDate && (
        <div className="alert alert-info">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">
              Last backup: {format(new Date(settings.lastBackupDate), 'PPp')}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export Data */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-success" />
              <h4 className="font-semibold">Export Data</h4>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Download all your data as a JSON backup file
            </p>
            <button onClick={handleExportData} className="btn btn-success btn-sm">
              <Download className="h-4 w-4" />
              Export to JSON
            </button>
          </div>
        </div>

        {/* Import Data */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="h-5 w-5 text-info" />
              <h4 className="font-semibold">Import Data</h4>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Restore data from a previously exported JSON file
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file" className="btn btn-info btn-sm cursor-pointer">
              <Upload className="h-4 w-4" />
              Import from JSON
            </label>
          </div>
        </div>

        {/* Clear Data */}
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="h-5 w-5 text-error" />
              <h4 className="font-semibold">Clear Data</h4>
            </div>
            <p className="text-sm opacity-70 mb-4">
              Delete all vehicles and trips from the app
            </p>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn btn-error btn-sm"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-error" />
              <h3 className="font-bold text-lg">Confirm Data Deletion</h3>
            </div>
            <p className="py-4">
              Are you sure you want to delete all data? This action cannot be undone.
              All vehicles, trips, and settings will be permanently removed.
            </p>
            <div className="alert alert-warning mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                Make sure you have exported your data before proceeding!
              </span>
            </div>
            <div className="modal-action">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button onClick={handleClearData} className="btn btn-error">
                <Trash2 className="h-4 w-4" />
                Yes, Delete All Data
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowClearConfirm(false)}></div>
        </div>
      )}

      {/* Information */}
      <div className="alert">
        <AlertTriangle className="h-5 w-5" />
        <div className="text-sm">
          <div className="font-semibold mb-1">Important Notes:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Export your data regularly to prevent data loss</li>
            <li>Importing data will replace all existing data</li>
            <li>Keep your backup files in a safe location</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
