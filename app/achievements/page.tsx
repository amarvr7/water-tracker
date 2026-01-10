'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ProtectedRoute from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Droplet, Flame, Users as UsersIcon, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AchievementType, AchievementDefinition } from '@/types';

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
    {
        type: 'first_drop',
        name: 'First Drop',
        description: 'Log your first water intake',
        icon: '💧'
    },
    {
        type: 'perfectly_hydrated',
        name: 'Perfectly Hydrated',
        description: 'Reach 100% of your daily goal',
        icon: '🎯'
    },
    {
        type: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥'
    },
    {
        type: 'hydration_hero',
        name: 'Hydration Hero',
        description: 'Maintain a 30-day streak',
        icon: '🦸'
    },
    {
        type: 'marathon_sipper',
        name: 'Marathon Sipper',
        description: 'Drink 1000 total liters',
        icon: '🏃'
    },
    {
        type: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Add 5 friends',
        icon: '🦋'
    },
    {
        type: 'overachiever',
        name: 'Overachiever',
        description: 'Exceed daily goal 10 times',
        icon: '⭐'
    }
];

export default function AchievementsPage() {
    return (
        <ProtectedRoute>
            <AchievementsContent />
        </ProtectedRoute>
    );
}

function AchievementsContent() {
    const { user } = useAuth();
    const [unlockedAchievements, setUnlockedAchievements] = useState<Set<AchievementType>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadAchievements();
        }
    }, [user]);

    const loadAchievements = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const q = query(
                collection(db, 'achievements'),
                where('userId', '==', user.uid)
            );

            const snapshot = await getDocs(q);
            const unlocked = new Set<AchievementType>();

            snapshot.forEach((doc) => {
                unlocked.add(doc.data().type);
            });

            setUnlockedAchievements(unlocked);
        } catch (error) {
            console.error('Error loading achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const unlockedCount = unlockedAchievements.size;
    const totalCount = ACHIEVEMENT_DEFINITIONS.length;
    const completionPercentage = (unlockedCount / totalCount) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Link href="/dashboard">
                            <Button variant="ghost">← Back to Dashboard</Button>
                        </Link>
                    </div>

                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-2xl border-0 mb-8">
                        <CardHeader>
                            <CardTitle className="text-3xl text-center flex items-center justify-center gap-3">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                Achievements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-6">
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                    {unlockedCount} / {totalCount}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    {Math.round(completionPercentage)}% Complete
                                </p>
                                <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionPercentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {ACHIEVEMENT_DEFINITIONS.map((achievement, index) => {
                                const isUnlocked = unlockedAchievements.has(achievement.type);

                                return (
                                    <motion.div
                                        key={achievement.type}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card
                                            className={`
                        backdrop-blur-sm shadow-lg border-0
                        ${isUnlocked
                                                    ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 ring-2 ring-blue-400'
                                                    : 'bg-white/70 dark:bg-slate-900/70 opacity-60'
                                                }
                      `}
                                        >
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-4xl">{achievement.icon}</div>
                                                        <div>
                                                            <CardTitle className="text-lg">{achievement.name}</CardTitle>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {achievement.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isUnlocked && (
                                                        <Badge className="bg-green-500">Unlocked</Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
