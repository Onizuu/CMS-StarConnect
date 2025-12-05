'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Content {
    id: string;
    title: string;
    slug: string;
    type: string;
    status: string;
    excerpt: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function ContentListPage() {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [content, setContent] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchContent();
        }
    }, [isAuthenticated]);

    const fetchContent = async () => {
        try {
            const response = await api.get('/api/content?my=true');
            setContent(response.data);
        } catch (error) {
            console.error('Failed to fetch content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this content?')) return;

        try {
            await api.delete(`/api/content/${id}`);
            setContent(content.filter((c) => c.id !== id));
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete content');
        }
    };

    const filteredContent = content.filter((c) => {
        if (filter === 'ALL') return true;
        return c.status === filter;
    });

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
                            My Content
                        </h1>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/content/new')}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                        + New Content
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Filters */}
                <div className="flex gap-3 mb-8">
                    {['ALL', 'DRAFT', 'PUBLISHED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === f
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <div className="ml-auto text-gray-400">
                        {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'}
                    </div>
                </div>

                {/* Content List */}
                {filteredContent.length === 0 ? (
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No content yet</h3>
                        <p className="text-gray-400 mb-6">Start creating your first piece of content</p>
                        <button
                            onClick={() => router.push('/dashboard/content/new')}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                            Create Content
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredContent.map((item) => (
                            <div
                                key={item.id}
                                className="group backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                {item.title}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'PUBLISHED'
                                                        ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                                                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/50 rounded-full text-xs font-semibold">
                                                {item.type}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-3">/{item.slug}</p>
                                        {item.excerpt && (
                                            <p className="text-gray-300 text-sm mb-3">{item.excerpt}</p>
                                        )}
                                        <div className="flex gap-4 text-xs text-gray-500">
                                            <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                                            {item.publishedAt && (
                                                <span>Published: {new Date(item.publishedAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => router.push(`/dashboard/content/${item.id}`)}
                                            className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
