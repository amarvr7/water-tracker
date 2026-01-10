export interface User {
    uid: string;
    email: string;
    displayName: string;
    weight: number; // in kg
    dailyGoal: number; // in liters, calculated as weight / 20
    friends: string[]; // array of friend UIDs
    createdAt: Date;
    friendCode?: string; // unique code for adding friends
}

export interface WaterIntake {
    id: string;
    userId: string;
    amount: number; // in ml
    timestamp: Date;
    date: string; // YYYY-MM-DD for daily aggregation
}

export interface Achievement {
    id: string;
    userId: string;
    type: AchievementType;
    unlockedAt: Date;
}

export type AchievementType =
    | 'first_drop'
    | 'perfectly_hydrated'
    | 'week_warrior'
    | 'hydration_hero'
    | 'marathon_sipper'
    | 'social_butterfly'
    | 'overachiever';

export interface AchievementDefinition {
    type: AchievementType;
    name: string;
    description: string;
    icon: string;
}

export interface DailyProgress {
    date: string;
    consumed: number; // in ml
    goal: number; // in ml
    percentage: number;
    completed: boolean;
}

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    weeklyCompletion: number; // percentage
    streak: number;
    rank: number;
}
