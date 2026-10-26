import React, { useRef, useEffect } from 'react';
import { 
  Feather, 
  BookmarkCheck, 
  Bell, 
  RotateCcw, 
  Sparkles,
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { calculateCarriageMetrics, formatAtelierDate, MAX_COLS_PER_LINE, MAX_LINES_PER_PAGE } from '../utils/journalLogic';

interface PaperEditorProps {
  draft: string;
  onDraftChange: (newDraft: string) => void;
  entryTitle: string;
  onEntryTitleChange: (newTitle: string) => void;
  onPreservePage: () => void;
  isArchiving: boolean;
  onClearDraft: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  bookTitle: string;
}

export const PaperEditor: React.FC<PaperEditorProps> = ({
  draft,
  onDraftChange,
  entryTitle,
  onEntryTitleChange,
  onPreservePage,
  isArchiving,
  onClearDraft,
  isMuted,
  onToggleMute,
  bookTitle,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const metrics = calculateCarriageMetrics(draft, MAX_COLS_PER_LINE, MAX_LINES_PER_PAGE);

  // Focus textarea when clicking parchment
  const handleParchmentClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto px-4">
      {/* Editorial Header Ribbon */}
      <div className="w-full flex items-center justify-between mb-2 px-3 py-1.5 bg-[#171310]/80 backdrop-blur-md rounded-t-lg border-t border-x border-[#9D7946]/30 text-xs">
        <div className="flex items-center gap-2 text-[#C4A66A] font-cinzel">
          <Feather className="w-3.5 h-3.5 text-[#C4A66A]" />
          <span className="font-semibold tracking-wider truncate max-w-[200px]">
            {bookTitle}
          </span>
          <span className="text-[#A7A096]/50">|</span>
          <span className="text-[11px] font-serif-vintage italic text-[#E6D4B0]/80">
            {formatAtelierDate()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#E6D4B0]/70 text-[11px] font-typewriter">
          <span className="hidden sm:inline">
            Line {metrics.currentLineIndex + 1}/{MAX_LINES_PER_PAGE}
          </span>
          <span className="hidden sm:inline">•</span>
          <span>{metrics.wordCount} words</span>
          <span className="hidden sm:inline">•</span>
          <button
            onClick={onToggleMute}
            className="p-1 hover:text-[#C4A66A] transition-colors"
            title={isMuted ? 'Unmute Mechanical Sound' : 'Mute Mechanical Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#C4A66A]" />}
          </button>
        </div>
      </div>

      {/* The Tactile Aged Parchment Sheet */}
      <div 
        onClick={handleParchmentClick}
        className={`
          relative w-full rounded-b-md sm:rounded-md p-5 sm:p-7 cursor-text
          parchment-texture text-[#281B15] transition-all duration-300
          border border-[#9D7946]/40 shadow-2xl flex flex-col
          ${isArchiving ? 'scale-95 opacity-50 blur-[1px]' : ''}
        `}
        style={{ minHeight: '340px', maxHeight: '460px' }}
      >
        {/* Subtle Watermark Crest & Faint Margin Line */}
        <div className="absolute top-3 right-5 opacity-15 pointer-events-none select-none text-right font-cinzel text-[10px] text-[#453025]">
          TYPEWRITER • MCMXXVI
          <div className="text-[8px] tracking-widest">P•L•A•T•E•N</div>
        </div>

        {/* Faint Red Margin Line (historical ledger/stationery tradition) */}
        <div className="absolute top-0 bottom-0 left-10 sm:left-14 w-[1px] bg-[#9D7946]/15 pointer-events-none" />

        {/* Entry Title Field */}
        <div className="pl-5 sm:pl-8 mb-2 border-b border-[#9D7946]/20 pb-1.5 flex items-center justify-between">
          <input
            type="text"
            value={entryTitle}
            onChange={(e) => onEntryTitleChange(e.target.value)}
            placeholder="Untitled Memoir or Chapter..."
            className="w-full bg-transparent font-cinzel font-semibold text-sm sm:text-base text-[#281B15] placeholder-[#6b5847]/50 focus:outline-none tracking-wide"
            aria-label="Entry Title"
          />
          {metrics.shouldRingBell && (
            <div className="flex items-center gap-1 text-[11px] font-cinzel text-[#8A3A22] animate-pulse whitespace-nowrap">
              <Bell className="w-3 h-3" />
              <span>Right Margin</span>
            </div>
          )}
        </div>

        {/* Actual Typing Area (Native Editable Textarea styled invisibly over lines) */}
        <div className="relative flex-1 pl-5 sm:pl-8 overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Place your fingers upon the keys. Strike with intention. Your words shall be forged into memory..."
            rows={12}
            className="w-full h-full bg-transparent font-typewriter text-xs sm:text-sm text-[#261A14] leading-[24px] resize-none focus:outline-none placeholder-[#7A6451]/60 tracking-wider"
            spellCheck={false}
            autoFocus
            aria-label="Typewriter Parchment"
          />
        </div>

        {/* Bottom Actions Bar */}
        <div className="mt-3 pt-2.5 border-t border-[#9D7946]/25 flex items-center justify-between pl-5 sm:pl-8">
          <button
            onClick={onClearDraft}
            className="text-[11px] font-cinzel text-[#6B523F] hover:text-[#281B15] flex items-center gap-1 transition-colors"
            title="Insert fresh blank sheet"
          >
            <RotateCcw className="w-3 h-3" />
            Fresh Sheet
          </button>

          {/* Preserve & Archive Page Action */}
          <button
            onClick={onPreservePage}
            disabled={draft.trim().length === 0 || isArchiving}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-lg font-cinzel text-xs uppercase tracking-wider
              transition-all duration-200 shadow-md active:scale-95
              ${
                draft.trim().length > 0 && !isArchiving
                  ? 'bg-gradient-to-r from-[#542C2D] to-[#3D1E20] text-[#F5EBDD] border border-[#C4A66A]/80 hover:brightness-110 shadow-[0_4px_12px_rgba(84,44,45,0.4)] ring-1 ring-[#C4A66A]/30'
                  : 'bg-[#281B15]/40 text-[#A7A096]/50 border border-[#9D7946]/20 cursor-not-allowed'
              }
            `}
            title="Transfer completed sheet into the antique diary"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-[#C4A66A]" />
            <span>Preserve This Page</span>
          </button>
        </div>
      </div>

      {/* Completion Toast Banner if page reaches capacity */}
      {metrics.isPageFull && !isArchiving && (
        <div className="mt-3 w-full p-2.5 bg-[#542C2D]/90 border border-[#C4A66A] rounded-lg text-[#F5EBDD] text-xs flex items-center justify-between shadow-xl animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C4A66A]" />
            <span className="font-cinzel">This parchment is full & ready for the archive.</span>
          </div>
          <button
            onClick={onPreservePage}
            className="px-3 py-1 bg-[#C4A66A] text-[#171310] font-cinzel font-bold text-[10px] tracking-wider rounded uppercase hover:brightness-105"
          >
            Preserve Now
          </button>
        </div>
      )}
    </div>
  );
};
