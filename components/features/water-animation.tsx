'use client';

import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface WaterAnimationProps {
    amount: number; // in ml
    onComplete?: () => void;
}

export function WaterAnimation({ amount, onComplete }: WaterAnimationProps) {
    useEffect(() => {
        // Trigger confetti for larger amounts
        if (amount >= 500) {
            confetti({
                particleCount: amount >= 1000 ? 150 : 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#06b6d4', '#0ea5e9', '#60a5fa']
            });
        }

        if (onComplete) {
            const timer = setTimeout(onComplete, 1500);
            return () => clearTimeout(timer);
        }
    }, [amount, onComplete]);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            {/* Water droplets */}
            {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-8 h-10 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full opacity-80"
                    initial={{
                        y: -100,
                        x: Math.random() * 200 - 100,
                        scale: 0,
                        opacity: 0
                    }}
                    animate={{
                        y: [0, 50, 100],
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        delay: i * 0.1,
                        ease: "easeOut"
                    }}
                    style={{
                        filter: 'blur(1px)'
                    }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/40 rounded-full" />
                </motion.div>
            ))}

            {/* Success message */}
            <motion.div
                className="text-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="text-6xl mb-4"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                        duration: 0.6,
                        times: [0, 0.5, 0.8, 1]
                    }}
                >
                    💧
                </motion.div>
                <motion.p
                    className="text-3xl font-bold text-blue-600 dark:text-cyan-400"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    +{amount}ml
                </motion.p>
                <motion.p
                    className="text-lg text-blue-500 dark:text-cyan-500 mt-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Great job staying hydrated!
                </motion.p>
            </motion.div>
        </div>
    );
}

// Liquid wave effect component
export function LiquidWave({ percentage }: { percentage: number }) {
    return (
        <div className="absolute inset-0 overflow-hidden rounded-full">
            <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-400"
                initial={{ height: '0%' }}
                animate={{ height: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
            >
                {/* Wave animation */}
                <svg
                    className="absolute top-0 left-0 w-full"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    style={{ height: '20px', transform: 'translateY(-100%)' }}
                >
                    <motion.path
                        d="M0,0 C150,60 350,0 600,60 C850,120 1050,60 1200,60 L1200,120 L0,120 Z"
                        fill="currentColor"
                        className="text-blue-500"
                        animate={{
                            d: [
                                "M0,0 C150,60 350,0 600,60 C850,120 1050,60 1200,60 L1200,120 L0,120 Z",
                                "M0,60 C150,0 350,120 600,0 C850,60 1050,0 1200,60 L1200,120 L0,120 Z",
                                "M0,0 C150,60 350,0 600,60 C850,120 1050,60 1200,60 L1200,120 L0,120 Z"
                            ]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </svg>

                {/* Bubbles */}
                {percentage > 0 && Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-white/30 rounded-full"
                        style={{
                            left: `${20 + i * 15}%`,
                            bottom: `${Math.random() * 20}%`
                        }}
                        animate={{
                            y: [-50, -150],
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.3
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
}
