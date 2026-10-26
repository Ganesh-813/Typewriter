import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  PenTool, 
  Trash2, 
  Download, 
  FileText, 
  Calendar,
  X,
  Share2,
  Check
} from 'lucide-react';
import { Book, SheetPage, formatAtelierDate } from '../utils/journalLogic';

interface DiaryViewerProps {
  book: Book;
  onClose: () => void;
  onReturnToTypewriter: () => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePage: (pageId: string, updatedContent: string, updatedTitle: string) => void;
}

export const DiaryViewer: React.FC<DiaryViewerProps> = ({
  book,
  onClose,
  onReturnToTypewriter,
  onDeletePage,
  onUpdatePage,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(
    Math.max(0, book.pages.length - 1)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const activePage: SheetPage | undefined = book.pages[currentPageIndex];

  const handleStartEdit = () => {
    if (!activePage) return;
    setEditTitle(activePage.title);
    setEditContent(activePage.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!activePage) return;
    onUpdatePage(activePage.id, editContent, editTitle);
    setIsEditing(false);
  };

  const handleExportMarkdown = () => {
    const text = `# ${book.title}\n*${book.subtitle || ''}*\n\n` +
      book.pages.map(p => `## ${p.title} (${p.date})\n\n${p.content}\n`).join('\n---\n\n');
    
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title.replace(/\s+/g, '_')}_Archive.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    if (!activePage) return;
    navigator.clipboard.writeText(`${activePage.title}\n${activePage.date}\n\n${activePage.content}`);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 liquid-glass-scrim animate-fade-in">
      {/* Liquid Glass Leather Bound Book Wrapper */}
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl liquid-glass-modal overflow-hidden text-[#F5EBDD] shadow-[0_30px_90px_rgba(0,0,0,0.95)]"
        style={{ 
          backgroundImage: `linear-gradient(145deg, rgba(28, 20, 16, 0.84) 0%, rgba(18, 14, 11, 0.90) 55%, rgba(11, 8, 7, 0.96) 100%), radial-gradient(circle at 50% 0%, ${book.coverColor || '#281B15'}55 0%, transparent 70%)` 
        }}
      >
        {/* Top-Lit Specular Liquid Reflection */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5EBDD]/60 to-transparent pointer-events-none" />

        {/* Liquid Glass Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#C4A66A]/25 bg-black/25 backdrop-blur-md text-[#F5EBDD]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg liquid-glass-card flex items-center justify-center text-[#C4A66A] shadow-xs">
              <BookOpen className="w-4 h-4 text-[#C4A66A]" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-[#C4A66A] tracking-wider truncate max-w-xs sm:max-w-md drop-shadow-sm">
                {book.title}
              </h2>
              {book.subtitle && (
                <p className="text-[11px] font-serif-vintage italic text-[#E6D4B0]/80">
                  {book.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl liquid-glass-card hover:border-[#C4A66A] text-[#E6D4B0] font-cinzel text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
              title="Export Book as Markdown"
              aria-label="Export Markdown"
            >
              <Download className="w-3.5 h-3.5 text-[#C4A66A]" />
              <span className="hidden sm:inline font-semibold">Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#E6D4B0] transition-colors"
              aria-label="Close Diary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Book Interior Spread */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto flex justify-center items-center">
          {book.pages.length === 0 ? (
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-[#9D7946]/40 flex items-center justify-center text-[#C4A66A]">
                <PenTool className="w-7 h-7" />
              </div>
              <h3 className="font-cinzel text-lg text-[#C4A66A] mb-2">No Preserved Leaves Yet</h3>
              <p className="font-serif-vintage text-sm text-[#E6D4B0]/80 mb-6 italic">
                Return to the antique typewriter, strike the keys, and archive your first sheet into this leather volume.
              </p>
              <button
                onClick={onReturnToTypewriter}
                className="px-5 py-2.5 bg-[#542C2D] hover:bg-[#683637] border border-[#C4A66A] rounded-lg font-cinzel text-xs tracking-wider text-[#F5EBDD] uppercase shadow-lg transition-all"
              >
                Commence Writing
              </button>
            </div>
          ) : (
            <div className="w-full max-w-2xl parchment-texture rounded-lg p-6 sm:p-10 shadow-2xl border border-[#9D7946]/50 text-[#281B15] relative flex flex-col min-h-[420px]">
              {/* Corner brass filigree style */}
              <div className="absolute top-2 left-2 text-[#9D7946]/40 text-xs select-none">❧</div>
              <div className="absolute top-2 right-2 text-[#9D7946]/40 text-xs select-none">☙</div>
              <div className="absolute bottom-2 left-2 text-[#9D7946]/40 text-xs select-none">❦</div>
              <div className="absolute bottom-2 right-2 text-[#9D7946]/40 text-xs select-none">❧</div>

              {activePage && (
                <>
                  {/* Page Header */}
                  <div className="border-b border-[#9D7946]/30 pb-3 mb-4 flex items-center justify-between">
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="font-cinzel font-bold text-base bg-white/40 px-2 py-1 rounded border border-[#9D7946]/40 text-[#281B15] w-full"
                          aria-label="Edit title"
                        />
                      ) : (
                        <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#281B15] tracking-wide">
                          {activePage.title}
                        </h3>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs font-serif-vintage italic text-[#6B523F]">
                        <Calendar className="w-3 h-3 text-[#9D7946]" />
                        <span>{activePage.date}</span>
                        <span>•</span>
                        <span>Leaf {currentPageIndex + 1} of {book.pages.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-[#281B15] text-[#F5EBDD] font-cinzel text-xs rounded hover:bg-[#3D251A]"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={handleStartEdit}
                          className="p-1.5 rounded hover:bg-[#9D7946]/20 text-[#6B523F] transition-colors"
                          title="Edit this entry"
                          aria-label="Edit entry"
                        >
                          <PenTool className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={handleCopyText}
                        className="p-1.5 rounded hover:bg-[#9D7946]/20 text-[#6B523F] transition-colors"
                        title="Copy entry text"
                        aria-label="Copy text"
                      >
                        {copiedNotification ? <Check className="w-4 h-4 text-green-700" /> : <Share2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you certain you wish to remove this preserved leaf from memory?')) {
                            onDeletePage(activePage.id);
                            if (currentPageIndex > 0) {
                              setCurrentPageIndex(currentPageIndex - 1);
                            }
                          }
                        }}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-800 transition-colors"
                        title="Remove page from archive"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Page Body */}
                  <div className="flex-1 my-2">
                    {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={10}
                        className="w-full bg-white/40 p-2 rounded border border-[#9D7946]/40 font-typewriter text-xs sm:text-sm text-[#281B15] leading-relaxed resize-none focus:outline-none"
                        aria-label="Edit content"
                      />
                    ) : (
                      <div className="font-typewriter text-xs sm:text-sm text-[#261A14] leading-[26px] whitespace-pre-wrap select-text">
                        {activePage.content}
                      </div>
                    )}
                  </div>

                  {/* Page Footer */}
                  <div className="border-t border-[#9D7946]/20 pt-3 mt-4 flex items-center justify-between text-xs font-serif-vintage italic text-[#6B523F]">
                    <span>{activePage.wordCount} words preserved</span>
                    <span className="font-cinzel text-[10px] tracking-widest text-[#9D7946] font-bold">
                      TYPEWRITER ARCHIVE
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Liquid Glass Footer Navigation Bar */}
        <div className="px-6 py-3.5 border-t border-[#C4A66A]/25 bg-black/30 backdrop-blur-md flex items-center justify-between text-[#F5EBDD]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentPageIndex <= 0}
              className="px-2.5 py-1.5 rounded-xl liquid-glass-card hover:border-[#C4A66A] disabled:opacity-35 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 text-xs font-cinzel text-[#E6D4B0] active:scale-95 shadow-xs"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-[#C4A66A]" />
              <span className="hidden sm:inline font-semibold">Prior Leaf</span>
            </button>
            <div className="flex items-center gap-1.5 font-cinzel text-xs text-[#C4A66A]">
              <span>Leaf</span>
              <input
                type="number"
                min={1}
                max={book.pages.length || 1}
                value={book.pages.length > 0 ? currentPageIndex + 1 : 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= book.pages.length) {
                    setCurrentPageIndex(val - 1);
                  }
                }}
                className="w-12 text-center liquid-glass-input rounded-lg px-1.5 py-1 text-[#F5EBDD] font-bold focus:outline-none"
                aria-label="Jump to leaf"
              />
              <span className="text-[#E6D4B0]/80">of {book.pages.length}</span>
            </div>
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.min(book.pages.length - 1, prev + 1))}
              disabled={currentPageIndex >= book.pages.length - 1}
              className="px-2.5 py-1.5 rounded-xl liquid-glass-card hover:border-[#C4A66A] disabled:opacity-35 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 text-xs font-cinzel text-[#E6D4B0] active:scale-95 shadow-xs"
              aria-label="Next Page"
            >
              <span className="hidden sm:inline font-semibold">Next Leaf</span>
              <ChevronRight className="w-4 h-4 text-[#C4A66A]" />
            </button>
          </div>

          <button
            onClick={onReturnToTypewriter}
            className="px-5 py-2 bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.4)] transition-all active:scale-95"
          >
            Continue Writing
          </button>
        </div>
      </div>
    </div>
  );
};
