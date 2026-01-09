import { Modal } from '../ui/modal';

interface LicenseKeyModalProps {
  showLicenseModal: boolean;
  setShowLicenseModal: (show: boolean) => void;
  licenseKey: string;
  setLicenseKey: (key: string) => void;
  handleSaveLicenseKey: () => void;
}

export default function LicenseKeyModal({
  showLicenseModal,
  setShowLicenseModal,
  licenseKey,
  setLicenseKey,
  handleSaveLicenseKey
}: LicenseKeyModalProps) {
  return (
    <Modal isOpen={showLicenseModal} onClose={() => setShowLicenseModal(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold dark:text-white mb-4">Enter License Key</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Enter your license key to unlock premium features.
        </p>
        <input
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowLicenseModal(false)}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveLicenseKey}
            disabled={!licenseKey.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}