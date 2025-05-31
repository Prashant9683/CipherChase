import React from 'react';
import { User } from '../../types';
import { Trophy, Award, Timer, Target } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../ui/Card';

interface UserProfileProps {
  user: User;
  achievements: any[];
  statistics: {
    totalHunts: number;
    totalPuzzles: number;
    averageTime: string;
    favoriteType: string;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({ user, achievements, statistics }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center space-x-4">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-[#1A3A5A] rounded-full flex items-center justify-center text-white text-2xl">
              {user.name.charAt(0)}
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-serif text-[#1A3A5A]">{user.name}</h2>
            <p className="text-gray-600">{user.bio || 'No bio provided'}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-xl font-medium text-[#1A3A5A] flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-[#D4AF37]" />
              Statistics
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hunts Completed</span>
                <span className="font-medium text-[#1A3A5A]">{statistics.totalHunts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Puzzles Solved</span>
                <span className="font-medium text-[#1A3A5A]">{statistics.totalPuzzles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Time</span>
                <span className="font-medium text-[#1A3A5A]">{statistics.averageTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Favorite Cipher</span>
                <span className="font-medium text-[#1A3A5A]">{statistics.favoriteType}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <h3 className="text-xl font-medium text-[#1A3A5A] flex items-center">
              <Award className="w-5 h-5 mr-2 text-[#D4AF37]" />
              Achievements
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md"
                >
                  <div className="bg-[#D4AF37]/10 p-2 rounded-full">
                    {achievement.icon_name === 'timer' ? (
                      <Timer className="w-5 h-5 text-[#D4AF37]" />
                    ) : achievement.icon_name === 'target' ? (
                      <Target className="w-5 h-5 text-[#D4AF37]" />
                    ) : (
                      <Trophy className="w-5 h-5 text-[#D4AF37]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1A3A5A]">{achievement.title}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-sm font-medium text-[#D4AF37]">
                      {achievement.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;