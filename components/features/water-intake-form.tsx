'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplets, Plus } from 'lucide-react';

interface WaterIntakeFormProps {
    onAdd: (amount: number) => void;
    disabled?: boolean;
}

const QUICK_AMOUNTS = [250, 500, 750, 1000];

export function WaterIntakeForm({ onAdd, disabled = false }: WaterIntakeFormProps) {
    const [customAmount, setCustomAmount] = useState('');
    const [selectedQuick, setSelectedQuick] = useState<number | null>(null);

    const handleQuickAdd = (amount: number) => {
        setSelectedQuick(amount);
        onAdd(amount);

        // Reset selection after animation
        setTimeout(() => setSelectedQuick(null), 300);
    };

    const handleCustomAdd = () => {
        const amount = parseInt(customAmount);
        if (amount > 0 && amount <= 5000) {
            onAdd(amount);
            setCustomAmount('');
        }
    };

    return (
        <div className="space-y-6">
            {/* Quick add buttons */}
            <div>
                <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Quick Add
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {QUICK_AMOUNTS.map((amount) => (
                        <motion.div
                            key={amount}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => handleQuickAdd(amount)}
                                disabled={disabled}
                                className={`
                  w-full h-20 text-lg font-semibold
                  bg-gradient-to-br from-blue-500 to-cyan-500 
                  hover:from-blue-600 hover:to-cyan-600
                  text-white shadow-lg
                  transition-all duration-300
                  ${selectedQuick === amount ? 'ring-4 ring-blue-300' : ''}
                `}
                            >
                                <div className="flex flex-col items-center">
                                    <Droplets className="w-6 h-6 mb-1" />
                                    <span>{amount}ml</span>
                                </div>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Custom amount */}
            <div>
                <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Custom Amount
                </h3>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Enter ml (max 5000)"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleCustomAdd();
                            }
                        }}
                        min="1"
                        max="5000"
                        disabled={disabled}
                        className="h-12 text-lg"
                    />
                    <Button
                        onClick={handleCustomAdd}
                        disabled={disabled || !customAmount || parseInt(customAmount) <= 0}
                        className="h-12 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Enter amount in milliliters (ml)
                </p>
            </div>

            {/* Fun tip */}
            <motion.div
                className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <span className="font-semibold">Tip:</span> Spread your water intake throughout the day for better hydration!
                </p>
            </motion.div>
        </div>
    );
}
