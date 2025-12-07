import React from 'react';
import SplitTextHeading from './SplitTextHeading';

/**
 * AuthShell
 * =========
 * Shared layout for Login / Register pages with a ReactBits-inspired hero and background.
 */
const AuthShell = ({ title, subtitle, children, badge }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-secondary-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-slate-800/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Left hero column */}
        <div className="mb-10 max-w-xl space-y-6 lg:mb-0">
          {badge && (
            <span className="inline-flex items-center rounded-full border border-primary-400/40 bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100">
              {badge}
            </span>
          )}

          <SplitTextHeading
            text={title}
            className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
          />

          {subtitle && <p className="text-sm sm:text-base text-slate-300/90">{subtitle}</p>}

          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/60 backdrop-blur">
              <p className="text-slate-300 font-medium">Real-time visibility</p>
              <p className="mt-1 text-slate-400">
                Track inventory, orders, and shipments in a single unified workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/60 backdrop-blur">
              <p className="text-slate-300 font-medium">Polyglot data</p>
              <p className="mt-1 text-slate-400">
                Oracle for structured operations, MongoDB for rich event streams.
              </p>
            </div>
          </div>
        </div>

        {/* Right form card */}
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-700/60 bg-slate-900/80 shadow-2xl shadow-slate-950/70 backdrop-blur-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;


