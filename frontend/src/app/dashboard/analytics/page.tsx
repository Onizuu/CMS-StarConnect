'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface Stats {
    totalViews: number;
    uniqueVisitors: number;
    avgDuration: number;
    viewsByDay: Record<string, number>;
    topContent: Array<{ id: string; title: string; slug: string; views: number }>;
    topReferrers: Array<{ domain: string; count: number }>;
}

export default function AnalyticsPage() {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [period, setPeriod] = useState(30);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchStats();
        }
    }, [isAuthenticated, period]);

    const fetchStats = async () => {
        try {
            const response = await api.get(`/api/analytics/dashboard?days=${period}`);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await api.get(`/api/analytics/export/csv?days=${period}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics-${period}d.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Export failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-2xl font-semibold animate-pulse">Loading Analytics...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-white text-xl">No analytics data available</div>
            </div>
        );
    }

    // Prepare chart data
    const viewsChartData = Object.entries(stats.viewsByDay)
        .map(([date, views]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const topContentData = stats.topContent.slice(0, 5).map(content => ({
        name: content.title.length > 20 ? content.title.substring(0, 20) + '...' : content.title,
        views: content.views,
    }));

    const referrersData = stats.topReferrers.slice(0, 5).map(ref => ({
        name: ref.domain,
        visitors: ref.count,
    }));

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
                            Analytics Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(Number(e.target.value))}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        >
                            <option value={7}>Last 7 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                        <button
                            onClick={handleExportCSV}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                            📥 Export CSV
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">Total Views</h3>
                            <span className="text-2xl">👁️</span>
                        </div>
                        <p className="text-4xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
                        <p className="text-sm text-gray-400 mt-1">Last {period} days</p>
                    </div>

                    <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">Unique Visitors</h3>
                            <span className="text-2xl">👥</span>
                        </div>
                        <p className="text-4xl font-bold text-white">{stats.uniqueVisitors.toLocaleString()}</p>
                        <p className="text-sm text-gray-400 mt-1">Anonymous tracking</p>
                    </div>

                    <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-300">Avg. Duration</h3>
                            <span className="text-2xl">⏱️</span>
                        </div>
                        <p className="text-4xl font-bold text-white">{stats.avgDuration}s</p>
                        <p className="text-sm text-gray-400 mt-1">Time on page</p>
                    </div>
                </div>

                {/* Views Over Time Chart */}
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 mb-10">
                    <h2 className="text-2xl font-bold text-white mb-6">Views Over Time</h2>
                    {viewsChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={viewsChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="views" stroke="#06B6D4" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-center py-10">No data available for this period</p>
                    )}
                </div>

                {/* Top Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Top Content</h2>
                        {topContentData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topContentData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar dataKey="views" fill="#8B5CF6" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-center py-10">No content views yet</p>
                        )}
                    </div>

                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Top Referrers</h2>
                        {referrersData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={referrersData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis type="number" stroke="#9CA3AF" />
                                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={120} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar dataKey="visitors" fill="#10B981" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-center py-10">No referrer data yet</p>
                        )}
                    </div>
                </div>

                {/* Content List */}
                {stats.topContent.length > 0 && (
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Content Performance</h2>
                        <div className="space-y-3">
                            {stats.topContent.map((content, idx) => (
                                <div
                                    key={content.id}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="text-2xl font-bold text-gray-500">#{idx + 1}</span>
                                        <div>
                                            <h3 className="font-semibold text-white">{content.title}</h3>
                                            <a
                                                href={`/p/${content.slug}`}
                                                target="_blank"
                                                className="text-sm text-cyan-400 hover:underline"
                                            >
                                                /p/{content.slug}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">{content.views}</p>
                                        <p className="text-xs text-gray-400">views</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
