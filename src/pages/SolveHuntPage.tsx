// src/pages/SolveHuntPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TreasureHunt } from '../types';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card'; // Your Card from src/ui/Card
import Button from '../components/ui/Button'; // Your Button from src/ui/Button
import {
    Compass, Puzzle as PuzzleIcon, CalendarDays, User as UserIcon,
    AlertTriangle, Edit, PlayCircle, SearchSlash, Feather, LockKeyhole // Added Feather from reference
} from 'lucide-react'; // Renamed Puzzle to PuzzleIcon to avoid conflict with variable name
import { fetchPublicHuntsForListing } from '../services/huntService';
import Loader from '../components/ui/Loader'; // Your Loader from src/ui/Loader
import ExpandableText from '../components/ui/ExpandableText'; // Your ExpandableText from src/ui/ExpandableText

const SolveHuntPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [hunts, setHunts] = useState<TreasureHunt[]>([]);
    const [isLoadingHunts, setIsLoadingHunts] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Functional logic from your existing SolveHuntPage.tsx
    const loadHuntsData = useCallback(async () => {
        if (authLoading) return;
        if (!user) {
            setIsLoadingHunts(false);
            setHunts([]);
            return;
        }
        setIsLoadingHunts(true); setFetchError(null);
        try {
            const fetchedHunts = await fetchPublicHuntsForListing();
            setHunts(fetchedHunts || []);
        } catch (err: any) {
            console.error('Error loading hunts:', err);
            setFetchError(err.message || 'Failed to load expeditions.');
        } finally {
            setIsLoadingHunts(false);
        }
    }, [user, authLoading]);

    useEffect(() => { loadHuntsData(); }, [loadHuntsData]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-black">
                <Compass size={64} className="animate-spin mb-4 text-blue-600" />
                <h1 className="text-3xl font-bold mb-2">Verifying Identity...</h1>
                <Loader />
            </div>
        );
    }
    if (!user) { return <Navigate to="/" replace />; } // Or your login page

    // --- UI Structure from SolveHuntPage_reference.tsx with your functionality & new theme ---
    return (
        <div className="min-h-screen bg-white text-black"> {/* Main page background */}
            {/* Header section from reference, adapted with new theme */}
            <div className="py-12 bg-gradient-to-r from-blue-500 to-blue-600"> {/* Adjusted gradient to use blue-600 */}
                <div className="container mx-auto px-4 text-center">
                    <Compass size={48} className="mx-auto mb-4 text-white" />
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Uncharted Adventures</h1>
                    <p className="text-lg md:text-xl text-blue-100 mt-3 max-w-2xl mx-auto">
                        Ancient maps whisper of untold riches. Select a hunt and etch your name in legend!
                    </p>
                </div>
            </div>

            {/* Content area */}
            <div className="container mx-auto px-4 py-10">
                {isLoadingHunts ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader />
                        <p className="ml-3 text-black">Discovering new quests...</p>
                    </div>
                ) : fetchError ? (
                    <Card className="max-w-lg mx-auto my-10 bg-white text-center shadow-xl border border-red-300">
                        <CardHeader>
                            <AlertTriangle size={48} className="mx-auto text-red-500 mb-3"/>
                            <CardTitle className="text-red-600">Network Error</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-black">{fetchError}</p></CardContent>
                        <CardFooter>
                            <Button variant="danger" onClick={loadHuntsData} icon={<Compass />}>
                                Retry Connection
                            </Button>
                        </CardFooter>
                    </Card>
                ) : hunts.length === 0 ? (
                    <div className="text-center py-20">
                        <SearchSlash size={64} className="mx-auto text-gray-400 mb-6" /> {/* Softer icon color */}
                        <h2 className="text-2xl font-bold text-black mb-3">The Archives are Bare</h2>
                        <p className="text-gray-700 mt-2 mb-6 max-w-md mx-auto"> {/* Softer text color */}
                            No adventures are currently chronicled. Perhaps you're the scribe we've been waiting for?
                        </p>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/create')}
                            icon={<Edit />}
                            className="bg-blue-600 hover:bg-blue-700 text-white" // Explicit theme
                        >
                            Scribe a New Chronicle
                        </Button>
                    </div>
                ) : (
                    // Grid layout for hunt cards, from reference
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {hunts.map(hunt => (
                            <Card key={hunt.id} className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col transition-all hover:shadow-2xl border border-gray-200">
                                {hunt.cover_image_url && (
                                    <div className="aspect-video w-full overflow-hidden"> {/* Consistent aspect ratio */}
                                        <img src={hunt.cover_image_url} alt={hunt.title} className="w-full h-full object-cover"/>
                                    </div>
                                )}
                                <CardHeader className="p-5 border-b border-gray-200">
                                    <CardTitle className="text-xl font-semibold text-black line-clamp-2">{hunt.title}</CardTitle>
                                    {/* Using ExpandableText for description from reference */}
                                    {hunt.description && (
                                        <ExpandableText
                                            text={hunt.description}
                                            initialLineClamp={2} // Reference uses 2
                                            className="mt-1.5"
                                            textClassName="text-sm text-gray-700 leading-relaxed" // Softer black
                                            buttonClassName="text-blue-600 hover:underline text-xs"
                                        />
                                    )}
                                </CardHeader>

                                {/* Content section styled like reference */}
                                <CardContent className="p-5 flex-grow space-y-3">
                                    {hunt.story_context && ( // Story context block from reference
                                        <div className="flex items-start text-sm text-gray-700">
                                            <Feather size={18} className="mr-2.5 mt-0.5 text-blue-600 flex-shrink-0" />
                                            <blockquote className="italic border-l-2 border-blue-500 pl-3 py-1">
                                                <ExpandableText text={hunt.story_context} initialLineClamp={3} textClassName="text-xs" buttonClassName="text-blue-600 text-xs"/>
                                            </blockquote>
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-600 space-y-1.5"> {/* Metadata items wrapper */}
                                        <p className="flex items-center">
                                            <PuzzleIcon size={14} className="mr-2 text-blue-600"/>
                                            <span className="font-medium text-black">{hunt.puzzles_count !== undefined ? hunt.puzzles_count : 'Interactive'}</span>
                                            {hunt.puzzles_count === 1 ? " Enigma" : " Enigmas"} {/* Adapted for new system */}
                                        </p>
                                        <p className="flex items-center">
                                            <CalendarDays size={14} className="mr-2 text-blue-600"/>
                                            <span className="text-black">Chronicled:</span> {new Date(hunt.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="flex items-center">
                                            <UserIcon size={14} className="mr-2 text-blue-600"/>
                                            <span className="text-black">By:</span> {hunt.creator?.display_name || 'Mysterious Chronicler'}
                                        </p>
                                        {/* Displaying difficulty if available, similar to reference items */}
                                        {hunt.difficulty && (
                                            <p className="flex items-center">
                                                <LockKeyhole size={14} className="mr-2 text-blue-600" />
                                                <span className="text-black">Difficulty:</span> <span className="capitalize ml-1">{hunt.difficulty}</span>
                                            </p>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="p-5 bg-gray-50 border-t border-gray-200"> {/* Footer bg for slight separation */}
                                    {/* Button logic from your functional SolveHuntPage.tsx */}
                                    {hunt.starting_node_id ? (
                                        <RouterLink to={`/play/${hunt.id}`} className="w-full">
                                            <Button
                                                variant="primary"
                                                fullWidth
                                                icon={<PlayCircle size={18} />}
                                                className="bg-blue-600 hover:bg-blue-700 text-white" // Explicit theme
                                            >
                                                Begin This Quest
                                            </Button>
                                        </RouterLink>
                                    ) : (
                                        <Button variant="outline" fullWidth disabled className="border-gray-300 text-gray-500">
                                            Quest Story Incomplete
                                        </Button>
                                    )}
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
