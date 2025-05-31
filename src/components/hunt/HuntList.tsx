// src/components/hunt/HuntList.tsx
import React from 'react';
import { useHunts } from '../../hooks/useHunts';
import Card, { CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface HuntListProps {
  onSelectHunt: (huntId: string) => void;
}

const HuntList: React.FC<HuntListProps> = ({ onSelectHunt }) => {
  const { hunts, loading, error, refetch } = useHunts();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-red-800 font-medium mb-2">{error}</h3>
        <p className="text-red-700 mb-4">
          There was an error loading the hunts.
        </p>
        <Button
          variant="primary"
          onClick={refetch}
          icon={<RefreshCw size={16} />}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (hunts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-700">No hunts available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {hunts.map((hunt) => (
        <Card
          key={hunt.id}
          hover
          onClick={() => onSelectHunt(hunt.id)}
          className="cursor-pointer border border-[#D4AF37]/30 hover:border-[#D4AF37]"
        >
          <CardHeader className="border-b border-[#D4AF37]/20">
            <h3 className="font-serif text-xl text-[#1A3A5A]">{hunt.title}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{hunt.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {hunt.puzzles_count || 0} puzzles
              </span>
              <Button size="sm" variant="primary">
                Solve Hunt
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HuntList;
