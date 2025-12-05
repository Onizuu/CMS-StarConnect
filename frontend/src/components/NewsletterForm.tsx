'use client';
import { useState } from 'react';
import api from '@/lib/api';

export default function NewsletterForm({ creatorId }: { creatorId?: string }) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            alert('Please enter your email');
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: creatorId,
                    email,
                    name,
                }),
            });

            setMessage('✅ Successfully subscribed to newsletter!');
            setEmail('');
            setName('');
        } catch (error) {
            setMessage('❌ Failed to subscribe. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">📧 Subscribe to Newsletter</h3>
            <p className="text-gray-300 mb-6">
                Stay updated with the latest posts and exclusive content!
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="your@email.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name (optional)
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Your name"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                    {submitting ? 'Subscribing...' : 'Subscribe'}
                </button>

                {message && (
                    <p className={`text-center ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                        {message}
                    </p>
                )}
            </div>
        </form>
    );
}
