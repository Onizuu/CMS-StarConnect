'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';

interface Media {
    id: string;
    filename: string;
    url: string;
    thumbnail?: string;
    mimetype: string;
    size: number;
    createdAt: string;
}

export default function MediaPage() {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMedia();
        }
    }, [isAuthenticated]);

    const fetchMedia = async () => {
        try {
            const response = await api.get('/api/media?my=true');
            setMedia(response.data);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setLoading(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);

        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await api.post('/api/media/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setMedia(prev => [response.data, ...prev]);
            } catch (error: any) {
                alert(error.response?.data?.error || 'Upload failed');
            }
        }

        setUploading(false);
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this media file?')) return;

        try {
            await api.delete(`/api/media/${id}`);
            setMedia(media.filter(m => m.id !== id));
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete');
        }
    };

    const handleCopyUrl = (url: string) => {
        const fullUrl = `http://localhost:3001${url}`;
        navigator.clipboard.writeText(fullUrl);
        alert('URL copied to clipboard!');
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        multiple: true,
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
                            Media Library
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Upload Zone */}
                <div
                    {...getRootProps()}
                    className={`backdrop-blur-md border-2 border-dashed rounded-2xl p-16 text-center mb-10 transition-all cursor-pointer ${isDragActive
                            ? 'bg-cyan-500/20 border-cyan-400'
                            : uploading
                                ? 'bg-purple-500/10 border-purple-400'
                                : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="text-6xl mb-4">{uploading ? '⏳' : '📤'}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                        {uploading ? 'Uploading...' : isDragActive ? 'Drop files here' : 'Upload Media'}
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {uploading
                            ? 'Please wait while your files are being uploaded'
                            : 'Drag & drop images here, or click to select files'}
                    </p>
                    <p className="text-sm text-gray-500">Supported: PNG, JPG, GIF, WebP (max 10MB)</p>
                </div>

                {/* Media Grid */}
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Your Media ({media.length})</h2>
                </div>

                {media.length === 0 ? (
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
                        <div className="text-6xl mb-4">🖼️</div>
                        <h3 className="text-2xl font-bold text-white mb-2">No media yet</h3>
                        <p className="text-gray-400">Upload your first image to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {media.map((item) => (
                            <div
                                key={item.id}
                                className="group relative backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all"
                            >
                                <div className="aspect-square relative">
                                    <img
                                        src={`http://localhost:3001${item.thumbnail || item.url}`}
                                        alt={item.filename}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleCopyUrl(item.url)}
                                            className="px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
                                            title="Copy URL"
                                        >
                                            📋 Copy
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-xs text-gray-400 truncate">{item.filename}</p>
                                    <p className="text-xs text-gray-500">{(item.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
