// src/components/achievements/AchievementCard.tsx
import React from 'react';
import { Achievement } from '../../types';
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/Card';
import { Award, CheckCircle, Lock } from 'lucide-react'; // Assuming you have lucide-react

interface AchievementCardProps {
  achievement: Achievement;
  isEarned?: boolean;
  earnedAt?: string | null;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isEarned = false,
  earnedAt,
}) => {
  // Placeholder for dynamic icon based on achievement.icon_name
  const IconComponent = Award; // Default

  return (
    <Card
      className={`transition-all duration-300 ${
        isEarned
          ? 'border-green-500 bg-green-50/50 shadow-lg'
          : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
      }`}
    >
      <CardContent className="p-4 flex items-center space-x-4">
        <div
          className={`p-3 rounded-full ${
            isEarned ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {isEarned ? <CheckCircle size={28} /> : <Lock size={28} />}
          {/* <IconComponent size={28} /> // TODO: Implement dynamic icon loading */}
        </div>
        <div className="flex-1">
          <CardTitle
            className={`text-md font-semibold ${
              isEarned ? 'text-green-700' : 'text-slate-700'
            }`}
          >
            {achievement.title}
          </CardTitle>
          <CardDescription
            className={`text-xs ${
              isEarned ? 'text-green-600' : 'text-slate-500'
            }`}
          >
            {achievement.description}
          </CardDescription>
          {isEarned && earnedAt && (
            <p className="text-xs text-slate-400 mt-1">
              Earned: {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
          {achievement.points_reward && achievement.points_reward > 0 && (
            <p
              className={`text-xs font-medium mt-1 ${
                isEarned ? 'text-amber-600' : 'text-amber-500'
              }`}
            >
              + {achievement.points_reward} points
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
