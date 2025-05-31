import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile'; // Make sure this is corrected
import { useDashboardSettings } from '../../hooks/useDashboardSettings';
import { useAchievements } from '../../hooks/useAchievements';

import Card, {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '../ui/Card'; // Make sure Card.tsx exports these
import { Link } from '../ui/Link';

// Icons from lucide-react
import {
  Award,
  Compass,
  Settings,
  User,
  BookOpen,
  Brain,
  PlusCircle,
  Edit3,
  AlertTriangle,
  LayoutGrid,
  Palette,
  BarChart2,
  FileText,
  Zap // <--- ADD ZAP HERE
} from 'lucide-react'; // Ensure Zap is imported
import Loader from '../ui/Loader';
// Helper component for Dashboard Sections/Cards
interface DashboardSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  actionLink?: { to: string; text: string; icon?: React.ReactNode };
  className?: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
                                                             title,
                                                             description,
                                                             icon,
                                                             isLoading,
                                                             error,
                                                             children,
                                                             actionLink,
                                                             className
                                                           }) => {
  return (
      <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {icon && <span className="mr-3 text-blue-600">{icon}</span>}
              <CardTitle className="text-xl font-semibold text-gray-700">{title}</CardTitle>
            </div>
            {actionLink && !isLoading && !error && (
                <Link
                    to={actionLink.to}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center transition-colors"
                >
                  {actionLink.icon && <span className="mr-1">{actionLink.icon}</span>}
                  {actionLink.text}
                </Link>
            )}
          </div>
          {description && <CardDescription className="mt-1 text-sm text-gray-500">{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader size="md" /> {/* Adjust loader size as needed */}
              </div>
          ) : error ? (
              <div className="text-red-600 bg-red-50 p-3 rounded-md flex items-center">
                <AlertTriangle size={20} className="mr-2" />
                <p className="text-sm">Error: {error}</p>
              </div>
          ) : (
              children
          )}
        </CardContent>
      </Card>
  );
};


const Dashboard: React.FC = () => {
  const { user } = useAuth(); // Get the authenticated user
  // Pass user.id to useProfile if your hook is designed to take an explicit ID,
  // otherwise, it should use the user from useAuth internally.
  const { profile, loading: profileLoading, error: profileError } = useProfile(user?.id);
  const { settings, loading: settingsLoading, error: settingsError } = useDashboardSettings();
  const { achievements, loading: achievementsLoading, error: achievementsError } = useAchievements();

  const navigate = useNavigate(); // If you need to trigger navigation from a button click

  // Overall loading state for the header part, or a general skeleton
  const pageHeaderLoading = profileLoading;

  return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
        <header className="mb-10">
          {pageHeaderLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-1/2"></div>
              </div>
          ) : profileError ? (
              <div className="text-red-600">Could not load user information.</div>
          ) : (
              <>
                <h1 className="text-4xl font-bold text-gray-800">
                  Welcome back, <span className="text-blue-600">{profile?.display_name || 'Adventurer'}</span>!
                </h1>
                <p className="text-md text-gray-600 mt-1">Ready to chase some ciphers?</p>
              </>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Summary Section */}
          <DashboardSection
              title="Your Profile"
              description="Manage your identity and track your progress."
              icon={<User size={24} />}
              isLoading={profileLoading}
              error={profileError}
              actionLink={{ to: "/profile/edit", text: "Edit Profile", icon: <Edit3 size={16} /> }}
              className="lg:col-span-1"
          >
            {profile ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center"><FileText size={16} className="mr-2 text-gray-500" /> Hunts Completed: <span className="font-semibold ml-1">{profile.total_hunts_completed || 0}</span></p>
                  <p className="flex items-center"><LayoutGrid size={16} className="mr-2 text-gray-500" /> Puzzles Solved: <span className="font-semibold ml-1">{profile.total_puzzles_solved || 0}</span></p>
                  {/* Add more profile stats if available */}
                </div>
            ) : (
                <p className="text-sm text-gray-500">Profile details will appear here.</p>
            )}
          </DashboardSection>

          {/* Start/Create Hunts Section */}
          <DashboardSection
              title="Adventures Await"
              description="Dive into new hunts or craft your own."
              icon={<Compass size={24} />}
              className="lg:col-span-2" // Make this card wider on larger screens
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                  to="/solve" // Link to where users can browse and start hunts
                  className="flex flex-col items-center justify-center p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                <Zap size={32} className="mb-2" />
                <span className="font-semibold text-lg">Solve a Hunt</span>
                <span className="text-xs mt-1 text-blue-100">Explore existing challenges</span>
              </Link>
              <Link
                  to="/create" // Link to hunt creation page
                  className="flex flex-col items-center justify-center p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                <PlusCircle size={32} className="mb-2" />
                <span className="font-semibold text-lg">Create a Hunt</span>
                <span className="text-xs mt-1 text-green-100">Design your own puzzles</span>
              </Link>
            </div>
          </DashboardSection>

          {/* Achievements Section */}
          <DashboardSection
              title="Your Achievements"
              description="Milestones you've unlocked on your journey."
              icon={<Award size={24} />}
              isLoading={achievementsLoading}
              error={achievementsError}
              actionLink={{ to: "/achievements", text: "View All", icon: <BarChart2 size={16} /> }}
          >
            {achievements && achievements.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-700 mb-3">
                    You've earned <span className="font-semibold">{achievements.length}</span> achievement(s). Keep it up!
                  </p>
                  {/* You could list a few recent/notable achievements here */}
                  <ul className="space-y-1 max-h-32 overflow-y-auto text-xs">
                    {achievements.slice(0, 3).map((ach: any) => ( // Assuming achievement has a name property
                        <li key={ach.id || ach.name} className="p-1 bg-gray-50 rounded">🏆 {ach.name}</li>
                    ))}
                  </ul>
                </div>
            ) : (
                <p className="text-sm text-gray-500">No achievements unlocked yet. Complete hunts and puzzles to earn them!</p>
            )}
          </DashboardSection>

          {/* Dashboard Settings Section */}
          <DashboardSection
              title="Dashboard Settings"
              description="Personalize your dashboard experience."
              icon={<Settings size={24} />}
              isLoading={settingsLoading}
              error={settingsError}
              actionLink={{ to: "/settings/dashboard", text: "Customize", icon: <Edit3 size={16} /> }}
          >
            {settings ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-center"><Palette size={16} className="mr-2 text-gray-500" /> Current Theme: <span className="font-semibold ml-1 capitalize">{settings.theme || 'Default'}</span></p>
                  {/* Display other settings if available, e.g., notifications_enabled */}
                  <p className="flex items-center">
                    Notifications:
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${settings.notifications_enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {settings.notifications_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </p>
                </div>
            ) : (
                <p className="text-sm text-gray-500">Customize your layout, theme, and widgets.</p>
            )}
          </DashboardSection>

          {/* Learning Resources (Optional - based on your app's features) */}
          {/*
        <DashboardSection
          title="Learning Cryptography"
          description="Sharpen your skills and explore ciphers."
          icon={<BookOpen size={24} />}
          actionLink={{ to: "/learn", text: "Explore Ciphers" }}
        >
          <p className="text-sm text-gray-700">
            Dive into our resources to learn about various cryptographic techniques and improve your puzzle-solving abilities.
          </p>
        </DashboardSection>
        */}
        </div>
      </div>
  );
};

export default Dashboard;
