import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsletterForm from '@/components/NewsletterForm';
import DonationButton from '@/components/DonationButton';

interface PageProps {
    params: {
        username: string;
    };
}

async function getProfile(username: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/profile/${username}`, {
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

async function getContent(username: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/profile/${username}/content`, {
            cache: 'no-store',
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

async function getCrisisStatus(username: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/crisis/status/${username}`, {
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const profile = await getProfile(params.username);

    if (!profile) {
        return {
            title: 'User not found',
        };
    }

    return {
        title: `${profile.name || profile.username} - StarConnect`,
        description: profile.bio || `View ${profile.name || profile.username}'s profile on StarConnect`,
        openGraph: {
            title: profile.name || profile.username,
            description: profile.bio || undefined,
            images: profile.avatar ? [profile.avatar] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: profile.name || profile.username,
            description: profile.bio || undefined,
            images: profile.avatar ? [profile.avatar] : undefined,
        },
    };
}

export default async function UserProfilePage({ params }: PageProps) {
    const [profile, content, crisis] = await Promise.all([
        getProfile(params.username),
        getContent(params.username),
        getCrisisStatus(params.username),
    ]);

    if (!profile) {
        notFound();
    }

    const socialLinks = profile.socialLinks as any || {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Crisis Banner */}
            {crisis?.isActive && (
                <div className="bg-gradient-to-r from-red-600 to-orange-600 border-b-4 border-yellow-400">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl animate-pulse">🚨</div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{crisis.title}</h2>
                                <p className="text-white/90">{crisis.message}</p>
                                {crisis.activatedAt && (
                                    <p className="text-xs text-white/70 mt-2">
                                        Activated: {new Date(crisis.activatedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Banner */}
            {profile.banner && (
                <div className="w-full h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${profile.banner})` }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80"></div>
                </div>
            )}

            {/* Profile Header */}
            <div className="relative max-w-7xl mx-auto px-6">
                <div className={`${profile.banner ? '-mt-20' : 'pt-10'} pb-8`}>
                    {/* Avatar */}
                    <div className="flex items-end gap-6 mb-6">
                        <div className="relative">
                            {profile.avatar ? (
                                <img
                                    src={profile.avatar}
                                    alt={profile.name || profile.username}
                                    className="w-32 h-32 rounded-full border-4 border-slate-900 shadow-2xl object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-slate-900 shadow-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                                    {(profile.name || profile.username).charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-2">
                                {profile.name || profile.username}
                            </h1>
                            <p className="text-xl text-gray-400">@{profile.username}</p>
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className="mb-6">
                            <p className="text-lg text-gray-300 max-w-3xl">{profile.bio}</p>
                        </div>
                    )}

                    {/* Social Links */}
                    {Object.keys(socialLinks).length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-8">
                            {socialLinks.twitter && (
                                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                                    <span>𝕏</span> Twitter
                                </a>
                            )}
                            {socialLinks.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                                    <span>📷</span> Instagram
                                </a>
                            )}
                            {socialLinks.facebook && (
                                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                                    <span>📘</span> Facebook
                                </a>
                            )}
                            {socialLinks.website && (
                                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                                    <span>🌐</span> Website
                                </a>
                            )}
                        </div>
                    )}

                    {/* Donation Button */}
                    <div className="mb-8">
                        <DonationButton creatorId={profile.id} creatorName={profile.name || profile.username} />
                    </div>
                </div>

                {/* Grid Layout: Content + Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-6">Recent Posts</h2>

                        {content.length === 0 ? (
                            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
                                <div className="text-6xl mb-4">📝</div>
                                <p className="text-gray-400">No posts yet</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {content.map((post: any) => (
                                    <a
                                        key={post.id}
                                        href={`/p/${post.slug}`}
                                        className="block backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 group"
                                    >
                                        <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-gray-300 mb-4">{post.excerpt}</p>
                                        )}
                                        <div className="flex gap-4 text-sm text-gray-500">
                                            <span>
                                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Newsletter */}
                    <div className="lg:col-span-1">
                        <NewsletterForm creatorId={profile.id} />
                    </div>
                </div>

                {/* Unified Activity Feed */}
                <div className="pb-16">
                    <h2 className="text-2xl font-bold text-white mb-6">📱 Unified Activity Feed</h2>
                    <p className="text-gray-400 mb-6">All posts from {profile.name || profile.username} across all platforms</p>

                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                        <div className="text-6xl mb-4">🔄</div>
                        <p className="text-gray-400 mb-2">Social feed integration active!</p>
                        <p className="text-sm text-gray-500">
                            This feature aggregates posts from Twitter, Facebook, and other connected platforms.
                            <br />
                            Content will appear here once social accounts are connected and synced.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
