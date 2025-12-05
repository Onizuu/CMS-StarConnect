'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface CrisisMode {
    id: string;
    isActive: boolean;
    title: string;
    message: string;
    activatedAt: string | null;
}

export default function CrisisManagementPage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [crisis, setCrisis] = useState<CrisisMode | null>(null);
    const [title, setTitle] = useState('Communication Urgente');
    const [message, setMessage] = useState('Une déclaration officielle sera publiée prochainement.');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCrisisMode();
        }
    }, [isAuthenticated]);

    const fetchCrisisMode = async () => {
        try {
            const response = await api.get('/api/crisis/me');
            setCrisis(response.data);
            setTitle(response.data.title);
            setMessage(response.data.message);
        } catch (error) {
            console.error('Failed to fetch crisis mode:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTemplate = async () => {
        setSaving(true);
        try {
            await api.put('/api/crisis/template', { title, message });
            alert('Template saved successfully!');
            fetchCrisisMode();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const handleActivate = async () => {
        if (!confirm('⚠️ ATTENTION: Ceci va activer le mode crise sur votre profil public. Continuer?')) {
            return;
        }

        try {
            await api.post('/api/crisis/activate');
            alert('🚨 Crisis mode activated!');
            fetchCrisisMode();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to activate crisis mode');
        }
    };

    const handleDeactivate = async () => {
        if (!confirm('Désactiver le mode crise?')) {
            return;
        }

        try {
            await api.post('/api/crisis/deactivate');
            alert('Crisis mode deactivated');
            fetchCrisisMode();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to deactivate crisis mode');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-2xl font-semibold animate-pulse">Loading...</div>
            </div>
        );
    }

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
                            Crisis Communication
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-10">
                {/* Status Banner */}
                <div className={`rounded-2xl p-8 mb-10 border-2 ${crisis?.isActive
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 border-yellow-400'
                        : 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-6xl">{crisis?.isActive ? '🚨' : '✅'}</div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {crisis?.isActive ? 'Crisis Mode ACTIVE' : 'Crisis Mode Inactive'}
                                </h2>
                                {crisis?.isActive && crisis.activatedAt && (
                                    <p className="text-white/80">
                                        Activated: {new Date(crisis.activatedAt).toLocaleString()}
                                    </p>
                                )}
                                {!crisis?.isActive && (
                                    <p className="text-white/80">
                                        Your profile is in normal mode
                                    </p>
                                )}
                            </div>
                        </div>
                        <div>
                            {crisis?.isActive ? (
                                <button
                                    onClick={handleDeactivate}
                                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Deactivate
                                </button>
                            ) : (
                                <button
                                    onClick={handleActivate}
                                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 animate-pulse"
                                >
                                    🚨 ACTIVATE CRISIS MODE
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* What is Crisis Mode */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 mb-10">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <span>ℹ️</span>
                        What is Crisis Mode?
                    </h2>
                    <div className="space-y-3 text-gray-300">
                        <p>
                            <strong>Crisis Mode</strong> is your emergency communication tool. When activated, it displays a prominent banner on your public profile with your urgent message.
                        </p>
                        <p>
                            <strong>Use cases:</strong> Breaking news, official statements, urgent clarifications, or any situation requiring immediate public attention.
                        </p>
                        <p>
                            <strong>Effect:</strong> A red/orange banner appears at the top of your profile at <code className="px-2 py-1 bg-black/30 rounded">/u/{user?.username}</code> with your configured message.
                        </p>
                    </div>
                </div>

                {/* Message Template */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 mb-10">
                    <h2 className="text-2xl font-bold text-white mb-6">Configure Crisis Message</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Communication Urgente"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Message *
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Your urgent message to the public..."
                                rows={6}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <button
                            onClick={handleSaveTemplate}
                            disabled={saving || !title || !message}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Preview</h2>

                    <div className="bg-gradient-to-r from-red-600 to-orange-600 border-b-4 border-yellow-400 rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl animate-pulse">🚨</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
                                    <p className="text-white/90">{message}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400 mt-4">
                        This is how the crisis banner will appear on your public profile when activated.
                    </p>
                </div>
            </main>
        </div>
    );
}
