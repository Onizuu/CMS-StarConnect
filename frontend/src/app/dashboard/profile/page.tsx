'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function ProfileEditPage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [banner, setBanner] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [socialLinks, setSocialLinks] = useState({
        twitter: '',
        instagram: '',
        facebook: '',
        website: '',
    });

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated]);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/api/profile/me/profile');
            const profile = response.data;

            setName(profile.name || '');
            setBio(profile.bio || '');
            setAvatar(profile.avatar || '');
            setBanner(profile.banner || '');
            setIsPublic(profile.isPublic ?? true);
            setSocialLinks(profile.socialLinks || {
                twitter: '',
                instagram: '',
                facebook: '',
                website: '',
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/api/profile/me', {
                name,
                bio,
                avatar,
                banner,
                isPublic,
                socialLinks,
            });

            alert('Profile updated successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to update profile');
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
                            Edit Profile
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href={user ? `/u/${user.username}` : '#'}
                            target="_blank"
                            className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Preview Profile
                        </a>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span className="text-white font-medium">Make profile public</span>
                                </label>
                                <p className="text-sm text-gray-400 mt-1 ml-8">
                                    If unchecked, your profile will not be accessible to others
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Visual Elements */}
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Visual Elements</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Avatar URL
                                </label>
                                <input
                                    type="url"
                                    value={avatar}
                                    onChange={(e) => setAvatar(e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                {avatar && (
                                    <img src={avatar} alt="Avatar preview" className="mt-3 w-24 h-24 rounded-full object-cover" />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Banner URL
                                </label>
                                <input
                                    type="url"
                                    value={banner}
                                    onChange={(e) => setBanner(e.target.value)}
                                    placeholder="https://example.com/banner.jpg"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                {banner && (
                                    <img src={banner} alt="Banner preview" className="mt-3 w-full h-32 rounded-lg object-cover" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Social Links</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    𝕏 Twitter/X
                                </label>
                                <input
                                    type="url"
                                    value={socialLinks.twitter}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                                    placeholder="https://twitter.com/username"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    📷 Instagram
                                </label>
                                <input
                                    type="url"
                                    value={socialLinks.instagram}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                    placeholder="https://instagram.com/username"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    📘 Facebook
                                </label>
                                <input
                                    type="url"
                                    value={socialLinks.facebook}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                                    placeholder="https://facebook.com/username"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    🌐 Website
                                </label>
                                <input
                                    type="url"
                                    value={socialLinks.website}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                                    placeholder="https://yourwebsite.com"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
