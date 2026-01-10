'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/protected-route';
import { WaterAnimation } from '@/components/features/water-animation';
import { ProgressDisplay } from '@/components/features/progress-display';
import { WaterIntakeForm } from '@/components/features/water-intake-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Users, Trophy, TrendingUp, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const { user, logout } = useAuth();
    const [todayIntake, setTodayIntake] = useState(0); // in ml
    const [loading, setLoading] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [lastAmount, setLastAmount] = useState(0);
    const [intakeHistory, setIntakeHistory] = useState<Array<{ time: string; amount: number }>>([]);

    const dailyGoalMl = (user?.dailyGoal || 2) * 1000;

    useEffect(() => {
        if (user) {
            loadTodayIntake();
        }
    }, [user]);

    const loadTodayIntake = async () => {
        if (!user) return;

        const today = format(new Date(), 'yyyy-MM-dd');
        const q = query(
            collection(db, 'waterIntakes'),
            where('userId', '==', user.uid),
            where('date', '==', today)
        );

        try {
            const snapshot = await getDocs(q);
            let total = 0;
            const history: Array<{ time: string; amount: number; timestamp: number }> = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                total += data.amount;
                history.push({
                    time: format(data.timestamp.toDate(), 'HH:mm'),
                    amount: data.amount,
                    timestamp: data.timestamp.toDate().getTime()
                });
            });

            // Sort by timestamp descending (most recent first)
            history.sort((a, b) => b.timestamp - a.timestamp);

            setTodayIntake(total);
            setIntakeHistory(history.map(({ time, amount }) => ({ time, amount })));
        } catch (error) {
            console.error('Error loading intake:', error);
        }
    };

    const handleAddWater = async (amount: number) => {
        if (!user || loading) return;

        setLoading(true);
        setLastAmount(amount);
        setShowAnimation(true);

        try {
            const today = format(new Date(), 'yyyy-MM-dd');

            await addDoc(collection(db, 'waterIntakes'), {
                userId: user.uid,
                amount,
                timestamp: Timestamp.now(),
                date: today
            });

            setTodayIntake((prev) => prev + amount);
            setIntakeHistory((prev) => [
                { time: format(new Date(), 'HH:mm'), amount },
                ...prev
            ]);

            toast.success(`Added ${amount}ml to your daily intake! 💧`);

            // Check for achievements
            const newTotal = todayIntake + amount;
            if (newTotal >= dailyGoalMl && todayIntake < dailyGoalMl) {
                toast.success('🎉 Daily goal achieved! Amazing work!', {
                    duration: 5000
                });
            }
        } catch (error: any) {
            console.error('Error adding water:', error);
            toast.error('Failed to add water intake');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"
                        animate={{
                            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                            y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                        }}
                        transition={{
                            duration: 20 + i * 5,
                            repeat: Infinity,
                            repeatType: 'reverse'
                        }}
                        style={{
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%'
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <header className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Hydration Tracker
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Welcome back, <span className="font-semibold">{user?.displayName}</span>!
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link href="/profile">
                            <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Profile</span>
                            </Button>
                        </Link>
                        <Link href="/leaderboard">
                            <Button variant="outline" size="sm">
                                <Trophy className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Leaderboard</span>
                            </Button>
                        </Link>
                        <Link href="/achievements">
                            <Button variant="outline" size="sm">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Achievements</span>
                            </Button>
                        </Link>
                        <Link href="/friends">
                            <Button variant="outline" size="sm">
                                <Users className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Friends</span>
                            </Button>
                        </Link>
                        <Button onClick={handleLogout} variant="ghost" size="sm">
                            <LogOut className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 py-8 relative">
                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Progress section */}
                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-xl border-0">
                        <CardHeader>
                            <CardTitle className="text-center">Today&apos;s Progress</CardTitle>
                            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                                Daily Goal: {user?.dailyGoal}L ({user?.weight}kg ÷ 20)
                            </p>
                        </CardHeader>
                        <CardContent className="flex justify-center pb-8">
                            <ProgressDisplay consumed={todayIntake} goal={dailyGoalMl} />
                        </CardContent>
                    </Card>

                    {/* Input section */}
                    <div className="space-y-6">
                        <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-xl border-0">
                            <CardHeader>
                                <CardTitle>Add Water Intake</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <WaterIntakeForm onAdd={handleAddWater} disabled={loading} />
                            </CardContent>
                        </Card>

                        {/* Today's history */}
                        {intakeHistory.length > 0 && (
                            <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-xl border-0">
                                <CardHeader>
                                    <CardTitle className="text-lg">Today&apos;s History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {intakeHistory.map((entry, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30"
                                            >
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {entry.time}
                                                </span>
                                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    +{entry.amount}ml
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {/* Water animation overlay */}
            <AnimatePresence>
                {showAnimation && (
                    <WaterAnimation
                        amount={lastAmount}
                        onComplete={() => setShowAnimation(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
