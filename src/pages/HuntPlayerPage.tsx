// src/pages/HuntPlayerPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  TreasureHunt,
  StoryNode,
  UserHuntProgress,
  Puzzle as PuzzleData,
  HuntChoice,
} from '../types';
// CORRECTED IMPORT:
import { fetchHuntDetailsForPlaying } from '../services/huntService'; // Was fetchHuntDetailsById
// import { fetchStoryNodeById, fetchPuzzleById } from '../services/storyNodeService';
import {
  getUserHuntProgress,
  createOrUpdateUserHuntProgress,
} from '../services/userProgressService';
import InteractiveStoryNodeViewer from '../components/story/InteractiveStoryNodeViewer';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

// ... (rest of the HuntPlayerPage.tsx code from the previous "Phase 2" or "Phase 5" response)
// Ensure the part that calls fetchHuntDetailsById now calls fetchHuntDetailsForPlaying:

const HuntPlayerPage: React.FC = () => {
  const { huntId } = useParams<{ huntId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [huntDetails, setHuntDetails] = useState<TreasureHunt | null>(null);
  // ... other states ...
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeHuntPlay = useCallback(async () => {
    if (!user || !huntId) return;

    setLoading(true);
    setError(null);
    try {
      // USE THE CORRECTED FUNCTION NAME HERE
      const fetchedHunt = await fetchHuntDetailsForPlaying(huntId);
      if (!fetchedHunt) {
        setError('Hunt not found.');
        setLoading(false);
        return;
      }
      setHuntDetails(fetchedHunt);

      // ... rest of progress fetching logic ...
      let progress = await getUserHuntProgress(user.id, huntId);
      if (
        !progress ||
        progress.status === 'completed' ||
        progress.status === 'abandoned'
      ) {
        const startingNodeId = fetchedHunt.starting_node_id;
        if (!startingNodeId) {
          setError('This hunt has no starting point.');
          setLoading(false);
          return;
        }
        progress = await createOrUpdateUserHuntProgress({
          user_id: user.id,
          hunt_id: huntId,
          current_story_node_id: startingNodeId,
          status: 'started',
          story_state: {},
          completed_puzzle_ids: [],
          score: 0,
        });
      }
      setCurrentProgress(progress); // Make sure setCurrentProgress is defined via useState
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to initialize hunt.'
      );
      console.error(err);
    }
    // setLoading(false) is handled by loadCurrentNode or if an early error occurs
  }, [user, huntId]);

  // ... (the rest of your HuntPlayerPage code, ensure setCurrentProgress is defined and used)
  // Remember to define setCurrentProgress with useState:
  const [currentProgress, setCurrentProgress] =
    useState<UserHuntProgress | null>(null);
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [currentPuzzleData, setCurrentPuzzleData] = useState<PuzzleData | null>(
    null
  );
  // ... etc.

  // (Include the full HuntPlayerPage.tsx content from the previous "Phase 5" response here,
  // ensuring this initializeHuntPlay function is integrated correctly)
  // ...
  useEffect(() => {
    if (!authLoading && user && huntId) {
      initializeHuntPlay();
    } else if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, huntId, authLoading, initializeHuntPlay, navigate]);

  const loadCurrentNode = useCallback(async () => {
    /* ... as before ... */
  }, [currentProgress]);
  useEffect(() => {
    if (currentProgress) {
      loadCurrentNode();
    }
  }, [currentProgress, loadCurrentNode]);
  const navigateToNode = async (
    nextNodeId: string,
    storyStateUpdates: Record<string, any> = {}
  ) => {
    /* ... as before ... */
  };
  const handlePuzzleSubmit = async (
    puzzleId: string,
    attempt: string
  ): Promise<{ isCorrect: boolean; feedback?: string }> => {
    /* ... as before ... */ return {
      isCorrect: false,
      feedback: 'Not implemented in snippet',
    };
  };
  const handleChoiceSelection = (choice: HuntChoice) => {
    /* ... as before ... */
  };
  const handleActionTriggered = (actionDetails: any) => {
    /* ... as before ... */
  };

  // RENDER LOGIC as provided in Phase 5, ensuring all states are defined

  if (
    authLoading ||
    (loading &&
      !currentNode &&
      !error &&
      currentProgress?.status !== 'completed' &&
      currentProgress?.status !== 'abandoned')
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader message="Loading your adventure..." size="lg" />
      </div>
    );
  }
  // ... rest of the return JSX
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 md:p-8 flex flex-col items-center">
      <header className="mb-6 text-center w-full max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-700 dark:text-slate-100 font-serif">
          {huntDetails?.title || 'Loading Hunt...'}
        </h1>
      </header>
      {currentNode && currentProgress ? (
        <InteractiveStoryNodeViewer
          node={currentNode}
          currentPuzzleData={currentPuzzleData}
          storyState={currentProgress.story_state || {}}
          onNavigateToNode={navigateToNode}
          onPuzzleSubmit={handlePuzzleSubmit}
          onChoiceMade={handleChoiceSelection}
          onActionTriggered={handleActionTriggered}
        />
      ) : (
        // Render appropriate loading/error/completed state based on error, loading, currentProgress.status
        <div>{/* Placeholder for alternate states */}</div>
      )}
    </div>
  );
};

export default HuntPlayerPage;
