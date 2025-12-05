'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Comment {
    id: string;
    author: string;
    email?: string;
    text: string;
    status: string;
    createdAt: string;
    content: {
        title: string;
        slug: string;
    };
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    spam: number;
}

export default function CommentsModeration() {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<Comment[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchComments();
            fetchStats();
        }
    }, [isAuthenticated, filter]);

    const fetchComments = async () => {
        try {
            const statusParam = filter !== 'all' ? `?status=${filter.toUpperCase()}` : '';
            const response = await api.get(`/api/comments/my${statusParam}`);
            setComments(response.data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/api/comments/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.post(`/api/comments/${id}/approve`);
            fetchComments();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to approve');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.post(`/api/comments/${id}/reject`);
            fetchComments();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to reject');
        }
    };

    const handleSpam = async (id: string) => {
        try {
            await api.post(`/api/comments/${id}/spam`);
            fetchComments();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to mark as spam');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this comment permanently?')) return;

        try {
            await api.delete(`/api/comments/${id}`);
            fetchComments();
            fetchStats();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete');
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
                            Comments Moderation
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-sm text-gray-400">Total</p>
                            <p className="text-3xl font-bold text-white">{stats.total}</p>
                        </div>
                        <div className="backdrop-blur-md bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                            <p className="text-sm text-yellow-400">Pending</p>
                            <p className="text-3xl font-bold text-white">{stats.pending}</p>
                        </div>
                        <div className="backdrop-blur-md bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                            <p className="text-sm text-green-400">Approved</p>
                            <p className="text-3xl font-bold text-white">{stats.approved}</p>
                        </div>
                        <div className="backdrop-blur-md bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                            <p className="text-sm text-red-400">Rejected</p>
                            <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                        </div>
                        <div className="backdrop-blur-md bg-gray-500/20 border border-gray-500/30 rounded-xl p-4">
                            <p className="text-sm text-gray-400">Spam</p>
                            <p className="text-3xl font-bold text-white">{stats.spam}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-gray-300 font-medium">Filter:</span>
                    {['all', 'pending', 'approved', 'rejected', 'spam'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Comments List */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Comments ({comments.length})</h2>

                    {comments.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">💬</div>
                            <p className="text-gray-400">No comments to moderate</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className={`p-6 rounded-xl border ${comment.status === 'PENDING'
                                            ? 'bg-yellow-500/5 border-yellow-500/30'
                                            : comment.status === 'APPROVED'
                                                ? 'bg-green-500/5 border-green-500/30'
                                                : comment.status === 'SPAM'
                                                    ? 'bg-gray-500/5 border-gray-500/30'
                                                    : 'bg-red-500/5 border-red-500/30'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-bold text-white">{comment.author}</span>
                                                {comment.email && (
                                                    <span className="text-sm text-gray-400">{comment.email}</span>
                                                )}
                                                <span
                                                    className={`px-2 py-1 text-xs rounded ${comment.status === 'PENDING'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : comment.status === 'APPROVED'
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : comment.status === 'SPAM'
                                                                    ? 'bg-gray-500/20 text-gray-400'
                                                                    : 'bg-red-500/20 text-red-400'
                                                        }`}
                                                >
                                                    {comment.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-3">
                                                On <a href={`/p/${comment.content.slug}`} className="text-cyan-400 hover:underline" target="_blank">{comment.content.title}</a>
                                                {' • '}
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                            <p className="text-gray-300">{comment.text}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {comment.status !== 'APPROVED' && (
                                            <button
                                                onClick={() => handleApprove(comment.id)}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                ✓ Approve
                                            </button>
                                        )}
                                        {comment.status !== 'REJECTED' && (
                                            <button
                                                onClick={() => handleReject(comment.id)}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                ✕ Reject
                                            </button>
                                        )}
                                        {comment.status !== 'SPAM' && (
                                            <button
                                                onClick={() => handleSpam(comment.id)}
                                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                🚫 Spam
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors ml-auto"
                                        >
                                            🗑️ Delete
                                        </button>
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
