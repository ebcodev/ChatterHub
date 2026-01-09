import { X } from 'lucide-react';
import { Modal } from '../ui/modal';
import HeroSection from './welcome/HeroSection';
import FeaturesGrid from './welcome/FeaturesGrid';
import QuickStartSection from './welcome/QuickStartSection';
import BenefitsSection from './welcome/BenefitsSection';
import CTASection from './welcome/CTASection';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative bg-white dark:bg-gray-800 rounded-xl w-[900px] max-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header with close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <HeroSection />
          
          {/* Features Grid */}
          <FeaturesGrid />
          
          {/* Quick Start Guide */}
          <QuickStartSection />
          
          {/* Benefits Section */}
          <BenefitsSection />
          
          {/* CTA Section */}
          <CTASection onClose={onClose} />
        </div>
      </div>
    </Modal>
  );
}