'use client';

import { motion } from 'framer-motion';
import { LiquidWave } from './water-animation';
import { Droplets } from 'lucide-react';

interface ProgressDisplayProps {
    consumed: number; // in ml
    goal: number; // in ml
}

export function ProgressDisplay({ consumed, goal }: ProgressDisplayProps) {
    const percentage = Math.min((consumed / goal) * 100, 100);
    const litersConsumed = (consumed / 1000).toFixed(2);
    const litersGoal = (goal / 1000).toFixed(1);

    return (
        <div className="flex flex-col items-center">
            {/* Circular progress indicator */}
            <div className="relative w-64 h-64">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-800" />

                {/* Liquid wave */}
                <LiquidWave percentage={percentage} />

                {/* Progress text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <motion.div
                        key={consumed}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="text-5xl font-bold text-white drop-shadow-lg">
                            {Math.round(percentage)}%
                        </div>
                        <div className="text-sm text-white/90 drop-shadow-md mt-2 text-center">
                            {litersConsumed}L / {litersGoal}L
                        </div>
                    </motion.div>
                </div>

                {/* Glow effect */}
                {percentage > 0 && (
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
                            filter: 'blur(20px)'
                        }}
                        animate={{
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity
                        }}
                    />
                )}
            </div>

            {/* Status message */}
            <motion.div
                className="mt-6 text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {percentage === 0 && (
                    <div className="text-lg text-gray-600 dark:text-gray-400">
                        <Droplets className="inline w-5 h-5 mb-1 mr-1" />
                        Start your hydration journey!
                    </div>
                )}
                {percentage > 0 && percentage < 50 && (
                    <div className="text-lg text-blue-600 dark:text-blue-400">
                        Keep going! You&apos;re on track 💪
                    </div>
                )}
                {percentage >= 50 && percentage < 100 && (
                    <div className="text-lg text-cyan-600 dark:text-cyan-400">
                        You&apos;re more than halfway there! 🌊
                    </div>
                )}
                {percentage >= 100 && (
                    <motion.div
                        className="text-lg font-bold text-green-600 dark:text-green-400"
                        animate={{
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity
                        }}
                    >
                        Goal achieved! Amazing! 🎉💧
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
