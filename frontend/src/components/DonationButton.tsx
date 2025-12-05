'use client';
import { useState } from 'react';

export default function DonationButton({ creatorId, creatorName }: { creatorId: string; creatorName: string }) {
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState('5');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleDonate = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/shop/donate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: creatorId,
                    donorName: name,
                    donorEmail: email,
                    amount: parseFloat(amount),
                    message,
                }),
            });

            if (res.ok) {
                alert(`Thank you for your donation of $${amount}!`);
                setShowModal(false);
                setAmount('5');
                setName('');
                setEmail('');
                setMessage('');
            } else {
                alert('Donation failed. Please try again.');
            }
        } catch (error) {
            alert('Donation failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
                💖 Support with a Donation
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
                    <div
                        className="backdrop-blur-md bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-white mb-2">Support {creatorName}</h2>
                        <p className="text-gray-400 mb-6">Your support helps create great content!</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Amount (USD) *
                                </label>
                                <div className="flex gap-2 mb-2">
                                    {['5', '10', '25', '50'].map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => setAmount(preset)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${amount === preset
                                                    ? 'bg-yellow-500 text-black'
                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                }`}
                                        >
                                            ${preset}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                                    placeholder="Enter amount"
                                />
                            </div>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name (optional)"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                            />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email (optional)"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                            />

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Leave a message (optional)"
                                rows={3}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDonate}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold disabled:opacity-50"
                            >
                                {submitting ? 'Processing...' : `Donate $${amount}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
