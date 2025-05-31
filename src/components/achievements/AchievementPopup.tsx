import React from 'react';
import { Trophy } from 'lucide-react';

interface AchievementPopupProps {
  title: string;
  description: string;
  points: number;
  onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({
  title,
  description,
  points,
  onClose
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-[#D4AF37] p-4 max-w-sm animate-slide-up">
      <div className="flex items-start">
        <div className="bg-[#D4AF37]/10 p-3 rounded-full mr-3">
          <Trophy className="w-6 h-6 text-[#D4AF37]" />
        </div>
        
        <div>
          <h3 className="font-medium text-[#1A3A5A]">Achievement Unlocked!</h3>
          <p className="text-lg font-medium text-[#D4AF37] mb-1">{title}</p>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <p className="text-sm font-medium text-[#1A3A5A]">+{points} points</p>
        </div>
        
        <button 
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AchievementPopup;