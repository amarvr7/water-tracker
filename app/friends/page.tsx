'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import ProtectedRoute from '@/components/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FriendsPage() {
    return (
        <ProtectedRoute>
            <FriendsContent />
        </ProtectedRoute>
    );
}

function FriendsContent() {
    const { user } = useAuth();
    const [friendCode, setFriendCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyCode = async () => {
        if (user?.friendCode) {
            await navigator.clipboard.writeText(user.friendCode);
            setCopied(true);
            toast.success('Friend code copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleAddFriend = async () => {
        if (!user || !friendCode.trim()) return;

        setLoading(true);
        try {
            // Search for user with this friend code
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('friendCode', '==', friendCode.toUpperCase()));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                toast.error('Friend code not found');
                return;
            }

            const friendDoc = snapshot.docs[0];
            const friendId = friendDoc.id;

            if (friendId === user.uid) {
                toast.error('You cannot add yourself as a friend');
                return;
            }

            if (user.friends.includes(friendId)) {
                toast.error('Already friends with this user');
                return;
            }

            // Add friend to both users
            await updateDoc(doc(db, 'users', user.uid), {
                friends: arrayUnion(friendId)
            });

            await updateDoc(doc(db, 'users', friendId), {
                friends: arrayUnion(user.uid)
            });

            toast.success(`Added ${friendDoc.data().displayName} as a friend! 🎉`);
            setFriendCode('');

            // Reload page to show updated friends list
            window.location.reload();
        } catch (error) {
            console.error('Error adding friend:', error);
            toast.error('Failed to add friend');
        } finally {
            setLoading(false);
        }
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

                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-2xl border-0 mb-6">
                        <CardHeader>
                            <CardTitle className="text-3xl text-center flex items-center justify-center gap-3">
                                <Users className="w-8 h-8 text-blue-500" />
                                Friends
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Your friend code */}
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <UserPlus className="w-5 h-5" />
                                    Your Friend Code
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Share this code with friends so they can add you
                                </p>
                                <div className="flex gap-2">
                                    <div className="flex-grow p-3 rounded-lg bg-white dark:bg-slate-800 font-mono text-2xl font-bold text-center border-2 border-blue-500">
                                        {user?.friendCode || 'Loading...'}
                                    </div>
                                    <Button
                                        onClick={handleCopyCode}
                                        className="px-6"
                                        variant={copied ? 'default' : 'outline'}
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Add friend */}
                            <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <UserPlus className="w-5 h-5" />
                                    Add a Friend
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Enter your friend&apos;s code to connect
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter friend code (e.g., ABC123XY)"
                                        value={friendCode}
                                        onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddFriend();
                                            }
                                        }}
                                        className="h-12 text-lg font-mono"
                                        maxLength={8}
                                    />
                                    <Button
                                        onClick={handleAddFriend}
                                        disabled={loading || !friendCode.trim()}
                                        className="px-6 h-12 bg-gradient-to-r from-blue-600 to-cyan-600"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>

                            {/* Friends list */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Your Friends ({user?.friends?.length || 0})
                                </h3>
                                {(!user?.friends || user.friends.length === 0) ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No friends added yet</p>
                                        <p className="text-sm mt-1">Share your friend code to get started!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {user.friends.map((friendId, index) => (
                                            <FriendCard key={friendId} friendId={friendId} index={index} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function FriendCard({ friendId, index }: { friendId: string; index: number }) {
    const [friendData, setFriendData] = useState<any>(null);

    useEffect(() => {
        loadFriendData();
    }, [friendId]);

    const loadFriendData = async () => {
        try {
            const friendDoc = await getDoc(doc(db, 'users', friendId));
            if (friendDoc.exists()) {
                setFriendData(friendDoc.data());
            }
        } catch (error) {
            console.error('Error loading friend data:', error);
        }
    };

    if (!friendData) {
        return (
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
                <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {friendData.displayName[0].toUpperCase()}
                </div>
                <div>
                    <div className="font-semibold">{friendData.displayName}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Goal: {friendData.dailyGoal}L/day
                    </div>
                </div>
            </div>
            <Badge variant="outline">Friend</Badge>
        </motion.div>
    );
}
