import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Download,
  Database,
  ArrowRight,
  Info,
  RefreshCw,
  Copy,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../components/Common/GlassCard';
import { weatherApi } from '../api/weatherApi';
import { useTheme } from '../context/ThemeContext';

export default function DataImport({ onImportSuccess, onNavigateTab }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fileInputRef = useRef(null);
  const { theme } = useTheme();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg('Please select a valid CSV file (.csv).');
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    setValidationResult(null);
    setImportSuccess(null);
    setIsValidating(true);

    try {
      const res = await weatherApi.uploadAndValidate(file);
      if (res.success) {
        setValidationResult(res.validation);
      } else {
        setErrorMsg(res.error || 'Failed to validate CSV file.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Validation request failed.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || !validationResult.valid_records?.length) return;

    setImporting(true);
    setErrorMsg(null);

    try {
      const payload = {
        filename: validationResult.filename || selectedFile?.name || 'dataset.csv',
        file_size_bytes: validationResult.file_size_bytes || selectedFile?.size || 0,
        total_rows: validationResult.total_rows,
        invalid_rows: validationResult.invalid_rows,
        duplicate_rows: validationResult.duplicate_rows,
        records: validationResult.valid_records,
        issues: validationResult.issues || []
      };

      const res = await weatherApi.confirmImport(payload);
      if (res.success) {
        setImportSuccess(res);
        setShowConfirmModal(false);
        if (onImportSuccess) onImportSuccess();
      } else {
        setErrorMsg(res.error || 'Database import transaction failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTextFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header Notice */}
      <GlassCard className="p-6 border-violet-500/25">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-violet-400" />
              Meteorological Data Ingestion & Quality Gate
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Every row is rigorously validated against terrestrial atmospheric physical limits.
              Missing measurements are preserved as NULL without artificial zero-padding.
            </p>
          </div>

          <a
            id="download-sample-template-btn"
            href={weatherApi.getSampleDownloadUrl()}
            download="sample_weather_data.csv"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all whitespace-nowrap shadow-sm"
          >
            <Download className="w-4 h-4 text-violet-400" />
            <span>Download Sample CSV</span>
          </a>
        </div>
      </GlassCard>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 min-w-5 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Validation Error:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* Success Banner */}
      {importSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-emerald-950/30">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 min-w-6" />
            <div>
              <div className="font-bold text-white text-base">Import Completed Successfully</div>
              <div className="text-xs text-emerald-200/80">
                {importSuccess.message} (Import ID: #{importSuccess.import_id})
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('records')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-bold text-xs transition-all shadow-md"
          >
            <span>View Records in Database</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {!validationResult && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-violet-400 bg-violet-500/10 scale-[1.01] shadow-2xl'
              : 'border-white/10 hover:border-violet-500/40 bg-[#0A0D16]/60 hover:bg-[#0A0D16]/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/30 via-indigo-600/30 to-emerald-500/30 border border-violet-500/30 flex items-center justify-center mx-auto mb-4 text-violet-400 shadow-xl shadow-violet-950/40">
            {isValidating ? (
              <RefreshCw className="w-8 h-8 animate-spin text-violet-400" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {isValidating
              ? 'Validating Atmospheric Observations...'
              : 'Drag & Drop your Weather CSV here, or browse files'}
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
            Supports CSV files up to 50MB. Expected schema: <code className="text-violet-300 font-mono">observation_date, location, temperature, humidity, rainfall</code>
          </p>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-semibold shadow-sm">
            Choose CSV from Computer
          </span>
        </div>
      )}

      {/* Validation Results & Preview View */}
      {validationResult && (
        <div className="space-y-6">
          {/* File Info & Action Ribbon */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-violet-400" />
              <div>
                <div className="font-bold text-white text-sm">
                  {validationResult.filename}
                </div>
                <div className="text-[11px] text-gray-400">
                  Size: {(validationResult.file_size_bytes / 1024).toFixed(1)} KB • Total Rows: {validationResult.total_rows}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setValidationResult(null);
                  setSelectedFile(null);
                  setImportSuccess(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10"
              >
                Upload Different File
              </button>

              {validationResult.cleaned_csv && (
                <button
                  onClick={() => downloadTextFile(validationResult.cleaned_csv, `cleaned_${validationResult.filename}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  Cleaned CSV
                </button>
              )}

              {validationResult.report_csv && (
                <button
                  onClick={() => downloadTextFile(validationResult.report_csv, `error_report_${validationResult.filename}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  Validation Report
                </button>
              )}

              <button
                id="btn-confirm-import"
                onClick={() => setShowConfirmModal(true)}
                disabled={!validationResult.can_import || importing}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-violet-950/50 disabled:opacity-50 transition-all"
              >
                <Database className="w-4 h-4 text-white" />
                <span>Confirm Import to Database ({validationResult.valid_rows})</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards for Validation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <GlassCard className="p-4 border-l-4 border-l-violet-500">
              <span className="text-[11px] uppercase font-bold text-gray-400">Total Rows</span>
              <div className="text-2xl font-extrabold text-white mt-1">{validationResult.total_rows}</div>
              <span className="text-[11px] text-gray-400">Processed</span>
            </GlassCard>

            <GlassCard className="p-4 border-l-4 border-l-emerald-400">
              <span className="text-[11px] uppercase font-bold text-emerald-400">Valid Rows</span>
              <div className="text-2xl font-extrabold text-emerald-300 mt-1">{validationResult.valid_rows}</div>
              <span className="text-[11px] text-gray-400">Ready for import</span>
            </GlassCard>

            <GlassCard className="p-4 border-l-4 border-l-rose-500">
              <span className="text-[11px] uppercase font-bold text-rose-400">Invalid Rows</span>
              <div className="text-2xl font-extrabold text-rose-300 mt-1">{validationResult.invalid_rows}</div>
              <span className="text-[11px] text-gray-400">Fatal errors</span>
            </GlassCard>

            <GlassCard className="p-4 border-l-4 border-l-amber-400">
              <span className="text-[11px] uppercase font-bold text-amber-400">Duplicate Rows</span>
              <div className="text-2xl font-extrabold text-amber-300 mt-1">{validationResult.duplicate_rows}</div>
              <span className="text-[11px] text-gray-400">Pre-existing</span>
            </GlassCard>
          </div>

          {/* Missing Values & Quality Breakdowns */}
          <GlassCard className="p-5">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-violet-400" />
              Missing Measurement Details (Preserved as NULL, Not Zeroed)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400">Missing Temp:</span>
                <span className="ml-2 font-mono font-bold text-white">{validationResult.missing_values?.temperature || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400">Missing Humidity:</span>
                <span className="ml-2 font-mono font-bold text-white">{validationResult.missing_values?.humidity || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400">Missing Rainfall:</span>
                <span className="ml-2 font-mono font-bold text-white">{validationResult.missing_values?.rainfall || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400">Out of Range:</span>
                <span className="ml-2 font-mono font-bold text-amber-400">{validationResult.issues_by_type?.OUT_OF_RANGE || 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400">Negative Rainfall:</span>
                <span className="ml-2 font-mono font-bold text-rose-400">{validationResult.issues_by_type?.NEGATIVE_RAINFALL || 0}</span>
              </div>
            </div>
          </GlassCard>

          {/* First 20 Rows Preview Table */}
          <GlassCard className="p-5">
            <h4 className="text-sm font-bold text-white mb-3">
              Data Preview (First 20 Observations)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 uppercase text-gray-400 font-semibold border-b border-white/5">
                  <tr>
                    <th className="p-2.5">Row</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Station</th>
                    <th className="p-2.5">Temp (°C)</th>
                    <th className="p-2.5">Humidity (%)</th>
                    <th className="p-2.5">Rainfall (mm)</th>
                    <th className="p-2.5">Validation Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {validationResult.preview?.map((row) => (
                    <tr key={row.row_number} className="hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-mono text-gray-500">#{row.row_number}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            row.status === 'valid'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : row.status === 'warning'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-medium text-white">{row.observation_date || '--'}</td>
                      <td className="p-2.5 text-violet-300 font-medium">{row.location || '--'}</td>
                      <td className="p-2.5 text-rose-300 font-bold">{row.temperature || <span className="text-gray-500">NULL</span>}</td>
                      <td className="p-2.5 text-emerald-300 font-bold">{row.humidity || <span className="text-gray-500">NULL</span>}</td>
                      <td className="p-2.5 text-amber-300 font-bold">{row.rainfall || <span className="text-gray-500">NULL</span>}</td>
                      <td className="p-2.5 text-[11px] text-gray-400 max-w-xs truncate">
                        {row.issues?.length ? row.issues.join('; ') : 'Passed all physical checks'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 border border-violet-500/40 shadow-2xl relative animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4 shadow-lg shadow-violet-950/40">
              <Database className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Confirm Weather Dataset Import
            </h3>
            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              You are about to insert <strong className="text-violet-300 font-semibold">{validationResult?.valid_rows} verified observations</strong> into the permanent database.
            </p>

            <div className="p-3.5 rounded-xl bg-[#090C16] border border-white/5 space-y-1.5 text-xs text-gray-300 mb-6">
              <div className="flex justify-between">
                <span>File Name:</span>
                <span className="font-semibold text-white">{validationResult?.filename}</span>
              </div>
              <div className="flex justify-between">
                <span>Valid Records to Insert:</span>
                <span className="font-semibold text-emerald-400">{validationResult?.valid_rows}</span>
              </div>
              <div className="flex justify-between">
                <span>Rejected Invalid Rows:</span>
                <span className="font-semibold text-rose-400">{validationResult?.invalid_rows}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={importing}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10"
              >
                Cancel
              </button>
              <button
                id="modal-confirm-import-btn"
                onClick={handleConfirmImport}
                disabled={importing}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-950/50 disabled:opacity-50"
              >
                {importing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{importing ? 'Writing to Database...' : 'Commit to Database'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
