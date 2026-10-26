import React, { useState } from 'react';
import { X, BookPlus, Sparkles, Check } from 'lucide-react';
import { 
  BookType, 
  CoverMaterial, 
  BOOK_TYPE_METADATA 
} from '../utils/journalLogic';

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBook: (bookData: {
    title: string;
    subtitle?: string;
    type: BookType;
    coverMaterial: CoverMaterial;
    coverColor: string;
    accentGold: boolean;
    tags: string[];
  }) => void;
}

const COVER_OPTIONS: { id: CoverMaterial; name: string; hex: string }[] = [
  { id: 'burgundy-leather', name: 'Aged Burgundy Leather', hex: '#542C2D' },
  { id: 'espresso-leather', name: 'Espresso Calfskin', hex: '#281B15' },
  { id: 'dark-walnut', name: 'Dark Polished Walnut', hex: '#453025' },
  { id: 'navy-cloth', name: 'Imperial Navy Buckram', hex: '#1C2638' },
  { id: 'olive-morocco', name: 'Muted Olive Morocco', hex: '#3B3A2C' },
  { id: 'antique-parchment', name: 'Aged Vellum Parchment', hex: '#D6C098' },
];

export const CreateBookModal: React.FC<CreateBookModalProps> = ({
  isOpen,
  onClose,
  onCreateBook,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [type, setType] = useState<BookType>('diary');
  const [coverMaterial, setCoverMaterial] = useState<CoverMaterial>('burgundy-leather');
  const [coverColor, setCoverColor] = useState('#542C2D');
  const [accentGold, setAccentGold] = useState(true);
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onCreateBook({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      type,
      coverMaterial,
      coverColor,
      accentGold,
      tags: tags.length > 0 ? tags : [BOOK_TYPE_METADATA[type].label],
    });

    onClose();
  };

  const handleSelectMaterial = (option: typeof COVER_OPTIONS[0]) => {
    setCoverMaterial(option.id);
    setCoverColor(option.hex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 liquid-glass-scrim animate-fade-in">
      <div className="relative w-full max-w-2xl liquid-glass-modal rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden text-[#F5EBDD]">
        {/* Top-Lit Specular Liquid Reflection */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5EBDD]/60 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C4A66A]/25 bg-black/25 backdrop-blur-md">
          <div className="flex items-center gap-2.5 font-cinzel text-lg text-[#C4A66A]">
            <div className="w-8 h-8 rounded-lg liquid-glass-card flex items-center justify-center text-[#C4A66A] shadow-xs">
              <BookPlus className="w-4 h-4 text-[#C4A66A]" />
            </div>
            <h2 className="font-bold tracking-wider drop-shadow-sm">Bind a New Volume</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#E6D4B0] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Live Physical Book Preview */}
          <div className="flex justify-center py-2">
            <div 
              className="relative w-52 h-64 rounded-r-xl rounded-l-md shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-4 flex flex-col justify-between border-y-2 border-r-2 border-l-4 transition-all duration-300"
              style={{ 
                backgroundColor: coverColor,
                borderColor: accentGold ? '#C4A66A' : '#77745A',
                borderLeftColor: '#171310'
              }}
            >
              {/* Spine edge line */}
              <div className="absolute top-0 bottom-0 left-3 w-[1px] bg-black/30" />
              
              {/* Gold border ornamentation */}
              <div className="border border-[#C4A66A]/40 h-full w-full rounded-r-lg p-3 flex flex-col justify-between">
                <div className="text-center">
                  <div className="font-cinzel text-xs text-[#C4A66A] tracking-widest uppercase mb-1">
                    {BOOK_TYPE_METADATA[type].label}
                  </div>
                  <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#F5EBDD] drop-shadow-md leading-tight line-clamp-3">
                    {title || 'Untitled Volume'}
                  </h3>
                  {subtitle && (
                    <p className="font-serif-vintage italic text-[11px] text-[#E6D4B0]/80 mt-1 line-clamp-2">
                      {subtitle}
                    </p>
                  )}
                </div>

                <div className="text-center font-cinzel text-[9px] text-[#C4A66A]/80 tracking-widest border-t border-[#C4A66A]/30 pt-2 font-bold">
                  TYPEWRITER
                </div>
              </div>
            </div>
          </div>

          {/* Book Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-[#C4A66A] mb-1.5 font-semibold">
                Volume Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Book of Hours"
                className="w-full px-3.5 py-2 liquid-glass-input rounded-xl text-sm text-[#F5EBDD] placeholder-[#A7A096]/60 font-serif-vintage focus:outline-none"
                aria-label="Volume Title"
              />
            </div>

            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-[#C4A66A] mb-1.5 font-semibold">
                Subtitle / Inscription
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Nocturnal Musings"
                className="w-full px-3.5 py-2 liquid-glass-input rounded-xl text-sm text-[#F5EBDD] placeholder-[#A7A096]/60 font-serif-vintage focus:outline-none"
                aria-label="Subtitle"
              />
            </div>
          </div>

          {/* Book Type Selector */}
          <div>
            <label className="block text-xs font-cinzel uppercase tracking-wider text-[#C4A66A] mb-2 font-semibold">
              Book Type & Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(BOOK_TYPE_METADATA) as BookType[]).map((tKey) => {
                const meta = BOOK_TYPE_METADATA[tKey];
                const isSelected = type === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => {
                      setType(tKey);
                    }}
                    className={`
                      p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200
                      ${
                        isSelected
                          ? 'border-[#C4A66A] liquid-glass ring-1 ring-[#C4A66A]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_4px_16px_rgba(0,0,0,0.5)]'
                          : 'liquid-glass-card hover:border-[#C4A66A]/50'
                      }
                    `}
                  >
                    <span className="font-cinzel text-xs font-bold text-[#E6D4B0]">{meta.label}</span>
                    <span className="font-serif-vintage text-[10px] text-[#E6D4B0]/75 line-clamp-2 mt-1">
                      {meta.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cover Material & Palette */}
          <div>
            <label className="block text-xs font-cinzel uppercase tracking-wider text-[#C4A66A] mb-2 font-semibold">
              Cover Binding & Material
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COVER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectMaterial(opt)}
                  className={`
                    flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200
                    ${
                      coverMaterial === opt.id
                        ? 'border-[#C4A66A] liquid-glass ring-1 ring-[#C4A66A]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)]'
                        : 'liquid-glass-card hover:border-[#C4A66A]/50'
                    }
                  `}
                >
                  <span 
                    className="w-4 h-4 rounded-full border border-white/40 flex-shrink-0 shadow-sm" 
                    style={{ backgroundColor: opt.hex }} 
                  />
                  <span className="font-serif-vintage text-xs text-[#E6D4B0] truncate">
                    {opt.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-cinzel uppercase tracking-wider text-[#C4A66A] mb-1.5 font-semibold">
              Tags & Categories (comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Memoir, Poetry, Philosophy"
              className="w-full px-3.5 py-2 liquid-glass-input rounded-xl text-sm text-[#F5EBDD] placeholder-[#A7A096]/60 font-serif-vintage focus:outline-none"
              aria-label="Tags"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#C4A66A]/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-cinzel text-xs uppercase tracking-wider text-[#E6D4B0]/80 hover:text-[#F5EBDD] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.4)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              Bind Book & Place on Shelf
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
