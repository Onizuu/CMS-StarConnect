'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface SocialAccount {
    id: string;
    platform: string;
    username: string;
    isActive: boolean;
    createdAt: string;
}

export default function SocialAccountsPage() {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConnectModal, setShowConnectModal] = useState(false);

    // Twitter connection form
    const [twitterData, setTwitterData] = useState({
        accessToken: '',
        accessSecret: '',
        twitterUserId: '',
        username: '',
    });

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAccounts();
        }
    }, [isAuthenticated]);

    const fetchAccounts = async () => {
        try {
            const response = await api.get('/api/social/accounts');
            setAccounts(response.data);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectTwitter = async () => {
        try {
            await api.post('/api/social/connect/twitter', twitterData);
            alert('Twitter connected successfully!');
            setShowConnectModal(false);
            setTwitterData({ accessToken: '', accessSecret: '', twitterUserId: '', username: '' });
            fetchAccounts();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to connect Twitter');
        }
    };

    const handleDisconnect = async (id: string, platform: string) => {
        if (!confirm(`Disconnect ${platform} account?`)) return;

        try {
            await api.delete(`/api/social/account/${id}`);
            fetchAccounts();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to disconnect');
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await api.patch(`/api/social/account/${id}/toggle`);
            fetchAccounts();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to toggle');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-2xl font-semibold animate-pulse">Loading...</div>
            </div>
        );
    }

    const platforms = [
        { name: 'Twitter/X', icon: '𝕏', color: 'from-blue-500 to-cyan-500', key: 'TWITTER' },
        { name: 'Facebook', icon: '📘', color: 'from-blue-700 to-blue-900', key: 'FACEBOOK' },
        { name: 'Instagram', icon: '📷', color: 'from-pink-500 to-purple-600', key: 'INSTAGRAM' },
    ];

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
                            Social Accounts
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-10">
                {/* Info Banner */}
                <div className="backdrop-blur-md bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-10">
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <span>ℹ️</span>
                        Social Media Integration
                    </h2>
                    <p className="text-gray-300">
                        Connect your social media accounts to publish automatically across platforms and display a unified activity feed on your public profile.
                    </p>
                </div>

                {/* Platforms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {platforms.map((platform) => {
                        const connected = accounts.find(a => a.platform === platform.key);

                        return (
                            <div
                                key={platform.key}
                                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6"
                            >
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${platform.color} flex items-center justify-center text-3xl mb-4`}>
                                    {platform.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{platform.name}</h3>

                                {connected ? (
                                    <div>
                                        <p className="text-green-400 text-sm mb-2">✓ Connected as @{connected.username}</p>
                                        <div className="flex items-center gap-2 mb-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={connected.isActive}
                                                    onChange={() => handleToggle(connected.id)}
                                                    className="w-4 h-4 rounded"
                                                />
                                                <span className="text-sm text-gray-300">Active</span>
                                            </label>
                                        </div>
                                        <button
                                            onClick={() => handleDisconnect(connected.id, platform.name)}
                                            className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-400 text-sm mb-3">Not connected</p>
                                        {platform.key === 'TWITTER' ? (
                                            <button
                                                onClick={() => setShowConnectModal(true)}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                Connect
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => alert(`${platform.name} integration coming soon!`)}
                                                className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg font-medium"
                                            >
                                                Coming Soon
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Connected Accounts Table */}
                {accounts.length > 0 && (
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Connected Accounts</h2>
                        <div className="space-y-3">
                            {accounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl">
                                            {account.platform === 'TWITTER' && '𝕏'}
                                            {account.platform === 'FACEBOOK' && '📘'}
                                            {account.platform === 'INSTAGRAM' && '📷'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">@{account.username}</p>
                                            <p className="text-sm text-gray-400">{account.platform}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-sm ${account.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                                            {account.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(account.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Connect Twitter Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="backdrop-blur-md bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-4">Connect Twitter Account</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            Note: For demo purposes, enter your Twitter API credentials directly. In production, this would use OAuth flow.
                        </p>

                        <div className="space-y-4 mb-6">
                            <input
                                type="text"
                                placeholder="Access Token"
                                value={twitterData.accessToken}
                                onChange={(e) => setTwitterData({ ...twitterData, accessToken: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                            />
                            <input
                                type="text"
                                placeholder="Access Secret"
                                value={twitterData.accessSecret}
                                onChange={(e) => setTwitterData({ ...twitterData, accessSecret: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                            />
                            <input
                                type="text"
                                placeholder="Twitter User ID"
                                value={twitterData.twitterUserId}
                                onChange={(e) => setTwitterData({ ...twitterData, twitterUserId: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                            />
                            <input
                                type="text"
                                placeholder="Twitter Username"
                                value={twitterData.username}
                                onChange={(e) => setTwitterData({ ...twitterData, username: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConnectModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConnectTwitter}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
