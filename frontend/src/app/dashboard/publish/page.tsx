'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Content {
    id: string;
    title: string;
    slug: string;
    status: string;
}

interface SocialAccount {
    platform: string;
    isActive: boolean;
}

interface QueueItem {
    id: string;
    platforms: string[];
    status: string;
    createdAt: string;
    content: {
        title: string;
        slug: string;
    };
}

export default function PublishPage() {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<Content[]>([]);
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [selectedContent, setSelectedContent] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const fetchData = async () => {
        try {
            const [contentRes, accountsRes, queueRes] = await Promise.all([
                api.get('/api/content?my=true'),
                api.get('/api/social/accounts'),
                api.get('/api/publish/queue'),
            ]);

            setContent(contentRes.data.filter((c: Content) => c.status === 'PUBLISHED'));
            setAccounts(accountsRes.data);
            setQueue(queueRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!selectedContent || selectedPlatforms.length === 0) {
            alert('Please select content and at least one platform');
            return;
        }

        try {
            await api.post('/api/publish/now', {
                contentId: selectedContent,
                platforms: selectedPlatforms,
            });

            alert('Publishing initiated! Check the queue below.');
            setSelectedContent('');
            setSelectedPlatforms([]);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to publish');
        }
    };

    const handleCancelQueue = async (id: string) => {
        if (!confirm('Cancel this queued publish?')) return;

        try {
            await api.delete(`/api/publish/${id}`);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to cancel');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-2xl font-semibold animate-pulse">Loading...</div>
            </div>
        );
    }

    const activePlatforms = accounts.filter(a => a.isActive);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="backdrop-blur-md bg-white/10 border-b border-white/20 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            Cross-Platform Publishing
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-10">
                {/* No Active Accounts Warning */}
                {activePlatforms.length === 0 && (
                    <div className="backdrop-blur-md bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-10">
                        <h2 className="text-xl font-bold text-yellow-400 mb-2">⚠️ No Active Social Accounts</h2>
                        <p className="text-gray-300 mb-4">
                            You need to connect at least one social media account before you can publish.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard/social')}
                            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400"
                        >
                            Connect Accounts
                        </button>
                    </div>
                )}

                {/* Publish Form */}
                {activePlatforms.length > 0 && (
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 mb-10">
                        <h2 className="text-2xl font-bold text-white mb-6">Publish Content</h2>

                        <div className="space-y-6">
                            {/* Select Content */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Select Content to Publish
                                </label>
                                <select
                                    value={selectedContent}
                                    onChange={(e) => setSelectedContent(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="">-- Select a post --</option>
                                    {content.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Select Platforms */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3">
                                    Select Platforms
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {activePlatforms.map((account) => (
                                        <label
                                            key={account.platform}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedPlatforms.includes(account.platform)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPlatforms([...selectedPlatforms, account.platform]);
                                                    } else {
                                                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== account.platform));
                                                    }
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-white font-medium">
                                                {account.platform === 'TWITTER' && '𝕏 Twitter'}
                                                {account.platform === 'FACEBOOK' && '📘 Facebook'}
                                                {account.platform === 'INSTAGRAM' && '📷 Instagram'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Publish Button */}
                            <button
                                onClick={handlePublish}
                                disabled={!selectedContent || selectedPlatforms.length === 0}
                                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🚀 Publish Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Publish Queue */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Publish Queue</h2>

                    {queue.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-gray-400">No queued publications</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {queue.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                                >
                                    <div>
                                        <h3 className="font-semibold text-white">{item.content.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-gray-400">
                                                {(item.platforms as string[]).join(', ')}
                                            </span>
                                            <span className={`text-sm px-2 py-1 rounded ${item.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                                    item.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                                                        item.status === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </span>
                                        {item.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleCancelQueue(item.id)}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
