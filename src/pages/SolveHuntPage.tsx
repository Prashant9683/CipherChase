// src/pages/SolveHuntPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TreasureHunt, Puzzle as PuzzleType } from '../types';
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import HuntSolver from '../components/hunt/HuntSolver';
import {
  Compass,
  Puzzle,
  CalendarDays,
  User,
  AlertTriangle,
  ArrowLeft,
  SearchSlash,
  Feather,
  LockKeyhole,
  BookOpen,
  Edit,
} from 'lucide-react';
import { fetchHunts } from '../lib/supabase';
import Loader from '../components/ui/Loader';
import ExpandableText from '../components/ui/ExpandableText'; // Import the new component

const SolveHuntPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedHunt, setSelectedHunt] = useState<TreasureHunt | null>(null);
  const [hunts, setHunts] = useState<TreasureHunt[]>([]);
  const [isLoadingHunts, setIsLoadingHunts] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadHuntsData = useCallback(async () => {
    if (!user && !authLoading) {
      setIsLoadingHunts(false);
      return;
    }
    if (!user) return;
    setIsLoadingHunts(true);
    setFetchError(null);
    try {
      const fetchedHunts = await fetchHunts();
      setHunts(fetchedHunts || []);
    } catch (err) {
      console.error('Error loading hunts:', err);
      const defaultMessage = 'An unexpected error occurred. Please try again.';
      setFetchError(
        err instanceof Error
          ? err.message.includes('Failed to fetch')
            ? 'Network error. Check connection.'
            : err.message
          : defaultMessage
      );
    } finally {
      setIsLoadingHunts(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadHuntsData();
  }, [loadHuntsData]);

  // --- Loading, Auth, Selected Hunt States (condensed from previous full versions) ---
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader message="Verifying pass..." size="lg" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (selectedHunt) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="container mx-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => setSelectedHunt(null)}
            className="mb-8 group"
            icon={
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            }
          >
            Return to Map
          </Button>
          <Card className="shadow-xl bg-white overflow-hidden">
            <CardContent className="p-0">
              <HuntSolver hunt={selectedHunt} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 py-12 font-sans">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <header className="mb-16 text-center">
          {/* ... header content from previous ... */}
          <Compass className="mx-auto h-20 w-20 text-blue-600 mb-6 transform transition-transform duration-500 hover:rotate-12" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 font-serif tracking-tight">
            Uncharted Adventures
          </h1>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
            Ancient maps whisper of untold riches. Select a hunt and etch your
            name in legend!
          </p>
        </header>

        {isLoadingHunts ? (
          /* ... Loader ... */ <div className="flex justify-center items-center h-64 pt-10">
            <Loader message="Consulting the cartographers..." size="lg" />
          </div>
        ) : fetchError ? (
          /* ... Error Card ... */ <Card className="w-full max-w-lg mx-auto text-center shadow-2xl bg-white border-2 border-red-200 p-6">
            <CardHeader className="border-none pb-2">
              <AlertTriangle size={56} className="mx-auto text-red-500 mb-4" />
              <CardTitle className="text-2xl font-bold text-red-700 font-serif">
                Lost at Sea!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-8 text-base">{fetchError}</p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 border-none">
              <Button
                variant="danger"
                onClick={loadHuntsData}
                icon={<Compass />}
                isLoading={isLoadingHunts}
                size="lg"
              >
                Try Navigating Again
              </Button>
            </CardFooter>
          </Card>
        ) : hunts.length === 0 ? (
          /* ... No Hunts Card ... */ <div className="text-center py-20 bg-white rounded-xl shadow-2xl p-10">
            <SearchSlash size={72} className="mx-auto text-slate-400 mb-8" />
            <p className="text-3xl font-bold text-slate-700 font-serif mb-3">
              The Archives are Bare!
            </p>
            <p className="text-slate-500 mt-2 mb-8 max-w-md mx-auto">
              No adventures are currently chronicled. Perhaps you're the scribe
              we've been waiting for?
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate('/create')}
              icon={<Feather />}
              size="lg"
            >
              Scribe a New Chronicle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {hunts.map((hunt) => (
              <Card
                key={hunt.id}
                className="flex flex-col bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 ease-out hover:-translate-y-2 group border border-slate-200 hover:border-blue-500"
                // No min-height on the card itself, let content dictate height more naturally
              >
                <CardHeader className="border-b border-slate-200 p-5">
                  <CardTitle className="text-xl lg:text-2xl font-bold text-blue-700 group-hover:text-blue-800 transition-colors font-serif !leading-tight tracking-tight mb-1.5 line-clamp-2">
                    {hunt.title}
                  </CardTitle>
                  {hunt.description && (
                    <CardDescription className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {hunt.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-sm flex-grow">
                  {' '}
                  {/* flex-grow is important */}
                  {hunt.story_context && (
                    <div className="relative group/story">
                      {/* Icon moved to be purely decorative next to the blockquote */}
                      <BookOpen
                        size={20}
                        className="absolute -top-1 -left-2.5 text-amber-400 opacity-50 transform -rotate-12 group-hover/story:text-amber-500 transition-all duration-300 group-hover/story:scale-105 z-0"
                      />
                      <blockquote className="text-slate-700 bg-amber-50/70 border-l-4 border-amber-500 rounded-md italic shadow-sm hover:shadow-md transition-shadow duration-300 pl-5 pr-3 py-3 relative z-10">
                        <ExpandableText
                          text={`"${hunt.story_context}"`} // Add quotes around the story
                          initialLineClamp={3} // Show 3 lines initially for story context
                          textClassName="text-sm leading-relaxed text-left" // Consistent text styling
                          buttonClassName="text-blue-600 hover:text-blue-700 text-xs"
                        />
                      </blockquote>
                    </div>
                  )}
                  <div
                    className={`grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-slate-600 ${
                      hunt.story_context ? 'pt-3' : 'pt-0'
                    }`}
                  >
                    <div
                      className="flex items-center"
                      title={`${
                        hunt.puzzles_count || hunt.puzzles?.length || 0
                      } Puzzles`}
                    >
                      <Puzzle
                        size={16}
                        className="mr-2 text-blue-500 flex-shrink-0"
                      />
                      <span className="font-medium text-slate-700">
                        {hunt.puzzles_count || hunt.puzzles?.length || 0}{' '}
                        {(hunt.puzzles_count || hunt.puzzles?.length) === 1
                          ? 'Enigma'
                          : 'Enigmas'}
                      </span>
                    </div>
                    <div
                      className="flex items-center"
                      title={`Chronicled on ${new Date(
                        hunt.created_at
                      ).toLocaleDateString()}`}
                    >
                      <CalendarDays
                        size={16}
                        className="mr-2 text-blue-500 flex-shrink-0"
                      />
                      <span className="font-medium text-slate-700">
                        {new Date(hunt.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div
                      className="flex items-center col-span-2"
                      title={`Authored by ${
                        hunt.creator?.display_name || 'A Mysterious Chronicler'
                      }`}
                    >
                      <Edit
                        size={16}
                        className="mr-2 text-blue-500 flex-shrink-0"
                      />
                      <span>
                        By:{' '}
                        <span className="font-semibold text-slate-800">
                          {hunt.creator?.display_name ||
                            'Mysterious Chronicler'}
                        </span>
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="mt-auto border-t border-slate-200 p-5 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <Button
                    variant="primary"
                    onClick={() => setSelectedHunt(hunt)}
                    className="w-full"
                    icon={<LockKeyhole />}
                    size="md"
                  >
                    Begin This Quest
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolveHuntPage;
