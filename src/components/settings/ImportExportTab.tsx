'use client';

import { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, Loader2, FileUp, Image, File, FileText, Check } from 'lucide-react';
import { ChatGPTImporter, ImportOptions, ImportProgress } from '@/lib/import/chatgpt-import';
import { ChatterHubImporter, ChatterHubImportOptions, ChatterHubImportProgress, ChatterHubImportResult } from '@/lib/import/chatterhub-import';
import { ChatterHubExporter, ExportProgress, ExportOptions } from '@/lib/export/chatterhub-export';
import { db } from '@/lib/db';

interface ImportExportTabProps { }

export default function ImportExportTab({ }: ImportExportTabProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<{ exportData: any; conversations: any[] } | null>(null);
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    organizationStrategy: 'by-month',
    skipArchived: true,
    includeImages: true,
  });

  // ChatterHub import state
  const [isChatterHubImporting, setIsChatterHubImporting] = useState(false);
  const [chatterHubImportProgress, setChatterHubImportProgress] = useState<ChatterHubImportProgress | null>(null);
  const [chatterHubImportResult, setChatterHubImportResult] = useState<ChatterHubImportResult | null>(null);
  // Always merge with existing data and generate new IDs
  const ChatterHubImportOptions: ChatterHubImportOptions = {
    mergeMode: 'merge',
    preserveIds: false,
  };

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatterHubFileInputRef = useRef<HTMLInputElement>(null);
  const importer = useRef<ChatGPTImporter | null>(null);
  const chatterHubImporter = useRef<ChatterHubImporter | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsParsing(true);
    setParsedData(null);
    setSelectedConversations([]);
    setImportResult(null);

    try {
      importer.current = new ChatGPTImporter();

      // Parse the export file
      const exportData = await importer.current.parseExportFile(file);

      // Filter conversations based on skip archived option
      const filteredConversations = exportData.conversations.filter(conv => {
        if (importOptions.skipArchived && conv.is_archived) return false;
        return true;
      });

      setParsedData({ exportData, conversations: filteredConversations });
      // Select all by default
      setSelectedConversations(filteredConversations.map(c => c.conversation_id));
    } catch (error) {
      console.error('Failed to parse file:', error);
      setImportResult({
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Failed to parse export file'],
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData || selectedConversations.length === 0) return;

    setIsImporting(true);
    setImportProgress(null);
    setImportResult(null);

    try {
      // Filter to only selected conversations
      const selectedExportData = {
        ...parsedData.exportData,
        conversations: parsedData.exportData.conversations.filter((c: any) =>
          selectedConversations.includes(c.conversation_id)
        )
      };

      // Import selected conversations
      const result = await importer.current!.importConversations(
        selectedExportData,
        importOptions,
        (progress) => setImportProgress(progress)
      );

      setImportResult(result);
      // Clear parsed data after successful import
      setParsedData(null);
      setSelectedConversations([]);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      });
    } finally {
      importer.current?.cleanup();
      setIsImporting(false);
    }
  };

  const handleChatterHubImport = async (file: File) => {
    setIsChatterHubImporting(true);
    setChatterHubImportProgress(null);
    setChatterHubImportResult(null);

    try {
      chatterHubImporter.current = new ChatterHubImporter();

      // Parse the export file
      setChatterHubImportProgress({
        total: 0,
        current: 0,
        phase: 'parsing',
      });

      const chatGroups = await chatterHubImporter.current.parseExportFile(file);

      // Import data
      const result = await chatterHubImporter.current.importData(
        chatGroups,
        ChatterHubImportOptions,
        (progress) => setChatterHubImportProgress(progress)
      );

      setChatterHubImportResult(result);
    } catch (error) {
      console.error('ChatterHub import failed:', error);
      setChatterHubImportResult({
        imported: {
          folders: 0,
          chatGroups: 0,
          chats: 0,
          messages: 0,
          images: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      });
    } finally {
      chatterHubImporter.current?.cleanup();
      setIsChatterHubImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(null);

    try {
      const exporter = new ChatterHubExporter();

      const blob = await exporter.exportAll(
        { includeImages: true },
        (progress) => setExportProgress(progress)
      );

      // Download the zip file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatterhub-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const getProgressMessage = () => {
    if (!importProgress) return '';

    switch (importProgress.phase) {
      case 'parsing':
        return 'Parsing export file...';
      case 'importing':
        return `Importing conversation ${importProgress.current} of ${importProgress.total}: ${importProgress.currentConversation || ''}`;
      case 'images':
        return 'Processing images...';
      case 'complete':
        return 'Import complete!';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Import from ChatGPT</h3>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">How to export from ChatGPT:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to ChatGPT Settings → Data controls</li>
                <li>Click "Export data"</li>
                <li>Download the ZIP file when ready</li>
                <li>Upload the ZIP file here</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Import Options */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization</label>
            <select
              value={importOptions.organizationStrategy}
              onChange={(e) => setImportOptions({ ...importOptions, organizationStrategy: e.target.value as any })}
              disabled={isImporting}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="root">All in root folder</option>
              <option value="flat">All in one folder</option>
              <option value="by-month">Organize by month</option>
              <option value="by-year">Organize by year</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importOptions.skipArchived}
                onChange={(e) => setImportOptions({ ...importOptions, skipArchived: e.target.checked })}
                disabled={isImporting}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Skip archived chats</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importOptions.includeImages}
                onChange={(e) => setImportOptions({ ...importOptions, includeImages: e.target.checked })}
                disabled={isImporting}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include images</span>
            </label>
          </div>
        </div>

        {/* File Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        <div className="space-y-4">
          {/* Step 1: Select File */}
          {!parsedData && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isParsing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {isParsing ? 'Parsing file...' : 'Select ChatGPT Export File'}
            </button>
          )}

          {/* Step 2: Select Conversations */}
          {parsedData && !isImporting && (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Found {parsedData.conversations.length} conversations. Select which ones to import:
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (selectedConversations.length === parsedData.conversations.length) {
                        setSelectedConversations([]);
                      } else {
                        setSelectedConversations(parsedData.conversations.map(c => c.conversation_id));
                      }
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2"
                  >
                    {selectedConversations.length === parsedData.conversations.length ? 'Deselect All' : 'Select All'}
                  </button>

                  {parsedData.conversations.map((conv) => (
                    <label key={conv.conversation_id} className="flex items-start gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <input
                        type="checkbox"
                        checked={selectedConversations.includes(conv.conversation_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedConversations([...selectedConversations, conv.conversation_id]);
                          } else {
                            setSelectedConversations(selectedConversations.filter(id => id !== conv.conversation_id));
                          }
                        }}
                        className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {conv.title || 'Untitled Conversation'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conv.create_time * 1000).toLocaleDateString()}
                          {conv.is_archived && ' • Archived'}
                          {conv.is_starred && ' • ⭐'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleImport}
                  disabled={selectedConversations.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Import {selectedConversations.length} Selected
                </button>

                <button
                  onClick={() => {
                    setParsedData(null);
                    setSelectedConversations([]);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress Display */}
        {importProgress && !importResult && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{getProgressMessage()}</span>
            </div>
            {importProgress.total > 0 && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className={`mt-4 p-3 rounded-lg ${importResult.errors.length > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
            <div className="flex items-start gap-2">
              {importResult.errors.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  Import complete: {importResult.imported} conversations imported, {importResult.skipped} skipped
                </p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 text-red-700 dark:text-red-300">
                    <p className="font-medium">Errors:</p>
                    <ul className="list-disc list-inside mt-1">
                      {importResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                    {importResult.errors.length > 5 && (
                      <p className="mt-1 text-xs">And {importResult.errors.length - 5} more...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import from ChatterHub Section */}
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Import from ChatterHub</h3>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Import a previously exported ChatterHub backup file. This will restore your chats, folders, and attachments.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Importing will merge with your existing data. All imported items will get new IDs to avoid conflicts.
            </p>
          </div>
        </div>

        {/* File Upload */}
        <input
          ref={chatterHubFileInputRef}
          type="file"
          accept=".zip"
          onChange={(e) => e.target.files?.[0] && handleChatterHubImport(e.target.files[0])}
          className="hidden"
        />

        {/* Show button only when not importing */}
        {!isChatterHubImporting && !chatterHubImportResult && (
          <button
            onClick={() => chatterHubFileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import ChatterHub Backup
          </button>
        )}

        {/* Progress Display - shows during import */}
        {isChatterHubImporting && chatterHubImportProgress && !chatterHubImportResult && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {chatterHubImportProgress.phase === 'parsing' ? 'Parsing backup file...' :
                  chatterHubImportProgress.total > 0 ?
                    `Importing item ${chatterHubImportProgress.current} of ${chatterHubImportProgress.total}: ${chatterHubImportProgress.currentItem || 'data'}` :
                    `Importing ${chatterHubImportProgress.currentItem || 'data'}...`}
              </span>
            </div>
            {chatterHubImportProgress.total > 0 && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(chatterHubImportProgress.current / chatterHubImportProgress.total) * 100}%` }}
                />
              </div>
            )}
            {chatterHubImportProgress.total > 0 && chatterHubImportProgress.phase !== 'parsing' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round((chatterHubImportProgress.current / chatterHubImportProgress.total) * 100)}% complete
              </p>
            )}
          </div>
        )}

        {/* Import Results */}
        {chatterHubImportResult && (
          <div className={`mt-4 p-3 rounded-lg ${chatterHubImportResult.errors.length > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
            <div className="flex items-start gap-2">
              {chatterHubImportResult.errors.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  Import complete:
                </p>
                <ul className="mt-1 text-gray-700 dark:text-gray-300">
                  <li>• {chatterHubImportResult.imported.folders} folders</li>
                  <li>• {chatterHubImportResult.imported.chatGroups} chat groups</li>
                  <li>• {chatterHubImportResult.imported.messages} messages</li>
                  {chatterHubImportResult.imported.images > 0 && (
                    <li>• {chatterHubImportResult.imported.images} images</li>
                  )}
                </ul>
                {chatterHubImportResult.errors.length > 0 && (
                  <div className="mt-2 text-red-700 dark:text-red-300">
                    <p className="font-medium">Errors:</p>
                    <ul className="list-disc list-inside mt-1">
                      {chatterHubImportResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                    {chatterHubImportResult.errors.length > 5 && (
                      <p className="mt-1 text-xs">And {chatterHubImportResult.errors.length - 5} more...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="border-t dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Export Data</h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Export all your conversations, folders, and attachments to a ZIP file for backup or migration.
          Each chat group will be saved as a folder with its messages and attachments.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">Export time depends on your data size:</p>
              <ul className="list-disc list-inside mt-1 ml-2">
                <li>Small (under 50 chats): A few seconds</li>
                <li>Medium (50-200 chats): 30-60 seconds</li>
                <li>Large (200+ chats with images): 2-5 minutes</li>
              </ul>
              <p className="mt-2">The export will continue even if this window is closed.</p>
            </div>
          </div>
        </div>

        {/* Export Button */}
        {!isExporting && (
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        )}

        {/* Export Progress - shows during export */}
        {isExporting && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {!exportProgress ? 'Starting export...' :
                    exportProgress.phase === 'preparing' ? 'Preparing your data for export...' :
                      exportProgress.phase === 'exporting' ?
                        `Processing your chats... (${exportProgress.current} of ${exportProgress.total})` :
                        exportProgress.phase === 'packaging' ? 'Compressing files into ZIP archive...' :
                          'Export complete! Your download should start automatically.'}
                </p>
                {exportProgress && exportProgress.phase === 'exporting' && exportProgress.currentItem && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Current: {exportProgress.currentItem}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}