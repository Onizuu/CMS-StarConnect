'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

interface Content {
    id: string;
    title: string;
    slug: string;
    type: string;
    excerpt: string | null;
    body: any;
    status: string;
    publishedAt: string | null;
}

export default function EditContentPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [type, setType] = useState('POST');
    const [excerpt, setExcerpt] = useState('');
    const [body, setBody] = useState('');
    const [status, setStatus] = useState('DRAFT');

    useEffect(() => {
        fetchContent();
    }, [params.id]);

    const fetchContent = async () => {
        try {
            const response = await api.get(`/api/content?my=true`);
            const content = response.data.find((c: Content) => c.id === params.id);

            if (!content) {
                setError('Content not found');
                setLoading(false);
                return;
            }

            setTitle(content.title);
            setSlug(content.slug);
            setType(content.type);
            setExcerpt(content.excerpt || '');
            setBody(content.body?.content || '');
            setStatus(content.status);
            setLoading(false);
        } catch (err: any) {
            setError('Failed to load content');
            setLoading(false);
        }
    };

    const handleSubmit = async (publishNow = false) => {
        setError('');
        setSaving(true);

        try {
            const contentData = {
                title,
                slug,
                type,
                excerpt,
                body: { content: body },
                status: publishNow ? 'PUBLISHED' : status,
                publishedAt: publishNow ? new Date().toISOString() : null,
            };

            await api.put(`/api/content/${params.id}`, contentData);
            router.push('/dashboard/content');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update content');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-2xl font-semibold animate-pulse">Loading...</div>
            </div>
        );
    }

    if (error && !title) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-red-400 text-2xl">{error}</div>
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
                            onClick={() => router.push('/dashboard/content')}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            Edit Content
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={saving || !title || !slug}
                            className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={saving || !title || !slug}
                            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Update & Publish'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-10">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter your content title..."
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Slug *
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="url-friendly-slug"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Type and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Type
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="POST">Post</option>
                                <option value="PAGE">Page</option>
                                <option value="ARTICLE">Article</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                            </select>
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Excerpt
                        </label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Short summary of your content..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Content
                        </label>
                        <div className="bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                            <Editor content={body} onChange={setBody} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
