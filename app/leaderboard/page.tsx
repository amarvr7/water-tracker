'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import ProtectedRoute from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';

interface LeaderboardEntry {
    userId: string;
    displayName: string;
    weeklyCompletion: number;
    todayIntake: number;
    rank: number;
}

export default function LeaderboardPage() {
    return (
        <ProtectedRoute>
            <LeaderboardContent />
        </ProtectedRoute>
    );
}

function LeaderboardContent() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadLeaderboard();
        }
    }, [user]);

    const loadLeaderboard = async () => {
        if (!user || !user.friends) return;

        setLoading(true);
        try {
            const friendIds = [...user.friends, user.uid];
            const entries: LeaderboardEntry[] = [];

            for (const friendId of friendIds) {
                const userDoc = await getDoc(doc(db, 'users', friendId));
                if (!userDoc.exists()) continue;

                const userData = userDoc.data();
                const today = format(new Date(), 'yyyy-MM-dd');

                const intakesQuery = query(
                    collection(db, 'waterIntakes'),
                    where('userId', '==', friendId),
                    where('date', '==', today)
                );

                const intakesSnapshot = await getDocs(intakesQuery);
                let todayIntake = 0;
                intakesSnapshot.forEach((doc) => {
                    todayIntake += doc.data().amount;
                });

                const goalMl = userData.dailyGoal * 1000;
                const completion = Math.min((todayIntake / goalMl) * 100, 100);

                entries.push({
                    userId: friendId,
                    displayName: userData.displayName,
                    weeklyCompletion: completion,
                    todayIntake,
                    rank: 0
                });
            }

            entries.sort((a, b) => b.weeklyCompletion - a.weeklyCompletion);
            entries.forEach((entry, index) => {
                entry.rank = index + 1;
            });

            setLeaderboard(entries);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <TrendingUp className="w-6 h-6 text-gray-400" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <Link href="/dashboard">
                            <Button variant="ghost">← Back to Dashboard</Button>
                        </Link>
                    </div>

                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-2xl border-0">
                        <CardHeader>
                            <CardTitle className="text-3xl text-center flex items-center justify-center gap-3">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                Leaderboard
                            </CardTitle>
                            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                                Today&apos;s standings among friends
                            </p>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : leaderboard.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Add friends to see the leaderboard!
                                    </p>
                                    <Link href="/friends">
                                        <Button className="mt-4">Add Friends</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leaderboard.map((entry, index) => (
                                        <motion.div
                                            key={entry.userId}
                                            initial={{ x: -50, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`
                        p-4 rounded-lg flex items-center gap-4
                        ${entry.userId === user?.uid
                                                    ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500'
                                                    : 'bg-gray-50 dark:bg-gray-800/50'
                                                }
                      `}
                                        >
                                            <div className="flex-shrink-0">
                                                {getRankIcon(entry.rank)}
                                            </div>

                                            <div className="flex-grow">
                                                <div className="font-semibold text-lg">
                                                    {entry.displayName}
                                                    {entry.userId === user?.uid && (
                                                        <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(You)</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {entry.todayIntake}ml today
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {Math.round(entry.weeklyCompletion)}%
                                                </div>
                                                <div className="text-xs text-gray-500">completed</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
