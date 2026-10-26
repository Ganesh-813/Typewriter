import React from 'react';
import { CornerDownLeft, Delete } from 'lucide-react';

interface TypewriterKeyboardProps {
  onKeyStrike: (char: string) => void;
  onBackspace: () => void;
  onReturn: () => void;
  activeKey: string | null;
}

export const TypewriterKeyboard: React.FC<TypewriterKeyboardProps> = ({
  onKeyStrike,
  onBackspace,
  onReturn,
  activeKey
}) => {
  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '"'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', ';'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '—'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '?']
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-3 bg-[#1e1713]/90 backdrop-blur-md border border-[#9D7946]/40 rounded-xl shadow-2xl flex flex-col gap-2">
      {/* Decorative Brass Branding Plaque */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-[#9D7946]/20 text-[#C4A66A] text-xs uppercase tracking-widest font-cinzel">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-[#9D7946] border border-[#C4A66A]" />
          TYPEWRITER
        </span>
        <span className="text-[10px] text-[#A7A096]/70 tracking-normal font-serif-vintage italic">
          No. 4182 • Cast Brass & Enamel
        </span>
        <button
          onClick={onReturn}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#453025] hover:bg-[#5B3025] text-[#F5EBDD] border border-[#9D7946]/50 text-[11px] font-cinzel tracking-wider transition-all active:scale-95 shadow"
          title="Manual Carriage Return (Enter)"
        >
          <CornerDownLeft className="w-3 h-3 text-[#C4A66A]" />
          Return
        </button>
      </div>

      {/* Keyboard Matrix */}
      <div className="flex flex-col gap-1.5 items-center select-none py-1">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 justify-center w-full">
            {row.map((char) => {
              const isPressed = activeKey?.toUpperCase() === char.toUpperCase();
              return (
                <button
                  key={char}
                  onClick={() => onKeyStrike(char)}
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center 
                    text-xs sm:text-sm font-typewriter font-bold transition-all duration-75
                    ${
                      isPressed
                        ? 'translate-y-1 scale-95 bg-[#171310] text-[#C4A66A] shadow-inner ring-2 ring-[#C4A66A]'
                        : 'bg-gradient-to-b from-[#281B15] to-[#171310] text-[#F5EBDD] shadow-[0_3px_0_#0f0b09,0_5px_8px_rgba(0,0,0,0.6)] hover:brightness-110 active:translate-y-1'
                    }
                    border border-[#9D7946]/70 ring-1 ring-[#9D7946]/30
                  `}
                  aria-label={`Key ${char}`}
                >
                  <span className="drop-shadow">{char}</span>
                </button>
              );
            })}
            {rIdx === 0 && (
              <button
                onClick={onBackspace}
                className="px-2.5 h-9 sm:h-10 rounded-lg flex items-center justify-center bg-[#281B15] text-[#E6D4B0] border border-[#9D7946]/60 shadow-[0_3px_0_#0f0b09] active:translate-y-1 text-xs hover:brightness-110"
                aria-label="Backspace"
                title="Backspace"
              >
                <Delete className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Spacebar Row */}
        <div className="flex gap-2 justify-center w-full mt-1 items-center">
          <button
            onClick={() => onKeyStrike(' ')}
            className={`
              w-56 sm:w-72 h-8 sm:h-9 rounded-md flex items-center justify-center 
              text-xs uppercase tracking-widest font-cinzel text-[#C4A66A]/80 border border-[#9D7946]/60
              transition-all duration-75
              ${
                activeKey === ' '
                  ? 'translate-y-1 bg-[#171310] shadow-inner ring-1 ring-[#C4A66A]'
                  : 'bg-gradient-to-b from-[#3a261c] to-[#22150f] shadow-[0_3px_0_#0f0b09,0_4px_6px_rgba(0,0,0,0.5)] active:translate-y-1 hover:brightness-110'
              }
            `}
            aria-label="Spacebar"
          >
            <span>SPACE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
