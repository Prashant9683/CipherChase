// src/pages/HuntPlayerPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TreasureHunt, StoryNode, UserHuntProgress, Puzzle as PuzzleData, HuntChoice } from '../types';
import { supabase } from '../lib/supabase';

// Services
import { fetchHuntDetailsForPlaying } from '../services/huntService';
import { getUserHuntProgress, createOrUpdateUserHuntProgress } from '../services/userProgressService';

// UI Components
import InteractiveStoryNodeViewer from '../components/story/InteractiveStoryNodeViewer';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { AlertTriangle, ArrowLeft, Compass, CheckCircle, RotateCcw } from 'lucide-react';

// Helper functions
const fetchStoryNodeById = async (nodeId: string): Promise<StoryNode | null> => {
    const relationshipHintForChoices = 'story_node_choices_story_node_id_fkey';
    const { data, error } = await supabase.from('story_nodes').select(`*, story_node_choices!${relationshipHintForChoices}(*)`).eq('id', nodeId).single();
    if (error) { if (error.code === 'PGRST116') { console.warn(`Node ${nodeId} not found.`); return null; } console.error(`Error fetching node ${nodeId}:`, error); throw error; }
    return data as StoryNode | null;
};
const fetchPuzzleById = async (puzzleId: string): Promise<PuzzleData | null> => {
    const { data, error } = await supabase.from('puzzles').select('*').eq('id', puzzleId).single();
    if (error) { if (error.code === 'PGRST116') { console.warn(`Puzzle ${puzzleId} not found.`); return null; } console.error(`Error fetching puzzle ${puzzleId}:`, error); throw error; }
    return data as PuzzleData | null;
};

