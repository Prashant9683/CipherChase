// src/components/story/InteractiveStoryNodeViewer.tsx
import React, { useState } from 'react';
import {
  StoryNode,
  HuntChoice,
  Puzzle as PuzzleData,
  UserHuntProgress,
} from '../../types';
import Button from '../ui/Button';
// import Card, { CardContent } from '../ui/Card'; // Using a simpler div now for main container
import PuzzleDisplay from './PuzzleDisplay';
import {
  ChevronRight,
  Maximize2,
  X,
  Image as ImageIcon,
  Volume2,
  AlertCircle,
  Users,
  UserCheck,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveStoryNodeViewerProps {
  node: StoryNode;
  currentPuzzleData: PuzzleData | null;
  storyState: UserHuntProgress['story_state'];
  onNavigateToNode: (nextNodeId: string) => void;
  onPuzzleSubmit: (
    puzzleId: string,
    attempt: string
  ) => Promise<{ isCorrect: boolean; feedback?: string }>;
  onChoiceMade: (choice: HuntChoice) => void;
  onActionTriggered?: (actionDetails: any) => void;
  // Removed onEndHunt as it's handled by navigating to an 'end_hunt' node
}

const nodeAnimationVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

const InteractiveStoryNodeViewer: React.FC<InteractiveStoryNodeViewerProps> = ({
  node,
  currentPuzzleData,
  storyState,
  onNavigateToNode,
  onPuzzleSubmit,
  onChoiceMade,
  onActionTriggered,
}) => {
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  const renderNodeContent = () => {
    let narrativeText = node.content.text || '';
    if (
      node.node_type === 'narrative_block' ||
      node.node_type === 'story_update'
    ) {
      // Example of conditional text (can be expanded based on your story_state structure)
      if (
        storyState.found_key &&
        (node.content as any).conditional_text_if_found_key
      ) {
        narrativeText += `\n\n${
          (node.content as any).conditional_text_if_found_key
        }`;
      }
    }

    switch (node.node_type) {
      case 'narrative_block':
      case 'story_update':
        return (
          <motion.div
            key={`node-narrative-${node.id}`} // Unique key for AnimatePresence
            variants={nodeAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: 'circOut' }}
            className="prose prose-slate max-w-none dark:prose-invert lg:prose-lg"
          >
            {node.content.character_pov &&
              node.content.character_pov !== 'narrator' && (
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1 italic">
                  {node.content.character_pov === 'protagonist'
                    ? 'My thoughts:'
                    : `${
                        (node.content as any).character_pov_name || 'Character'
                      }:`}
                </p>
              )}
            {narrativeText.split('\n').map((paragraph, index) => (
              <p key={index} className={paragraph.trim() === '' ? 'h-4' : ''}>
                {paragraph || <>&nbsp;</>}{' '}
                {/* Ensure empty lines render space */}
              </p>
            ))}
            {node.content.next_node_id && (
              <div className="mt-6 text-right">
                <Button
                  onClick={() => onNavigateToNode(node.content.next_node_id!)}
                  icon={<ChevronRight />}
                >
                  Continue
                </Button>
              </div>
            )}
          </motion.div>
        );

      case 'dialogue_message':
        const sender = (node.content as any).sender_name || 'Unknown';
        const isProtagonistSender =
          sender.toLowerCase() === 'me' ||
          sender.toLowerCase() ===
            (storyState.protagonist_name || 'protagonist').toLowerCase();
        return (
          <motion.div
            key={`node-dialogue-${node.id}`}
            variants={nodeAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: 'circOut' }}
            className={`p-1 ${isProtagonistSender ? 'flex justify-end' : ''}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow ${
                isProtagonistSender
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-200 text-slate-800 rounded-bl-none dark:bg-slate-700 dark:text-slate-100'
              }`}
            >
              {!isProtagonistSender && (
                <p className="text-xs font-semibold mb-0.5">{sender}</p>
              )}
              <p className="text-sm whitespace-pre-wrap">
                {(node.content as any).message_text}
              </p>
              {(node.content as any).timestamp && (
                <p
                  className={`text-xs mt-1 ${
                    isProtagonistSender
                      ? 'text-blue-200'
                      : 'text-slate-500 dark:text-slate-400'
                  } text-right`}
                >
                  {(node.content as any).timestamp}
                </p>
              )}
            </div>
            {(node.content as any).next_node_id &&
              !(node.content as any).is_part_of_sequence && (
                <div
                  className={`mt-4 ${isProtagonistSender ? 'text-right' : ''}`}
                >
                  <Button
                    onClick={() =>
                      onNavigateToNode((node.content as any).next_node_id!)
                    }
                    size="sm"
                    variant="ghost"
                    icon={<ChevronRight />}
                  >
                    Continue
                  </Button>
                </div>
              )}
          </motion.div>
        );

      case 'visual_cue':
        return (
          <motion.div
            key={`node-visual-${node.id}`}
            variants={nodeAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: 'circOut' }}
            className="space-y-3 text-center"
          >
            {(node.content as any).image_url && (
              <div
                className="relative group w-full max-w-md mx-auto cursor-pointer"
                onClick={() =>
                  setZoomedImageUrl((node.content as any).image_url!)
                }
              >
                <img
                  src={(node.content as any).image_url}
                  alt={(node.content as any).alt_text || 'Visual cue'}
                  className="rounded-lg shadow-lg w-full h-auto object-contain max-h-[60vh] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 rounded-lg">
                  <Maximize2 size={48} className="text-white" />
                </div>
              </div>
            )}
            {(node.content as any).audio_url && (
              <audio
                controls
                src={(node.content as any).audio_url}
                className="w-full my-3 shadow-sm rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Your browser does not support the audio element.
              </audio>
            )}
            {(node.content as any).caption && (
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm italic">
                {(node.content as any).caption}
              </p>
            )}
            {(node.content as any).next_node_id && (
              <div className="mt-5">
                <Button
                  onClick={() =>
                    onNavigateToNode((node.content as any).next_node_id!)
                  }
                  icon={<ChevronRight />}
                >
                  Continue
                </Button>
              </div>
            )}
          </motion.div>
        );

      case 'player_choice':
        const choices = (node.story_node_choices as HuntChoice[]) || [];
        return (
          <motion.div
            key={`node-choice-${node.id}`}
            variants={nodeAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: 'circOut' }}
          >
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-6 text-center">
              {(node.content as any).prompt}
            </p>
            <div className="space-y-3 max-w-md mx-auto">
              {choices.map((choice, index) => (
                <motion.div
                  key={choice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => onChoiceMade(choice)}
                    variant="outline"
                    fullWidth
                    size="lg"
                  >
                    {choice.choice_text}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'puzzle_interaction':
        if (!currentPuzzleData || !(node.content as any).puzzle_id) {
          return (
            <div className="flex items-center text-red-600 bg-red-50 p-4 rounded-md">
              <AlertCircle className="mr-2" />
              Error: Puzzle data is missing for this step.
            </div>
          );
        }
        return (
          <motion.div
            key={`node-puzzle-${node.id}`}
            variants={nodeAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: 'circOut' }}
          >
            {(node.content as any).prompt_text && (
              <p className="text-md text-slate-700 dark:text-slate-300 mb-4">
                {(node.content as any).prompt_text}
              </p>
            )}
            <PuzzleDisplay
              puzzle={currentPuzzleData}
              onSubmitAttempt={onPuzzleSubmit} // Pass directly
              storyState={storyState}
            />
          </motion.div>
        );

      case 'action_trigger':
        return (
          <motion.div
            key={`node-action-${node.id}`}
            variants={nodeAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: 'circOut' }}
            className="text-center"
          >
            <Button
              onClick={() =>
                onActionTriggered
                  ? onActionTriggered(node.content)
                  : onNavigateToNode((node.content as any).success_node_id!)
              }
              variant="secondary"
              size="lg"
            >
              {(node.content as any).action_label || 'Interact'}
            </Button>
          </motion.div>
        );

      case 'end_hunt':
        const isSuccess = (node.content as any).outcome === 'success';
        return (
          <motion.div
            key={`node-end-${node.id}`}
            variants={nodeAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: 'circOut' }}
            className="text-center py-8"
          >
            {isSuccess ? (
              <Award size={64} className="mx-auto mb-6 text-amber-500" />
            ) : (
              <Users size={64} className="mx-auto mb-6 text-slate-500" />
            )}
            <h2
              className={`text-3xl font-bold font-serif mb-4 ${
                isSuccess
                  ? 'text-green-600'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {isSuccess ? 'Quest Completed!' : "Journey's End"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
              {(node.content as any).message}
            </p>
            <Button
              onClick={() => onNavigateToNode('/')} // Navigate to home or hunts list
              variant={isSuccess ? 'primary' : 'outline'}
              size="lg"
            >
              Return to Adventures
            </Button>
          </motion.div>
        );

      default:
        return (
          <div className="flex items-center text-orange-600 bg-orange-50 p-4 rounded-md dark:bg-orange-900/30 dark:text-orange-400">
            <AlertCircle className="mr-2" />
            Unknown node type: {node.node_type}.
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 relative">
      <AnimatePresence mode="wait">
        {/* The key on the motion.div inside renderNodeContent ensures re-animation on node change */}
        {renderNodeContent()}
      </AnimatePresence>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setZoomedImageUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomedImageUrl}
                alt="Zoomed visual cue"
                className="block max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setZoomedImageUrl(null)}
                className="absolute -top-3 -right-3 bg-white text-slate-700 rounded-full p-1 shadow-lg hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 !h-8 !w-8"
                aria-label="Close zoomed image"
              >
                <X size={18} />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveStoryNodeViewer;
