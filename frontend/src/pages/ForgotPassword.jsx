import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import AnimatedLabel from '../components/AnimatedLabel';
import GlitchButton from '../components/GlitchButton';
import AuthShell from '../components/AuthShell';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post('/api/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthShell
                title={<>Check your <span className="text-primary-400">email</span></>}
                subtitle="We've sent password reset instructions to your email address."
                badge="Password Reset"
            >
                <div className="p-8 sm:p-9 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/30">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500" />
                        </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-50 mb-3">
                        Email Sent Successfully!
                    </h3>
                    
                    <p className="text-sm text-slate-400 mb-2 leading-relaxed">
                        We've sent a password reset link to
                    </p>
                    <p className="text-base text-primary-300 font-semibold mb-6">
                        {email}
                    </p>
                    <p className="text-xs text-slate-500 mb-8">
                        Please check your inbox and follow the instructions to reset your password.
                    </p>

                    <div className="space-y-3">
                        <Link to="/login" className="block">
                            <GlitchButton className="w-full">
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                Back to Sign In
                            </GlitchButton>
                        </Link>
                        
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setEmail('');
                            }}
                            className="w-full text-sm text-slate-400 hover:text-primary-300 transition-colors py-2"
                        >
                            Didn't receive the email? Try again
                        </button>
                    </div>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title={<>Forgot your <span className="text-primary-400">password</span>?</>}
            subtitle="No worries! Enter your email and we'll send you reset instructions."
            badge="Password Reset"
        >
            <div className="p-8 sm:p-9">
                <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-300">
                        Reset Password
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-50">
                        Enter Your Email Address
                    </p>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                        We'll send you a secure link to reset your password. The link will expire in 10 minutes.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    <GlitchButton
                        as="button"
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </GlitchButton>
                </form>

                <div className="mt-6 border-t border-slate-700/60 pt-4 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-slate-400 hover:text-slate-300 transition-colors inline-flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </AuthShell>
    );
};

export default ForgotPassword;
