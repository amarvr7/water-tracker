'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Scale, User, Mail, Hash, Droplets } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}

function ProfileContent() {
    const { user, updateUserWeight } = useAuth();
    const router = useRouter();
    const [weightKg, setWeightKg] = useState('');
    const [weightLbs, setWeightLbs] = useState('');
    const [loading, setLoading] = useState(false);
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

    useEffect(() => {
        if (user?.weight) {
            setWeightKg(user.weight.toString());
            setWeightLbs((user.weight * 2.20462).toFixed(1));
        }
    }, [user]);

    const handleWeightChange = (value: string, unitType: 'kg' | 'lbs') => {
        const numValue = parseFloat(value);

        if (unitType === 'kg') {
            setWeightKg(value);
            if (!isNaN(numValue)) {
                setWeightLbs((numValue * 2.20462).toFixed(1));
            }
        } else {
            setWeightLbs(value);
            if (!isNaN(numValue)) {
                setWeightKg((numValue / 2.20462).toFixed(1));
            }
        }
    };

    const handleUpdateWeight = async (e: React.FormEvent) => {
        e.preventDefault();

        const weightValue = parseFloat(weightKg);
        if (isNaN(weightValue) || weightValue <= 0 || weightValue > 500) {
            toast.error('Please enter a valid weight (1-500kg)');
            return;
        }

        setLoading(true);
        try {
            await updateUserWeight(weightValue);
            toast.success('Weight updated successfully! 💪');
        } catch (error: any) {
            console.error('Error updating weight:', error);
            toast.error('Failed to update weight');
        } finally {
            setLoading(false);
        }
    };

    const currentDailyGoal = user?.dailyGoal || 0;
    const newDailyGoal = parseFloat(weightKg) > 0 ? (parseFloat(weightKg) / 20).toFixed(1) : '0';
    const hasChanges = user?.weight !== parseFloat(weightKg);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"
                        animate={{
                            x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                            y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
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
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Profile Settings
                    </h1>
                    <div className="w-32" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 py-8 relative">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* User Info Card */}
                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-xl border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Your Information
                            </CardTitle>
                            <CardDescription>View your account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <User className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Display Name</p>
                                    <p className="font-medium">{user?.displayName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="font-medium">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                <Hash className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Friend Code</p>
                                    <p className="font-mono font-bold text-lg">{user?.friendCode}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weight Settings Card */}
                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-xl border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scale className="w-5 h-5" />
                                Weight Settings
                            </CardTitle>
                            <CardDescription>
                                Update your weight to personalize your daily hydration goal
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateWeight} className="space-y-6">
                                {/* Unit Tabs */}
                                <Tabs value={unit} onValueChange={(v) => setUnit(v as 'kg' | 'lbs')} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="kg">Kilograms (kg)</TabsTrigger>
                                        <TabsTrigger value="lbs">Pounds (lbs)</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="kg" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <label htmlFor="weight-kg" className="text-sm font-medium">
                                                Weight (kg)
                                            </label>
                                            <Input
                                                id="weight-kg"
                                                type="number"
                                                step="0.1"
                                                placeholder="70"
                                                value={weightKg}
                                                onChange={(e) => handleWeightChange(e.target.value, 'kg')}
                                                className="h-12 text-lg"
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="lbs" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <label htmlFor="weight-lbs" className="text-sm font-medium">
                                                Weight (lbs)
                                            </label>
                                            <Input
                                                id="weight-lbs"
                                                type="number"
                                                step="0.1"
                                                placeholder="154"
                                                value={weightLbs}
                                                onChange={(e) => handleWeightChange(e.target.value, 'lbs')}
                                                className="h-12 text-lg"
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                {/* Current vs New Goal */}
                                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                            Daily Hydration Goal
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">Current</p>
                                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                                {currentDailyGoal.toFixed(1)}L
                                            </p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                ({user?.weight}kg ÷ 20)
                                            </p>
                                        </div>
                                        {hasChanges && parseFloat(weightKg) > 0 && (
                                            <div>
                                                <p className="text-sm text-green-700 dark:text-green-300">New Goal</p>
                                                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                    {newDailyGoal}L
                                                </p>
                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                    ({parseFloat(weightKg).toFixed(1)}kg ÷ 20)
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                    disabled={loading || !hasChanges || !parseFloat(weightKg)}
                                >
                                    {loading ? 'Updating...' : 'Update Weight'}
                                </Button>

                                {!hasChanges && (
                                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                                        Your weight is up to date
                                    </p>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <motion.div
                        className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-sm text-cyan-800 dark:text-cyan-300">
                            💡 <span className="font-semibold">Formula:</span> Your daily water intake goal is calculated as 1 liter per 20kg of body weight. This is a general guideline - adjust based on your activity level and climate!
                        </p>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
