import React, { useState, useEffect } from 'react';
import { Feather, Sparkles, ArrowRight } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface CinematicIntroProps {
  onEnter: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onEnter }) => {
  const [typedTitle, setTypedTitle] = useState('');
  const [phase, setPhase] = useState<number>(0);

  const fullTitle = 'TYPEWRITER';

  useEffect(() => {
    // Typewriter mechanical letter typing animation
    let charIdx = 0;
    const interval = setInterval(() => {
      if (charIdx < fullTitle.length) {
        const nextChar = fullTitle[charIdx];
        setTypedTitle(fullTitle.slice(0, charIdx + 1));
        // Soft keystroke audio for intro
        audioEngine.playKeyClick(nextChar);
        charIdx++;
      } else {
        clearInterval(interval);
        setPhase(1); // reveal tagline & CTA
      }
    }, 140);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#120f0d] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Subtle Dust Particle / Window Light Ray Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(196,166,106,0.12)_0%,rgba(20,16,13,0.95)_75%)] pointer-events-none" />

      {/* Decorative Top Flourish */}
      <div className="relative mb-6 text-[#C4A66A]/70 flex items-center justify-center gap-2">
        <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#C4A66A]/60" />
        <Feather className="w-5 h-5 text-[#C4A66A]" />
        <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#C4A66A]/60" />
      </div>

      {/* Brand Title (Mechanical Keystrokes) */}
      <div className="relative mb-4">
        <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.28em] text-[#F5EBDD] drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
          {typedTitle}
          {typedTitle.length < fullTitle.length && (
            <span className="inline-block w-2.5 h-8 sm:h-12 bg-[#C4A66A] ml-2 animate-pulse align-middle" />
          )}
        </h1>
      </div>

      {/* Subtitles & Inscriptions with Gentle Fade In */}
      <div className={`transition-all duration-1000 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="font-serif-vintage italic text-lg sm:text-2xl text-[#E6D4B0] mb-2 tracking-wide">
          “Where every thought becomes something timeless.”
        </p>
        <p className="font-serif-vintage text-xs sm:text-sm text-[#A7A096]/70 uppercase tracking-widest mb-10">
          Write it. Shape it. Preserve it.
        </p>

        {/* Enter Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onEnter}
            className="group px-8 py-3.5 bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-cinzel font-bold text-xs uppercase tracking-[0.2em] rounded-lg shadow-[0_4px_25px_rgba(196,166,106,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Enter Your Library</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Quick Skip Button in Corner */}
      <button
        onClick={onEnter}
        className="absolute bottom-6 right-6 font-cinzel text-[11px] text-[#A7A096]/60 hover:text-[#C4A66A] uppercase tracking-widest transition-colors"
      >
        Skip Introduction →
      </button>
    </div>
  );
};
