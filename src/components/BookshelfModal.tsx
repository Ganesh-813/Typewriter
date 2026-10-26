import React, { useState } from 'react';
import { 
  Library, 
  Search, 
  Plus, 
  BookOpen, 
  PenTool, 
  Trash2, 
  X, 
  Layers,
  Sparkles,
  Filter
} from 'lucide-react';
import { Book, BookType, searchLibrary, BOOK_TYPE_METADATA } from '../utils/journalLogic';

interface BookshelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  activeBookId: string;
  onSelectBook: (bookId: string) => void;
  onOpenDiary: (bookId: string) => void;
  onOpenCreateModal: () => void;
  onDeleteBook: (bookId: string) => void;
}

export const BookshelfModal: React.FC<BookshelfModalProps> = ({
  isOpen,
  onClose,
  books,
  activeBookId,
  onSelectBook,
  onOpenDiary,
  onOpenCreateModal,
  onDeleteBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredBooks = searchLibrary(books, searchQuery, selectedType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 liquid-glass-scrim animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] liquid-glass-modal rounded-2xl flex flex-col overflow-hidden text-[#F5EBDD] shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
        {/* Top-Lit Specular Liquid Reflection */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5EBDD]/60 to-transparent pointer-events-none" />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-[#C4A66A]/25 bg-black/25 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl liquid-glass-card flex items-center justify-center text-[#C4A66A] shadow-xs">
              <Library className="w-5 h-5 text-[#C4A66A]" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-[#C4A66A] tracking-wider drop-shadow-sm">
                The Private Archive & Living Library
              </h2>
              <p className="font-serif-vintage italic text-xs text-[#E6D4B0]/80">
                {books.length} bound volumes curated within your collection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_16px_rgba(0,0,0,0.4)] hover:brightness-110 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Bind New Book
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#E6D4B0] transition-colors"
              aria-label="Close Library"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Rail */}
        <div className="px-6 py-3 border-b border-[#C4A66A]/20 bg-white/[0.02] backdrop-blur-md flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#C4A66A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volumes, chapters, or typed words..."
              className="w-full pl-9 pr-3 py-1.5 liquid-glass-input rounded-xl text-xs font-serif-vintage text-[#F5EBDD] placeholder-[#A7A096]/70 focus:outline-none"
              aria-label="Search Library"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel whitespace-nowrap transition-all duration-200 ${
                selectedType === 'all'
                  ? 'bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
                  : 'liquid-glass-card text-[#E6D4B0]/80 hover:text-[#F5EBDD] hover:border-[#C4A66A]/50'
              }`}
            >
              All Volumes
            </button>
            {Object.entries(BOOK_TYPE_METADATA).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-cinzel whitespace-nowrap transition-all duration-200 ${
                  selectedType === key
                    ? 'bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]'
                    : 'liquid-glass-card text-[#E6D4B0]/80 hover:text-[#F5EBDD] hover:border-[#C4A66A]/50'
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookshelf Wooden Planks Grid */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 px-4 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-[#9D7946]/50 flex items-center justify-center text-[#C4A66A] bg-[#281B15]">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-[#C4A66A] mb-2">
                Your Library is Pure and Unwritten
              </h3>
              <p className="font-serif-vintage text-sm text-[#E6D4B0]/80 mb-6 italic">
                A pristine sanctuary awaits. Bind your first volume to begin forging your thoughts into permanence.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateModal();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-cinzel font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                + Bind Your First Volume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const isActive = book.id === activeBookId;
                return (
                  <div
                    key={book.id}
                    className={`
                      relative group rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between
                      shadow-xl hover:-translate-y-1 hover:shadow-2xl
                      ${
                        isActive
                          ? 'border-[#C4A66A] ring-1 ring-[#C4A66A]/60 liquid-glass shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_12px_36px_rgba(0,0,0,0.7)]'
                          : 'liquid-glass-card hover:border-[#C4A66A]/60'
                      }
                    `}
                  >
                    {/* Active Ribbon Tag */}
                    {isActive && (
                      <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-cinzel font-bold text-[9px] uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                        Current Desk Volume
                      </span>
                    )}

                    <div>
                      {/* Spine / Book representation */}
                      <div className="flex items-start gap-4 mb-3">
                        <div
                          className="w-12 h-20 rounded-r-md rounded-l-xs shadow-lg border-r-2 border-y flex-shrink-0 flex flex-col justify-between p-1.5 transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: book.coverColor,
                            borderColor: '#C4A66A',
                          }}
                        >
                          <div className="w-full h-1 bg-[#C4A66A]/60 rounded-full" />
                          <div className="w-full text-center font-cinzel text-[7px] text-[#F5EBDD] font-bold line-clamp-2">
                            {book.title}
                          </div>
                          <div className="w-full h-1 bg-[#C4A66A]/60 rounded-full" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-cinzel uppercase tracking-widest text-[#C4A66A] font-semibold">
                            {BOOK_TYPE_METADATA[book.type]?.label || book.type}
                          </span>
                          <h3 className="font-cinzel text-base font-bold text-[#F5EBDD] truncate group-hover:text-[#C4A66A] transition-colors drop-shadow-sm">
                            {book.title}
                          </h3>
                          {book.subtitle && (
                            <p className="font-serif-vintage italic text-xs text-[#E6D4B0]/80 truncate">
                              {book.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-serif-vintage text-[#E6D4B0]/70">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3 text-[#C4A66A]" />
                              {book.pages.length} preserved {book.pages.length === 1 ? 'leaf' : 'leaves'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Excerpt of draft or first page in frosted well */}
                      <div className="p-3 rounded-xl bg-black/40 backdrop-blur-sm border border-[#C4A66A]/15 font-typewriter text-[11px] text-[#E6D4B0]/85 line-clamp-2 mb-4 leading-relaxed shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                        {book.currentDraft || book.pages[0]?.content || 'Blank volume awaits your ink.'}
                      </div>
                    </div>

                    {/* Book Actions */}
                    <div className="pt-3 border-t border-[#C4A66A]/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onSelectBook(book.id);
                            onClose();
                          }}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-[#9D7946] to-[#C4A66A] text-[#171310] font-cinzel font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] hover:brightness-110"
                          title="Place volume on typewriter platen to type"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Write</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenDiary(book.id);
                            onClose();
                          }}
                          className="px-3 py-1.5 liquid-glass-card hover:border-[#C4A66A] text-[#E6D4B0] hover:text-[#F5EBDD] rounded-xl text-xs font-cinzel flex items-center gap-1.5 transition-all active:scale-95"
                          title="Open and read diary pages"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#C4A66A]" />
                          <span>Browse</span>
                        </button>
                      </div>

                      {books.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you certain you wish to remove the volume "${book.title}"?`)) {
                              onDeleteBook(book.id);
                            }
                          }}
                          className="p-1.5 text-[#A7A096]/60 hover:text-red-400 transition-colors"
                          title="Remove Book"
                          aria-label={`Delete ${book.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
