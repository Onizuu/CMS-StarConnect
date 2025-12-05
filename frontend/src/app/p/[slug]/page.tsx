import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Comments from '@/components/Comments';

interface PageProps {
    params: {
        slug: string;
    };
}

async function getPost(slug: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/content`, {
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const posts = await res.json();
        return posts.find((p: any) => p.slug === slug && p.status === 'PUBLISHED');
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const post = await getPost(params.slug);

    if (!post) {
        return {
            title: 'Post not found',
        };
    }

    return {
        title: `${post.title} - StarConnect`,
        description: post.excerpt || undefined,
        openGraph: {
            title: post.title,
            description: post.excerpt || undefined,
            type: 'article',
            publishedTime: post.publishedAt,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || undefined,
        },
    };
}

export default async function PublicPostPage({ params }: PageProps) {
    const post = await getPost(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 text-gray-400 text-sm mb-6">
                        <a href="/" className="hover:text-white transition-colors">Home</a>
                        <span>/</span>
                        <span className="text-white">{post.title}</span>
                    </div>

                    <h1 className="text-5xl font-bold text-white mb-4">{post.title}</h1>

                    {post.excerpt && (
                        <p className="text-xl text-gray-300 mb-6">{post.excerpt}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-3">
                            <a
                                href={`/u/${post.user?.username || 'unknown'}`}
                                className="hover:text-white transition-colors"
                            >
                                {post.user?.name || post.user?.username || 'Anonymous'}
                            </a>
                        </div>
                        <span>•</span>
                        <time dateTime={post.publishedAt || post.createdAt}>
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </time>
                        <span>•</span>
                        <span className="uppercase px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {post.type}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <article className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 mb-12">
                    <div
                        className="prose prose-invert prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.body?.content || '' }}
                    />
                </article>

                {/* Share Section */}
                <div className="flex items-center gap-4 mb-12">
                    <span className="text-gray-400">Share:</span>
                    <button
                        onClick={() => {
                            const url = window.location.href;
                            const text = `Check out "${post.title}" on StarConnect`;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Share on X
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Copy Link
                    </button>
                </div>

                {/* Comments Section */}
                <Comments contentId={post.id} />

                {/* Back Link */}
                <div className="mt-12">
                    <a
                        href={`/u/${post.user?.username || ''}`}
                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        ← View more from {post.user?.name || post.user?.username || 'this author'}
                    </a>
                </div>
            </div>
        </div>
    );
}
