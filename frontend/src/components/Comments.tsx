'use client';
import { useState, useEffect } from 'react';

interface Comment {
    id: string;
    author: string;
    text: string;
    createdAt: string;
    replies?: Comment[];
}

interface CommentsProps {
    contentId: string;
}

export default function Comments({ contentId }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [author, setAuthor] = useState('');
    const [email, setEmail] = useState('');
    const [text, setText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    useEffect(() => {
        fetchComments();
    }, [contentId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/comments/content/${contentId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!author.trim() || !text.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentId,
                    author,
                    email,
                    text,
                    parentId: replyingTo,
                }),
            });

            if (res.ok) {
                alert('Comment submitted! It will appear after moderation.');
                setAuthor('');
                setEmail('');
                setText('');
                setReplyingTo(null);
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to submit comment');
            }
        } catch (error) {
            alert('Failed to submit comment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-gray-400">Loading comments...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Comments List */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                    Comments ({comments.length})
                </h2>

                {comments.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                        No comments yet. Be the first to comment!
                    </p>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="space-y-4">
                                {/* Main Comment */}
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-white">{comment.author}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-300">{comment.text}</p>
                                    <button
                                        onClick={() => setReplyingTo(comment.id)}
                                        className="text-sm text-cyan-400 hover:text-cyan-300 mt-2"
                                    >
                                        Reply
                                    </button>
                                </div>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="ml-8 space-y-4">
                                        {comment.replies.map((reply) => (
                                            <div key={reply.id} className="bg-white/5 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="font-semibold text-white">{reply.author}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(reply.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-300">{reply.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Comment Form */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-4">
                    {replyingTo ? 'Post a Reply' : 'Leave a Comment'}
                </h3>

                {replyingTo && (
                    <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-blue-300">Replying to comment...</span>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className="text-blue-300 hover:text-white"
                        >
                            ✕ Cancel
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email (optional)
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Comment *
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="Share your thoughts..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Post Comment'}
                    </button>

                    <p className="text-xs text-gray-500 mt-2">
                        Your comment will be reviewed before being published.
                    </p>
                </form>
            </div>
        </div>
    );
}
