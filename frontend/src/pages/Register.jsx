import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import AnimatedLabel from '../components/AnimatedLabel';
import GlitchButton from '../components/GlitchButton';
import AuthShell from '../components/AuthShell';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'ADMIN'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successAnim, setSuccessAnim] = useState(false);
    const { register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            const errorMsg = 'Passwords do not match';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            return;
        }

        if (formData.password.length < 6) {
            const errorMsg = 'Password must be at least 6 characters';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            return;
        }

        setLoading(true);

        const result = await register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            role: formData.role || 'ADMIN'
        });

        if (result.success) {
            setSuccessAnim(true);
            showToast('Account created successfully! Please sign in.', 'success');
            setTimeout(() => navigate('/login'), 1000);
            setTimeout(() => setSuccessAnim(false), 1400);
        } else {
            setError(result.message);
            showToast(result.message || 'Registration failed', 'error');
        }
        setLoading(false);
    };
    return (
        <AuthShell
            title={<>Create your <span className="text-primary-400">supply hub</span> workspace.</>}
            subtitle="Set up an account to manage suppliers, products, warehouses, and inbound shipments in one place."
            badge="New to the platform"
        >
            <div className="relative p-8 sm:p-9 auth-card-animate">
                <div className="absolute inset-0 -z-10 rounded-2xl blur-2xl opacity-80 auth-gradient" />
                {successAnim && <div className="success-burst" />}
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-300">
                        Create account
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-50">
                        Join your organization in minutes
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        We&apos;ll use these details to personalize your dashboard and secure your access.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AnimatedLabel label="First Name">
                            <div className="relative mt-4">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="input-field w-full border-slate-700/70 bg-slate-900/60 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="John"
                                    required
                                />
                            </div>
                        </AnimatedLabel>

                        <AnimatedLabel label="Last Name">
                            <div className="relative mt-4">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="input-field w-full border-slate-700/70 bg-slate-900/60 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </AnimatedLabel>
                    </div>

                    <AnimatedLabel label="Work Email">
                        <div className="relative mt-4">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <FontAwesomeIcon icon={faEnvelope} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
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
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field w-full border-slate-700/70 bg-slate-900/60 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500"
                                placeholder="Create a strong password"
                                required
                            />
                        </div>
                    </AnimatedLabel>

                    <AnimatedLabel label="Confirm Password">
                        <div className="relative mt-4">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <FontAwesomeIcon icon={faLock} />
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input-field w-full border-slate-700/70 bg-slate-900/60 pl-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500"
                                placeholder="Repeat your password"
                                required
                            />
                        </div>
                    </AnimatedLabel>

                    <AnimatedLabel label="Role">
                        <div className="relative mt-4">
                            <select
                                name="role"
                                value={formData.role || 'ADMIN'}
                                onChange={handleChange}
                                className="input-field w-full border-slate-700/70 bg-slate-900/60 text-sm text-slate-100 focus:border-primary-500 focus:ring-primary-500"
                                required
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="MANAGER">Manager</option>
                                <option value="STAFF">Staff</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
                        </div>
                    </AnimatedLabel>

                    <div className="pt-2">
                        <GlitchButton
                            as="button"
                            type="submit"
                            disabled={loading}
                            className="w-full group"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? 'Creating account…' : 'Create account'}
                                {!loading && (
                                    <FontAwesomeIcon
                                        icon={faArrowRight}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                )}
                            </span>
                        </GlitchButton>
                    </div>
                </form>

                <div className="mt-6 border-t border-slate-700/60 pt-4 text-center text-xs text-slate-400">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-semibold text-primary-300 hover:text-primary-200"
                    >
                        Sign in instead
                    </Link>
                </div>
            </div>
        </AuthShell>
    );
};

export default Register;
