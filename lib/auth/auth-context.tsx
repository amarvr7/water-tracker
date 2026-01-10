'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string, weight: number) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateUserWeight: (newWeight: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    setUser(userDoc.data() as User);
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string, displayName: string, weight: number) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Generate unique friend code
        const friendCode = uid.substring(0, 8).toUpperCase();

        // Calculate daily goal based on weight
        const dailyGoal = weight / 20;

        // Create user document in Firestore
        const userData: User = {
            uid,
            email,
            displayName,
            weight,
            dailyGoal,
            friends: [],
            createdAt: new Date(),
            friendCode
        };

        await setDoc(doc(db, 'users', uid), userData);
        setUser(userData);
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        // Check if user document exists
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));

        if (!userDoc.exists()) {
            // This is a new Google user, we should redirect them to complete their profile
            // For now, we'll create a basic profile with default weight
            const friendCode = result.user.uid.substring(0, 8).toUpperCase();
            const defaultWeight = 70; // Default 70kg
            const userData: User = {
                uid: result.user.uid,
                email: result.user.email || '',
                displayName: result.user.displayName || 'User',
                weight: defaultWeight,
                dailyGoal: defaultWeight / 20,
                friends: [],
                createdAt: new Date(),
                friendCode
            };
            await setDoc(doc(db, 'users', result.user.uid), userData);
            setUser(userData);
        }
    };

    const updateUserWeight = async (newWeight: number) => {
        if (!user) return;

        // Calculate new daily goal
        const dailyGoal = newWeight / 20;

        // Update Firestore
        await setDoc(doc(db, 'users', user.uid), {
            ...user,
            weight: newWeight,
            dailyGoal
        });

        // Update local state
        setUser({
            ...user,
            weight: newWeight,
            dailyGoal
        });
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    const value = {
        user,
        firebaseUser,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        updateUserWeight
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