const HuntPlayerPage: React.FC = () => {
    const { huntId } = useParams<{ huntId: string }>();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [huntDetails, setHuntDetails] = useState<TreasureHunt | null>(null);
    const [currentProgress, setCurrentProgress] = useState<UserHuntProgress | null>(null);
    const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
    const [currentPuzzleData, setCurrentPuzzleData] = useState<PuzzleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const initializeHuntPlay = useCallback(async () => {
        if (!user || !huntId) {
            if (!authLoading && !user) navigate('/login', {replace: true});
            setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const fetchedHunt = await fetchHuntDetailsForPlaying(huntId);
            if (!fetchedHunt) { setError(`Quest (ID: ${huntId}) not found.`); setLoading(false); return; }
            setHuntDetails(fetchedHunt);
            let progress = await getUserHuntProgress(user.id, huntId);
            if (!progress || progress.status === 'completed' || progress.status === 'abandoned') {
                const startingNodeId = fetchedHunt.starting_node_id;
                if (!startingNodeId) { setError("This quest has no starting point."); setLoading(false); return; }
                progress = await createOrUpdateUserHuntProgress({
                    user_id: user.id, hunt_id: huntId, current_story_node_id: startingNodeId,
                    status: 'started', story_state: {}, completed_puzzle_ids: [], score: 0,
                    visited_node_path: [startingNodeId]
                });
            } else if ((!progress.visited_node_path || progress.visited_node_path.length === 0) && progress.current_story_node_id) {
                const initialPath = [progress.current_story_node_id];
                progress = await createOrUpdateUserHuntProgress({...progress, visited_node_path: initialPath});
            }
            setCurrentProgress(progress);
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to init.'); console.error("Init error:", err); setLoading(false); }
    }, [user, huntId, authLoading, navigate]);

    const loadCurrentNode = useCallback(async () => {
        if (!currentProgress?.current_story_node_id) {
            if (currentProgress && (currentProgress.status !== 'completed' && currentProgress.status !== 'abandoned')) {
                setError("No current chapter is set.");
            }
            setCurrentNode(null); setCurrentPuzzleData(null); setLoading(false); return;
        }
        setLoading(true); setError(null);
        try {
            const node = await fetchStoryNodeById(currentProgress.current_story_node_id);
            if (node) {
                setCurrentNode(node);
                if (node.node_type === 'puzzle_interaction' && node.content?.puzzle_id) {
                    const puzzle = await fetchPuzzleById(node.content.puzzle_id);
                    setCurrentPuzzleData(puzzle);
                    if (!puzzle) console.warn(`Puzzle ID ${node.content.puzzle_id} not found.`);
                } else { setCurrentPuzzleData(null); }
            } else { setError(`Chapter (Node ID: ${currentProgress.current_story_node_id}) not found.`); setCurrentNode(null); setCurrentPuzzleData(null); }
        } catch (err) { setError(err instanceof Error ? err.message : "Failed to load chapter."); console.error("Load node error:", err); setCurrentNode(null); setCurrentPuzzleData(null); }
        finally { setLoading(false); }
    }, [currentProgress]);

    useEffect(() => {
        if (!authLoading && user && huntId) { initializeHuntPlay(); }
        else if (!authLoading && !user) { navigate('/login', { replace: true }); }
    }, [user, huntId, authLoading, initializeHuntPlay, navigate]);

    useEffect(() => {
        if (currentProgress?.current_story_node_id && (currentProgress.status === 'started' || currentProgress.status === 'in_progress')) { loadCurrentNode(); }
        else if (currentProgress) { setLoading(false); setCurrentNode(null); }
    }, [currentProgress, loadCurrentNode]);

    const navigateToNode = async (nextNodeId: string | null, storyStateUpdates: Record<string, any> = {}) => {
        if (!user || !huntId || !currentProgress) return;
        setLoading(true);
        try {
            const newStoryState = { ...(currentProgress.story_state || {}), ...storyStateUpdates };
            const newStatus = nextNodeId ? (currentProgress.status === 'started' ? 'in_progress' : currentProgress.status) : 'completed';
            let newVisitedPath = [...(currentProgress.visited_node_path || [])];
            if (nextNodeId) {
                if (newVisitedPath.length === 0 || newVisitedPath[newVisitedPath.length - 1] !== nextNodeId) {
                    newVisitedPath.push(nextNodeId);
                }
            }
            const MAX_PATH_LENGTH = 50;
            if (newVisitedPath.length > MAX_PATH_LENGTH) {
                newVisitedPath = newVisitedPath.slice(-MAX_PATH_LENGTH);
            }
            const updatedProgress = await createOrUpdateUserHuntProgress({
                id: currentProgress.id, user_id: user.id, hunt_id: huntId, current_story_node_id: nextNodeId,
                story_state: newStoryState, status: newStatus,
                score: currentProgress.score, completed_puzzle_ids: currentProgress.completed_puzzle_ids,
                visited_node_path: newVisitedPath
            });
            setCurrentProgress(updatedProgress);
        } catch (err) { setError(err instanceof Error ? err.message : "Failed to update progress."); setLoading(false); }
    };

    const handleGoBack = async () => {
        if (!currentProgress || !currentProgress.visited_node_path || currentProgress.visited_node_path.length < 2) {
            setError("No previous step to go back to."); return;
        }
        setLoading(true);
        try {
            const newVisitedPath = [...currentProgress.visited_node_path];
            newVisitedPath.pop();
            const previousNodeId = newVisitedPath[newVisitedPath.length - 1];
            const updatedProgress = await createOrUpdateUserHuntProgress({
                id: currentProgress.id, user_id: user.id, hunt_id: huntId,
                current_story_node_id: previousNodeId,
                visited_node_path: newVisitedPath,
                story_state: currentProgress.story_state,
                score: currentProgress.score, completed_puzzle_ids: currentProgress.completed_puzzle_ids,
                status: 'in_progress',
            });
            setCurrentProgress(updatedProgress);
        } catch (err) { setError(err instanceof Error ? err.message : "Failed to go back."); setLoading(false); }
    };

    const handlePuzzleSubmit = async (puzzleId: string, attempt: string): Promise<{isCorrect: boolean, feedback?: string}> => {
        if (!user || !huntId || !currentProgress || !currentNode || currentNode.node_type !== 'puzzle_interaction' || !currentPuzzleData) return {isCorrect: false, feedback: "Error: Puzzle context missing."};
        const isCorrect = attempt.trim().toLowerCase() === currentPuzzleData.solution.toLowerCase();
        let feedbackMessage = isCorrect ? "Correct!" : "Not quite.";
        let nextNodeIdToGo: string | null | undefined = null;
        if (isCorrect) {
            nextNodeIdToGo = currentNode.content.success_node_id;
            const updatedCompletedPuzzles = Array.from(new Set([...(currentProgress.completed_puzzle_ids || []), puzzleId]));
            const scoreUpdate = (currentProgress.score || 0) + (currentPuzzleData.points || 0);
            await createOrUpdateUserHuntProgress({ ...currentProgress, id: currentProgress.id!, user_id: user.id, hunt_id: huntId, completed_puzzle_ids: updatedCompletedPuzzles, score: scoreUpdate });
            setCurrentProgress(prev => prev ? {...prev, score: scoreUpdate, completed_puzzle_ids: updatedCompletedPuzzles} : null);
            if (nextNodeIdToGo) await navigateToNode(nextNodeIdToGo); else { feedbackMessage += " End of path."; await navigateToNode(null); }
        } else {
            if (currentNode.content.failure_node_id) { nextNodeIdToGo = currentNode.content.failure_node_id; await navigateToNode(nextNodeIdToGo); }
        }
        return { isCorrect, feedback: feedbackMessage };
    };
    const handleChoiceSelection = (choice: HuntChoice) => {
        if (choice.next_story_node_id) navigateToNode(choice.next_story_node_id, choice.story_state_update || {});
        else { setError("Choice leads nowhere."); navigateToNode(null); }
    };
    const handleActionTriggered = (actionDetails: { success_node_id: string; story_state_update?: Record<string, any> }) => {
        if (actionDetails.success_node_id) navigateToNode(actionDetails.success_node_id, actionDetails.story_state_update || {});
        else { setError("Action has no outcome."); navigateToNode(null); }
    };

    // --- RENDER LOGIC ---
    if (authLoading || (loading && !huntDetails && !currentNode && !error && !currentProgress)) { // Line 179
        return ( // Line 180 - Corrected Loading UI
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-black">
                <Compass size={64} className="animate-spin mb-4 text-blue-600" />
                <h1 className="text-3xl font-bold mb-2">Preparing Your Adventure...</h1>
                <Loader /> {/* Assuming Loader adapts or is simple */}
            </div>
        );
    }

    if (error) { // Line 182
        return ( // Line 183 - Corrected Error UI
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
                <Card className="max-w-md w-full bg-white shadow-xl border border-red-300">
                    <CardHeader className="border-b-0 pb-2">
                        <AlertTriangle size={56} className="mx-auto text-red-500 mb-3" />
                        <CardTitle className="text-2xl font-bold text-red-600">Adventure Interrupted!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-black mb-6">{error}</p>
                        <Button variant="danger" onClick={() => navigate('/solve')} icon={<ArrowLeft size={18}/>}>
                            Back to Quests
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!huntDetails && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-white">
                <Card className="max-w-md w-full bg-white shadow-xl text-center border border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-black">Quest Details Unavailable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-black">The details for this quest could not be loaded at this moment.</p>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/solve')}
                            icon={<ArrowLeft size={18}/>}
                            className="mt-4 text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                            Back to Quests
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    if (currentProgress?.status === 'completed') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
                <Card className="max-w-md w-full bg-white shadow-xl border border-green-300">
                    <CardHeader className="border-b-0 pb-2">
                        <CheckCircle size={56} className="mx-auto text-green-500 mb-3" />
                        <CardTitle className="text-2xl font-bold text-green-600">Quest Completed!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-black mb-1">Congratulations, you've successfully navigated</p>
                        <p className="text-lg font-semibold text-black mb-4">"{huntDetails?.title || 'this adventure'}"!</p>
                        <p className="text-sm text-black opacity-80 mb-2">Your final score: {currentProgress.score || 0}</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/solve')}
                            icon={<ArrowLeft size={18}/>}
                            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Back to Quests
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <header className="mb-6 container mx-auto max-w-4xl">
                <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={() => navigate('/solve')} icon={<ArrowLeft size={16}/>}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50">
                        Back to Quests
                    </Button>
                    <div className="flex items-center">
                        {currentProgress && currentProgress.visited_node_path && currentProgress.visited_node_path.length > 1 && !loading && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleGoBack}
                                icon={<RotateCcw size={16} />}
                                className="mr-3 text-blue-600 hover:bg-blue-100"
                            >
                                Go Back
                            </Button>
                        )}
                        {currentProgress && <span className="text-sm text-black">Score: {currentProgress.score || 0}</span>}
                    </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-black font-serif mt-4 text-center">
                    {huntDetails?.title || "Loading Quest..."}
                </h1>
            </header>
            <main className="container mx-auto max-w-3xl bg-white shadow-xl rounded-lg p-6 md:p-8">
                {loading && !currentNode && <div className="py-10 text-center"><Loader /> <p className="text-black mt-2">Loading next chapter...</p></div>}
                {!loading && currentNode && currentProgress && (currentProgress.status === 'started' || currentProgress.status === 'in_progress') ? (
                    <InteractiveStoryNodeViewer
                        node={currentNode}
                        puzzleData={currentPuzzleData}
                        storyState={currentProgress.story_state || {}}
                        onNavigate={navigateToNode}
                        onPuzzleSubmit={handlePuzzleSubmit}
                        onChoiceSelect={handleChoiceSelection}
                        onActionTrigger={handleActionTriggered}
                    />
                ) : !loading && !error && currentProgress && (currentProgress.status === 'started' || currentProgress.status === 'in_progress') ? (
                    <div className="text-center py-10">
                        <p className="text-black">The story may have ended here, or the next chapter is missing.</p>
                        <Button variant="secondary" onClick={loadCurrentNode} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">Try to Reload</Button>
                    </div>
                ) : null }
            </main>
        </div>
    );
};

export default HuntPlayerPage;
