'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="text-white text-2xl font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }
  if (!user) return null;
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-md bg-white/10 border-b border-white/20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">⭐</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                StarConnect CMS
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-400">Welcome back</p>
                <p className="text-sm font-semibold text-white">{user.name || user.username}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                {(user.name || user.username).charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="group relative backdrop-blur-md bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-cyan-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wide">Total Content</h3>
                  <span className="text-3xl">📚</span>
                </div>
                <p className="text-5xl font-bold text-white mb-2">0</p>
                <p className="text-xs text-gray-400">All your published content</p>
              </div>
            </div>
            <div className="group relative backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-green-300 uppercase tracking-wide">Published</h3>
                  <span className="text-3xl">✅</span>
                </div>
                <p className="text-5xl font-bold text-white mb-2">0</p>
                <p className="text-xs text-gray-400">Live content pieces</p>
              </div>
            </div>
            <div className="group relative backdrop-blur-md bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-yellow-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-yellow-300 uppercase tracking-wide">Drafts</h3>
                  <span className="text-3xl">📝</span>
                </div>
                <p className="text-5xl font-bold text-white mb-2">0</p>
                <p className="text-xs text-gray-400">Work in progress</p>
              </div>
            </div>
          </div>
          {/* Quick Actions */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 mb-10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/dashboard/content/new')}
                className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">📝</div>
                  <div className="font-semibold text-white">New Post</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/media')}
                className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">🖼️</div>
                  <div className="font-semibold text-white">Upload Media</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/profile')}
                className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">👤</div>
                  <div className="font-semibold text-white">Edit Profile</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/crisis')}
                className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">🚨</div>
                  <div className="font-semibold text-white">Crisis Mode</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/social')}
                className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">🔗</div>
                  <div className="font-semibold text-white">Social Accounts</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/publish')}
                className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">🚀</div>
                  <div className="font-semibold text-white">Publish</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/comments')}
                className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">💬</div>
                  <div className="font-semibold text-white">Comments</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/content')}
                className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">📚</div>
                  <div className="font-semibold text-white">My Content</div>
                </div>
              </button>

              <button
                onClick={() => router.push('/dashboard/analytics')}
                className="group relative overflow-hidden p-6 bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative">
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">📊</div>
                  <div className="font-semibold text-white">Analytics</div>
                </div>
              </button>
            </div>
          </div>
          {/* User Profile */}
          <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">👤</span>
              Your Profile
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm min-w-[100px]">Email:</span>
                  <span className="text-white font-medium">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm min-w-[100px]">Username:</span>
                  <span className="text-white font-medium">{user.username}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm min-w-[100px]">Role:</span>
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded-full text-sm font-semibold">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm min-w-[100px]">User ID:</span>
                  <code className="px-3 py-1 bg-black/30 border border-white/10 text-cyan-400 rounded text-xs font-mono">
                    {user.id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
