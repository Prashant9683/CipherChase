// src/pages/LeaderboardPage.tsx
import React, { useState, useEffect } from 'react';
import { fetchGlobalLeaderboard } from '../services/leaderboardService';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'; // Assume Avatar component
import { Medal, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    score: number;
    rank?: number;
}

const LeaderboardPage: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [metric, setMetric] = useState<'total_points' | 'total_hunts_completed'>('total_points');

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchGlobalLeaderboard(metric, 20); // Top 20
                setLeaderboard(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load leaderboard.");
            } finally {
                setLoading(false);
            }
        };
        loadLeaderboard();
    }, [metric]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-10 font-sans">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <header className="mb-10 text-center">
                    <TrendingUp className="mx-auto h-16 w-16 text-amber-600 mb-4" />
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 font-serif tracking-tight">
                        Hall of Legends
                    </h1>
                    <p className="text-lg text-slate-600 mt-3 max-w-xl mx-auto">
                        See who stands at the pinnacle of CipherChase!
                    </p>
                    <div className="mt-6">
                        <Button variant={metric === 'total_points' ? 'primary' : 'outline'} onClick={() => setMetric('total_points')} className="mr-2">Top Points</Button>
                        <Button variant={metric === 'total_hunts_completed' ? 'primary' : 'outline'} onClick={() => setMetric('total_hunts_completed')}>Most Hunts Solved</Button>
                    </div>
                </header>

                {loading && <div className="flex justify-center py-10"><Loader message="Fetching legends..." size="lg" /></div>}
                {error && <p className="text-center text-red-500 py-10">Error: {error}</p>}

                {!loading && !error && (
                    <Card className="shadow-xl max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-slate-700">
                                Top Players by {metric === 'total_points' ? 'Points' : 'Hunts Completed'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {leaderboard.length === 0 ? (
                                <p className="text-slate-500 text-center py-4">No rankings available yet.</p>
                            ) : (
                                <ul className="divide-y divide-slate-200">
                                    {leaderboard.map((entry, index) => (
                                        <li key={entry.user_id} className="py-3 px-1 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center">
                                                <span className="text-lg font-semibold text-slate-500 w-8 text-center">{entry.rank || index + 1}.</span>
                                                <Avatar className="h-10 w-10 ml-3 mr-3">
                                                    <AvatarImage src={entry.avatar_url || undefined} alt={entry.display_name || 'User'} />
                                                    <AvatarFallback>{(entry.display_name || 'U').charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-slate-700">{entry.display_name || 'Anonymous User'}</span>
                                                {index < 3 && <Medal size={18} className={`ml-2 ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-400' : 'text-orange-400'}`} />}
                                            </div>
                                            <span className="font-bold text-blue-600">{entry.score.toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;
