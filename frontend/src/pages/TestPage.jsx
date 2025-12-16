import React from 'react';
import { useAuth } from '../context/AuthContext';

const TestPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">🔧 System Test Page</h1>
                    <p className="text-slate-600 mb-6">This page helps diagnose issues with the OrderScan page.</p>
                </div>

                {/* Auth Status */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Status</h2>
                    {user ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                <span className="text-green-700 font-semibold">Logged In</span>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                <p className="text-sm text-slate-700"><strong>User ID:</strong> {user.userId}</p>
                                <p className="text-sm text-slate-700"><strong>Email:</strong> {user.email}</p>
                                <p className="text-sm text-slate-700"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                <p className="text-sm text-slate-700"><strong>Role:</strong> {user.role}</p>
                            </div>
                            <div className="mt-4">
                                <a 
                                    href="/orderscan" 
                                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Go to OrderScan →
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                <span className="text-red-700 font-semibold">Not Logged In</span>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                                <p className="text-sm text-red-700 mb-4">
                                    You need to login first to access the OrderScan page.
                                </p>
                                <a 
                                    href="/login" 
                                    className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Go to Login →
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Component Test */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Component Test</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="text-slate-700">React is working</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="text-slate-700">Tailwind CSS is working</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="text-slate-700">Routing is working</span>
                        </div>
                    </div>
                </div>

                {/* API Test */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">API Connection</h2>
                    <div className="space-y-4">
                        <button
                            onClick={async () => {
                                try {
                                    const response = await fetch('http://localhost:5000/health');
                                    const data = await response.json();
                                    alert('Backend is running!\n\n' + JSON.stringify(data, null, 2));
                                } catch (error) {
                                    alert('Backend is NOT running!\n\nError: ' + error.message);
                                }
                            }}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            Test Backend Connection
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-blue-900 mb-4">📋 Next Steps</h2>
                    <ol className="list-decimal list-inside space-y-2 text-slate-700">
                        <li>Make sure you're logged in (see status above)</li>
                        <li>Make sure backend server is running on port 5000</li>
                        <li>Click "Go to OrderScan" button above</li>
                        <li>If you see a blank page, check browser console (F12)</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default TestPage;
