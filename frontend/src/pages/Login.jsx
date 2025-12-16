import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faArrowRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import AnimatedLabel from '../components/AnimatedLabel';
import GlitchButton from '../components/GlitchButton';
import AuthShell from '../components/AuthShell';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successAnim, setSuccessAnim] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password, rememberMe);

        if (result.success) {
            setSuccessAnim(true);
            showToast('Login successful! Welcome back.', 'success');
            setTimeout(() => navigate('/'), 500);
            setTimeout(() => setSuccessAnim(false), 1200);
        } else {
            setError(result.message);
            showToast(result.message || 'Login failed', 'error');
        }
        setLoading(false);
    };
    return (
        <AuthShell
            title={<>Supply Management, <span className="italic font-light">re-imagined</span>.</>}
            subtitle="Log in to orchestrate suppliers, inventory, warehouses, and shipments across Oracle + MongoDB."
            badge="Secure admin workspace"
        >
            <div className="relative p-8 sm:p-9 auth-card-animate">
                <div className="absolute inset-0 -z-10 rounded-2xl blur-2xl opacity-80 auth-gradient" />
                {successAnim && <div className="success-burst" />}
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-300">
                        Welcome back
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-50">
                        Sign in to your control center
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Use your work email and password. Access is secured with JWT and role-based permissions.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <AnimatedLabel label="Email Address">
                            <div className="relative mt-4">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field w-full border-slate-700/70 bg-slate-900/60 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                        </AnimatedLabel>

                        <AnimatedLabel label="Password">
                            <div className="relative mt-4">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <FontAwesomeIcon icon={faLock} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field w-full border-slate-700/70 bg-slate-900/60 pl-10 pr-12 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="********"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 hover:text-slate-200"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </AnimatedLabel>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                        <label className="flex cursor-pointer items-center gap-2">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary-500 focus:ring-primary-500"
                            />
                            <span>Remember this device</span>
                        </label>
                        <Link
                            to="/forgot-password"
                            className="font-medium text-primary-300 hover:text-primary-200"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <GlitchButton
                        as="button"
                        type="submit"
                        disabled={loading}
                        className="w-full group"
                    >
                        <span className="flex items-center justify-center gap-2">
                            {loading ? 'Signing in...' : 'Sign in'}
                            {!loading && (
                                <FontAwesomeIcon
                                    icon={faArrowRight}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            )}
                        </span>
                    </GlitchButton>
                </form>

                <div className="mt-6 border-t border-slate-700/60 pt-4 text-center text-xs text-slate-400">
                    Don&apos;t have an account?{' '}
                    <Link
                        to="/register"
                        className="font-semibold text-primary-300 hover:text-primary-200"
                    >
                        Create one
                    </Link>
                </div>
            </div>
        </AuthShell>
    );
};

export default Login;
