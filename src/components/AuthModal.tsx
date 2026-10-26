import React, { useState } from 'react';
import { 
  KeyRound, 
  User, 
  Mail, 
  Lock, 
  X, 
  Sparkles, 
  CheckCircle2, 
  LogOut,
  ShieldCheck,
  Feather
} from 'lucide-react';
import { 
  UserAccount, 
  signInAccount, 
  signUpAccount, 
  signOutAccount, 
  getStoredAccounts 
} from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserChange: (user: UserAccount | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const existingAccounts = getStoredAccounts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'signup') {
      const res = signUpAccount(name, email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed');
      } else if (res.user) {
        setSuccessMsg(`Welcome to TYPEWRITER, ${res.user.name}. Your private library is ready.`);
        onUserChange(res.user);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } else {
      const res = signInAccount(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed');
      } else if (res.user) {
        setSuccessMsg(`Welcome back, ${res.user.name}.`);
        onUserChange(res.user);
        setTimeout(() => {
          onClose();
        }, 800);
      }
    }
  };

  const handleSignOut = () => {
    signOutAccount();
    onUserChange(null);
    setSuccessMsg('You have signed out of your library.');
    setTimeout(() => {
      setSuccessMsg('');
    }, 1500);
  };

  const handleQuickSwitch = (account: UserAccount) => {
    onUserChange(account);
    setSuccessMsg(`Switched to ${account.name}'s library.`);
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 liquid-glass-scrim animate-fade-in">
      <div className="relative w-full max-w-md liquid-glass-modal rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden text-[#F5EBDD]">
        {/* Top-Lit Specular Liquid Reflection */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5EBDD]/60 to-transparent pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C4A66A]/25 bg-black/25 backdrop-blur-md">
          <div className="flex items-center gap-2.5 font-cinzel text-base font-bold text-[#C4A66A]">
            <div className="w-8 h-8 rounded-lg liquid-glass-card flex items-center justify-center text-[#C4A66A] shadow-xs">
              <KeyRound className="w-4 h-4 text-[#C4A66A]" />
            </div>
            <span className="drop-shadow-sm">{currentUser ? 'Writer Account' : mode === 'signin' ? 'Sign In to Your Library' : 'Create Writer Account'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#E6D4B0] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentUser ? (
            /* Current User Active Profile Card */
            <div className="space-y-5">
              <div className="p-4 rounded-xl liquid-glass-card border border-[#C4A66A]/40 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#542C2D] border border-[#C4A66A] flex items-center justify-center text-lg font-cinzel text-[#F5EBDD] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-cinzel text-base font-bold text-[#F5EBDD] truncate drop-shadow-sm">
                    {currentUser.name}
                  </h3>
                  <p className="font-serif-vintage italic text-xs text-[#E6D4B0]/80 truncate">
                    {currentUser.email}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#9D7946]/30 border border-[#C4A66A]/30 text-[10px] font-cinzel text-[#C4A66A] uppercase tracking-wider font-semibold">
                    Preserved Library Member
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-black/35 backdrop-blur-sm rounded-xl border border-[#C4A66A]/20 text-xs font-serif-vintage italic text-[#E6D4B0]/90 leading-relaxed shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                All volumes, written leaves, and drafts in this session are permanently bound to your account and preserved across your devices.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl liquid-glass-card hover:border-red-500/50 text-xs font-cinzel text-red-200 flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.4)] transition-all active:scale-95"
                >
                  Return to Writing
                </button>
              </div>

              {/* Existing accounts switcher */}
              {existingAccounts.length > 1 && (
                <div className="pt-4 border-t border-[#C4A66A]/20">
                  <span className="block text-[11px] font-cinzel uppercase text-[#E6D4B0]/75 mb-2 font-semibold">
                    Switch to Another Writer:
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                    {existingAccounts
                      .filter(a => a.id !== currentUser.id)
                      .map(acc => (
                        <button
                          key={acc.id}
                          onClick={() => handleQuickSwitch(acc)}
                          className="flex items-center justify-between p-2.5 rounded-xl liquid-glass-card hover:border-[#C4A66A]/60 text-left text-xs transition-colors"
                        >
                          <span className="font-cinzel text-[#E6D4B0] font-semibold">{acc.name}</span>
                          <span className="text-[10px] text-[#A7A096] italic">{acc.email}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Sign In / Sign Up Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tab Selector */}
              <div className="flex rounded-xl liquid-glass-card p-1 border border-[#C4A66A]/30">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-cinzel uppercase tracking-wider transition-all duration-200 ${
                    mode === 'signin'
                      ? 'bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
                      : 'text-[#E6D4B0]/80 hover:text-[#F5EBDD]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-cinzel uppercase tracking-wider transition-all duration-200 ${
                    mode === 'signup'
                      ? 'bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
                      : 'text-[#E6D4B0]/80 hover:text-[#F5EBDD]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Status Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-serif-vintage backdrop-blur-sm">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-serif-vintage flex items-center gap-1.5 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Name (for sign up) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-cinzel uppercase tracking-wider text-[#C4A66A] mb-1 font-semibold">
                    Writer Name / Pseudonym
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-2.5 text-[#C4A66A]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Arthur Conan Doyle"
                      className="w-full pl-10 pr-3.5 py-2 liquid-glass-input rounded-xl text-sm text-[#F5EBDD] placeholder-[#A7A096]/60 focus:outline-none font-serif-vintage"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-cinzel uppercase tracking-wider text-[#C4A66A] mb-1 font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-2.5 text-[#C4A66A]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="writer@atelier.library"
                    className="w-full pl-10 pr-3.5 py-2 liquid-glass-input rounded-xl text-sm text-[#F5EBDD] placeholder-[#A7A096]/60 focus:outline-none font-serif-vintage"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-cinzel uppercase tracking-wider text-[#C4A66A] mb-1 font-semibold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-[#C4A66A]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2 liquid-glass-input rounded-xl text-sm text-[#F5EBDD] placeholder-[#A7A096]/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-3 py-2.5 bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.4)] hover:brightness-110 active:scale-95 transition-all"
              >
                {mode === 'signin' ? 'Sign In & Load Library' : 'Create Account & Begin Fresh'}
              </button>

              {/* Quick switch if accounts exist */}
              {existingAccounts.length > 0 && mode === 'signin' && (
                <div className="pt-3 border-t border-[#9D7946]/20">
                  <span className="block text-[11px] font-cinzel uppercase text-[#A7A096] mb-2 text-center">
                    Saved Accounts on This Device:
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto">
                    {existingAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setEmail(acc.email);
                          setPassword('');
                        }}
                        className="flex items-center justify-between p-2 rounded bg-[#281B15]/70 hover:bg-[#281B15] text-left border border-[#9D7946]/30 text-xs transition-colors"
                      >
                        <span className="font-cinzel text-[#E6D4B0]">{acc.name}</span>
                        <span className="text-[10px] text-[#A7A096]/80">{acc.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
