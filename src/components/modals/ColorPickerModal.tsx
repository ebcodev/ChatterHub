import { Folder } from 'lucide-react';
import { Modal } from '../ui/modal';

interface ColorPickerModalProps {
  showColorPicker: string | null;
  setShowColorPicker: (value: string | null) => void;
  handleSetFolderColor: (folderId: string, color: string) => void;
  getFolderColorClasses: (color?: string) => { icon: string; bg: string; text: string; selectedBg: string };
}

const tailwindColors = [
  { name: 'Default', value: '' },
  { name: 'Red', value: 'red' },
  { name: 'Orange', value: 'orange' },
  { name: 'Yellow', value: 'yellow' },
  { name: 'Green', value: 'green' },
  { name: 'Blue', value: 'blue' },
  { name: 'Indigo', value: 'indigo' },
  { name: 'Purple', value: 'purple' },
  { name: 'Pink', value: 'pink' },
  { name: 'Gray', value: 'gray' },
];

export default function ColorPickerModal({
  showColorPicker,
  setShowColorPicker,
  handleSetFolderColor,
  getFolderColorClasses
}: ColorPickerModalProps) {
  return (
    <Modal isOpen={showColorPicker !== null} onClose={() => setShowColorPicker(null)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-sm">
        <h3 className="text-base sm:text-lg font-semibold dark:text-white mb-3 sm:mb-4">Choose Folder Color</h3>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
          {tailwindColors.map((color) => (
            <button
              key={color.value}
              onClick={() => showColorPicker && handleSetFolderColor(showColorPicker, color.value)}
              className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Folder className={`h-6 w-6 sm:h-8 sm:w-8 ${color.value ? getFolderColorClasses(color.value).icon : 'text-gray-600 dark:text-gray-400'}`} />
              <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{color.name}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button
            onClick={() => setShowColorPicker(null)}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}