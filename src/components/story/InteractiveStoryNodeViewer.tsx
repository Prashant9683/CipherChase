// src/components/story/InteractiveStoryNodeViewer.tsx
import React from 'react';
import { StoryNode, Puzzle as PuzzleData, HuntChoice, UserHuntProgress } from '../../types';
import Button from '../ui/Button';
import PuzzleDisplay from './PuzzleDisplay';
// Import other UI components from src/ui/ as needed
// import Textarea from '../ui/Textarea';
// import Label from '../ui/Label';
// import Input from '../ui/Input';

interface InteractiveStoryNodeViewerProps {
    node: StoryNode;
    puzzleData: PuzzleData | null;
    storyState: UserHuntProgress['story_state'];
    onNavigate: (nextNodeId: string | null, storyStateUpdates?: Record<string, any>) => void;
    onPuzzleSubmit: (puzzleId: string, attempt: string) => Promise<{ isCorrect: boolean; feedback?: string }>;
    onChoiceSelect: (choice: HuntChoice) => void;
    onActionTrigger: (actionDetails: { success_node_id: string; story_state_update?: Record<string, any> }) => void;
}

const InteractiveStoryNodeViewer: React.FC<InteractiveStoryNodeViewerProps> = ({
                                                                                   node,
                                                                                   puzzleData,
                                                                                   storyState,
                                                                                   onNavigate,
                                                                                   onPuzzleSubmit,
                                                                                   onChoiceSelect,
                                                                                   onActionTrigger,
                                                                               }) => {
    if (!node) {
        return <div className="p-4 text-center text-black">Loading story element...</div>;
    }

    const { node_type, content, story_node_choices } = node;

    const textColor = "text-black";
    const accentColor = "text-blue-600";
    const accentBgColor = "bg-blue-600 hover:bg-blue-700";
    const accentBorderColor = "border-blue-600";
    const subtleBgColor = "bg-gray-50";

    switch (node_type) {
        case 'narrative_block':
        case 'story_update': {
            const narrativeContent = content as any;
            return (
                <div className={`prose prose-lg max-w-none space-y-4 ${textColor}`}>
                    {narrativeContent.character_pov && (
                        <p className={`font-semibold italic ${textColor} opacity-80`}>
                            {narrativeContent.character_pov === 'protagonist' ? 'My thoughts:' : `${narrativeContent.character_pov_name || 'Narrator'}:`}
                        </p>
                    )}
                    {(narrativeContent.text || "The story unfolds...").split('\n').map((paragraph: string, index: number) => (
                        <p key={index}>{paragraph || <>&nbsp;</>}</p>
                    ))}
                    {narrativeContent.next_node_id && (
                        <div className="mt-8 text-center">
                            <Button onClick={() => onNavigate(narrativeContent.next_node_id)} size="lg" className={`${accentBgColor} text-white`}>
                                Continue
                            </Button>
                        </div>
                    )}
                </div>
            );
        }

        case 'dialogue_message': {
            const dialogueContent = content as any;
            const isProtagonist = dialogueContent.sender_name === "Protagonist" || dialogueContent.sender_name === "Me";
            const bubbleBase = "p-3 rounded-lg max-w-[85%] shadow";
            const protagonistBubble = `bg-blue-500 text-white self-end rounded-br-none ml-auto`;
            const otherBubble = `bg-gray-200 ${textColor} self-start rounded-bl-none`;

            return (
                <div className="space-y-4">
                    <div className={`dialogue-message flex flex-col ${isProtagonist ? 'items-end' : 'items-start'}`}>
                        <div className={`${bubbleBase} ${isProtagonist ? protagonistBubble : otherBubble}`}>
                            {!isProtagonist && dialogueContent.sender_name && (
                                <p className={`text-xs font-semibold mb-1 ${isProtagonist ? 'text-blue-100' : 'text-gray-600'}`}>{dialogueContent.sender_name}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{dialogueContent.message_text}</p>
                            {dialogueContent.timestamp && (
                                <p className={`text-xs opacity-70 mt-1 text-right ${isProtagonist ? 'text-blue-100' : 'text-gray-500'}`}>{dialogueContent.timestamp}</p>
                            )}
                        </div>
                    </div>
                    {dialogueContent.next_node_id && (
                        <div className="mt-8 text-center">
                            <Button onClick={() => onNavigate(dialogueContent.next_node_id)} size="lg" className={`${accentBgColor} text-white`}>
                                Continue
                            </Button>
                        </div>
                    )}
                </div>
            );
        }

        case 'visual_cue': { // Line 107 in previous error
            const visualContent = content as any;
            return (
                <div className="space-y-6">
                    {visualContent.image_url && (
                        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
                            <img src={visualContent.image_url} alt={visualContent.alt_text || "Visual cue"} className="w-full h-auto object-contain max-h-[70vh]" />
                            {visualContent.caption && <p className={`p-3 text-xs text-center ${textColor} opacity-80 ${subtleBgColor}`}>{visualContent.caption}</p>}
                        </div>
                    )}
                    {visualContent.audio_url && ( // Line 108 - Corrected: Added actual audio player
                        <div className="mt-4">
                            <audio controls src={visualContent.audio_url} className="w-full">
                                Your browser does not support the audio element.
                            </audio>
                            {/* Display caption for audio if no image or if caption is specifically for audio */}
                            {visualContent.caption && (!visualContent.image_url || visualContent.audio_caption) && (
                                <p className={`mt-1 text-xs text-center ${textColor} opacity-70`}>
                                    {visualContent.audio_caption || visualContent.caption}
                                </p>
                            )}
                        </div>
                    )}
                    {visualContent.next_node_id && ( // Line 109
                        <div className="mt-8 text-center"> {/* Line 110 */}
                            <Button onClick={() => onNavigate(visualContent.next_node_id)} size="lg" className={`${accentBgColor} text-white`}> {/* Line 111 */}
                                Continue
                            </Button>
                        </div>
                    )}
                </div>
            );
        }

        case 'puzzle_interaction': {
            const puzzleInteractionContent = content as any;
            return (
                <div className="space-y-6">
                    {puzzleInteractionContent.prompt_text && (
                        <div className={`prose prose-lg max-w-none mb-4 ${textColor}`}>
                            <p>{puzzleInteractionContent.prompt_text}</p>
                        </div>
                    )}
                    {puzzleData ? (
                        <PuzzleDisplay
                            puzzle={puzzleData}
                            storyState={storyState}
                            onSubmitAttempt={async (attempt) => onPuzzleSubmit(puzzleData.id, attempt)}
                        />
                    ) : (
                        <p className={`p-4 text-center text-red-500 bg-red-100 rounded-md`}>
                            Error: The puzzle for this interaction could not be loaded.
                        </p>
                    )}
                </div>
            );
        }

        case 'player_choice': {
            const choiceContent = content as any;
            const choices = Array.isArray(node.story_node_choices) ? node.story_node_choices : [];
            return (
                <div className="space-y-4">
                    {choiceContent.prompt && <p className={`text-xl ${textColor} mb-6 text-center font-semibold`}>{choiceContent.prompt}</p>}
                    <div className="flex flex-col space-y-3 items-center">
                        {choices.map((choice: HuntChoice) => (
                            <Button
                                key={choice.id}
                                onClick={() => onChoiceSelect(choice)}
                                variant="outline"
                                fullWidth
                                className={`max-w-md ${accentBorderColor} ${accentColor} hover:bg-blue-50`}
                            >
                                {choice.choice_text}
                            </Button>
                        ))}
                        {choices.length === 0 && <p className={`text-sm ${textColor} opacity-70`}>No choices here.</p>}
                    </div>
                </div>
            );
        }

        case 'action_trigger': {
            const actionContent = content as any;
            return (
                <div className="text-center space-y-6">
                    {actionContent.prompt_text && <p className={`mb-4 ${textColor}`}>{actionContent.prompt_text}</p>}
                    <Button
                        onClick={() => onActionTrigger({
                            success_node_id: actionContent.success_node_id,
                            story_state_update: actionContent.story_state_update
                        })}
                        size="lg"
                        className={`${accentBgColor} text-white`}
                        disabled={!actionContent.success_node_id}
                    >
                        {actionContent.action_label || "Perform Action"}
                    </Button>
                </div>
            );
        }

        case 'end_hunt': {
            const endContent = content as any;
            let outcomeClass = `border-gray-300 ${textColor}`;
            if (endContent.outcome === 'success') outcomeClass = `border-green-500 text-green-600`;
            if (endContent.outcome === 'failure') outcomeClass = `border-red-500 text-red-600`;

            return (
                <div className={`p-6 border-2 rounded-lg text-center space-y-4 ${outcomeClass}`}>
                    <h3 className="text-2xl font-semibold">{endContent.outcome === 'success' ? "Quest Completed!" : endContent.outcome === 'failure' ? "Quest Failed" : "The End"}</h3>
                    <p className="text-lg">{endContent.message || "Your adventure concludes here."}</p>
                    <Button onClick={() => onNavigate(null)} size="lg" className={`${accentBgColor} text-white`}>
                        Finish
                    </Button>
                </div>
            );
        }

        default:
            return (
                <div className={`p-4 text-center text-orange-600 bg-orange-100 rounded-md`}>
                    Encountered an unknown story chapter type: "{node_type}".
                </div>
            );
    }
};

export default InteractiveStoryNodeViewer;
