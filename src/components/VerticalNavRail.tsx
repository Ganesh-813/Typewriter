import React, { useState } from 'react';
import { 
  PenTool, 
  BookOpen, 
  Library, 
  BookPlus, 
  User, 
  Volume2, 
  VolumeX, 
  Music, 
  Keyboard, 
  Feather,
  Menu,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { UserAccount } from '../utils/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface VerticalNavRailProps {
  currentMode: 'writing' | 'diary' | 'bookshelf';
  onSelectMode: (mode: 'writing' | 'diary' | 'bookshelf') => void;
  onOpenCreateBook: () => void;
  onOpenAuth: () => void;
  currentUser: UserAccount | null;
  bookCount: number;
  hasActiveBook: boolean;
  showKeyboard: boolean;
  onToggleKeyboard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isAmbientOn: boolean;
  onToggleAmbient: () => void;
}

export const VerticalNavRail: React.FC<VerticalNavRailProps> = ({
  currentMode,
  onSelectMode,
  onOpenCreateBook,
  onOpenAuth,
  currentUser,
  bookCount,
  hasActiveBook,
  showKeyboard,
  onToggleKeyboard,
  isMuted,
  onToggleMute,
  isAmbientOn,
  onToggleAmbient,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Trigger Button (floating top-left on small screens) */}
      <div className="md:hidden absolute top-3 left-3 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 rounded-xl liquid-glass border border-[#C4A66A]/50 text-[#C4A66A] shadow-xl backdrop-blur-xl active:scale-95 transition-all"
          aria-label="Open Navigation"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 z-30 liquid-glass-scrim"
        />
      )}

      {/* The Sleek, Elegant Liquid Glass Vertical Navigation Rail */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between
          liquid-glass border-r border-[#C4A66A]/30
          transition-all duration-300 shadow-[12px_0_40px_rgba(0,0,0,0.8)]
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-60'}
        `}
      >
        {/* Subtle Top-Lit Specular Highlight on Rail */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5EBDD]/40 to-transparent pointer-events-none" />

        {/* Top Branding Section */}
        <div>
          <div className="p-4 sm:p-5 border-b border-[#9D7946]/25 flex items-center justify-between bg-black/15">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3D251A]/90 to-[#1E1713]/90 border border-[#C4A66A] flex items-center justify-center text-[#C4A66A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.5)]">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-cinzel text-sm sm:text-base font-bold tracking-[0.22em] text-[#C4A66A] drop-shadow-sm">
                  TYPEWRITER
                </h1>
                <p className="text-[9px] font-serif-vintage italic text-[#E6D4B0]/80">
                  Living Library & Desk
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1 text-[#A7A096] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Account Chip */}
          <div className="p-3 border-b border-[#9D7946]/20">
            <button
              onClick={() => {
                onOpenAuth();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl liquid-glass-card hover:border-[#C4A66A]/60 text-left transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-full bg-[#542C2D] border border-[#C4A66A] flex items-center justify-center text-xs font-cinzel text-[#F5EBDD] font-bold flex-shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-[#C4A66A]" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-cinzel text-xs font-semibold text-[#F5EBDD] truncate drop-shadow-sm">
                    {currentUser ? currentUser.name : 'Sign In / Register'}
                  </span>
                </div>
                <p className="text-[10px] font-serif-vintage italic text-[#C4A66A] truncate">
                  {currentUser ? 'Preserved Account' : 'Click to save your books'}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#C4A66A]/80 group-hover:translate-x-0.5 group-hover:text-[#F5EBDD] transition-transform" />
            </button>
          </div>

          {/* Primary Navigation Rail Items */}
          <nav className="p-3 space-y-2 font-cinzel text-xs tracking-wider">
            {/* Writing Desk */}
            <button
              onClick={() => {
                onSelectMode('writing');
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 text-left ${
                currentMode === 'writing'
                  ? 'bg-gradient-to-r from-[#542C2D]/50 via-[#3D251A]/60 to-[#2B1911]/60 border-[#C4A66A] text-[#F5EBDD] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_4px_16px_rgba(0,0,0,0.5)] ring-1 ring-[#C4A66A]/40'
                  : 'border-transparent text-[#E6D4B0]/80 hover:border-[#C4A66A]/30 hover:bg-white/[0.04] hover:text-[#F5EBDD]'
              }`}
            >
              <PenTool className="w-4 h-4 text-[#C4A66A]" />
              <span className="font-semibold drop-shadow-sm">Writing Desk</span>
            </button>

            {/* Open Diary / Current Volume */}
            <button
              onClick={() => {
                onSelectMode('diary');
                setIsMobileOpen(false);
              }}
              disabled={!hasActiveBook}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 text-left ${
                !hasActiveBook 
                  ? 'opacity-40 cursor-not-allowed border-transparent text-[#A7A096]'
                  : currentMode === 'diary'
                    ? 'bg-gradient-to-r from-[#542C2D]/60 via-[#422324]/60 to-[#2B1911]/60 border-[#C4A66A] text-[#F5EBDD] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_4px_16px_rgba(0,0,0,0.5)] ring-1 ring-[#C4A66A]/40'
                    : 'border-transparent text-[#E6D4B0]/80 hover:border-[#C4A66A]/30 hover:bg-white/[0.04] hover:text-[#F5EBDD]'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-[#C4A66A]" />
                <span className="font-semibold drop-shadow-sm">Open Diary</span>
              </div>
              {hasActiveBook && (
                <span className="w-2 h-2 rounded-full bg-[#C4A66A] shadow-[0_0_8px_rgba(196,166,106,0.8)]" />
              )}
            </button>

            {/* Living Library */}
            <button
              onClick={() => {
                onSelectMode('bookshelf');
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 text-left ${
                currentMode === 'bookshelf'
                  ? 'bg-gradient-to-r from-[#542C2D]/50 via-[#3D251A]/60 to-[#2B1911]/60 border-[#C4A66A] text-[#F5EBDD] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_4px_16px_rgba(0,0,0,0.5)] ring-1 ring-[#C4A66A]/40'
                  : 'border-transparent text-[#E6D4B0]/80 hover:border-[#C4A66A]/30 hover:bg-white/[0.04] hover:text-[#F5EBDD]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Library className="w-4 h-4 text-[#C4A66A]" />
                <span className="font-semibold drop-shadow-sm">My Library</span>
              </div>
              <span className="px-2 py-0.5 rounded-md liquid-glass text-[10px] text-[#C4A66A] font-bold border border-[#C4A66A]/40 shadow-xs">
                {bookCount}
              </span>
            </button>

            {/* Bind New Volume */}
            <button
              onClick={() => {
                onOpenCreateBook();
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#C4A66A]/40 liquid-glass-card hover:border-[#C4A66A]/80 text-[#C4A66A] hover:text-[#F5EBDD] transition-all duration-200 text-left group"
            >
              <BookPlus className="w-4 h-4 text-[#C4A66A] group-hover:scale-110 transition-transform" />
              <span className="font-semibold drop-shadow-sm">Bind Volume</span>
            </button>
          </nav>
        </div>

        {/* Bottom Quick Controls & PWA Install */}
        <div className="p-3 border-t border-[#9D7946]/20 bg-black/25 backdrop-blur-md space-y-2">
          {/* Quick Setting Pills */}
          <div className="grid grid-cols-3 gap-1.5">
            {/* Keyboard Toggle */}
            <button
              onClick={onToggleKeyboard}
              className={`p-2 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                showKeyboard
                  ? 'bg-gradient-to-b from-[#3D251A]/80 to-[#281812]/90 border-[#C4A66A] text-[#C4A66A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]'
                  : 'liquid-glass-card border-[#9D7946]/30 text-[#A7A096]/70 hover:text-[#E6D4B0]'
              }`}
              title="Toggle Mechanical Keyboard Dock"
              aria-label="Toggle Keyboard"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="text-[9px] font-cinzel">Keys</span>
            </button>

            {/* Mechanical Audio */}
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                !isMuted
                  ? 'bg-gradient-to-b from-[#3D251A]/80 to-[#281812]/90 border-[#C4A66A] text-[#C4A66A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]'
                  : 'liquid-glass-card border-[#9D7946]/30 text-red-400'
              }`}
              title={isMuted ? 'Unmute Mechanical Sound' : 'Mute Mechanical Sound'}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[9px] font-cinzel">{isMuted ? 'Muted' : 'Sound'}</span>
            </button>

            {/* Atmospheric Rain */}
            <button
              onClick={onToggleAmbient}
              className={`p-2 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                isAmbientOn
                  ? 'bg-gradient-to-b from-[#3D251A]/80 to-[#281812]/90 border-[#C4A66A] text-[#C4A66A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]'
                  : 'liquid-glass-card border-[#9D7946]/30 text-[#A7A096]/70 hover:text-[#E6D4B0]'
              }`}
              title="Toggle Atmospheric Rain & Tone"
              aria-label="Toggle Ambiance"
            >
              <Music className="w-3.5 h-3.5" />
              <span className="text-[9px] font-cinzel">Rain</span>
            </button>
          </div>

          {/* PWA App Installation for Tablet/Mobile/Desktop */}
          <PWAInstallButton />
        </div>
      </aside>
    </>
  );
};
