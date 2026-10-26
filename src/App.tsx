import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  BookOpen, 
  Library, 
  Plus, 
  RotateCcw, 
  BookmarkCheck, 
  Sparkles,
  Feather,
  BookPlus
} from 'lucide-react';

import { 
  Book, 
  BookType, 
  CoverMaterial, 
  SheetPage, 
  calculateCarriageMetrics, 
  formatAtelierDate,
  MAX_COLS_PER_LINE,
  MAX_LINES_PER_PAGE
} from './utils/journalLogic';
import { 
  UserAccount, 
  getCurrentSessionUser, 
  loadUserBooks, 
  saveUserBooks 
} from './utils/auth';
import { audioEngine } from './utils/audioEngine';
import { Atelier3DScene } from './components/Atelier3DScene';
import { PaperEditor } from './components/PaperEditor';
import { TypewriterKeyboard } from './components/TypewriterKeyboard';
import { DiaryViewer } from './components/DiaryViewer';
import { BookshelfModal } from './components/BookshelfModal';
import { CreateBookModal } from './components/CreateBookModal';
import { CinematicIntro } from './components/CinematicIntro';
import { VerticalNavRail } from './components/VerticalNavRail';
import { AuthModal } from './components/AuthModal';

export function App() {
  // Check if autostart query param is present
  const isAutostart = typeof window !== 'undefined' && 
    (new URLSearchParams(window.location.search).get('autostart') === '1');

  // App States
  const [showIntro, setShowIntro] = useState(!isAutostart);
  const [cameraMode, setCameraMode] = useState<'writing' | 'diary' | 'bookshelf'>('writing');
  
  // User Session & Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentSessionUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Persistent Books per User (Clean slate: starts empty with no dummy books)
  const currentUserId = currentUser ? currentUser.id : 'guest';
  const [books, setBooks] = useState<Book[]>(() => {
    return loadUserBooks(currentUserId);
  });

  const [activeBookId, setActiveBookId] = useState<string | null>(() => {
    return books[0]?.id || null;
  });

  const activeBook: Book | null = books.find(b => b.id === activeBookId) || books[0] || null;

  // Current draft & entry metadata
  const [currentDraft, setCurrentDraft] = useState<string>(activeBook?.currentDraft || '');
  const [entryTitle, setEntryTitle] = useState<string>('');
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Archiving Animation State
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveProgress, setArchiveProgress] = useState(0);
  const [preservationToast, setPreservationToast] = useState<{ title: string; date: string } | null>(null);

  // Modals & Panels
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isBookshelfOpen, setIsBookshelfOpen] = useState(false);
  const [isCreateBookOpen, setIsCreateBookOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [showOnScreenKeyboard, setShowOnScreenKeyboard] = useState(true);

  // Load books whenever active user changes
  useEffect(() => {
    const userBooks = loadUserBooks(currentUserId);
    setBooks(userBooks);
    if (userBooks.length > 0) {
      setActiveBookId(userBooks[0].id);
      setCurrentDraft(userBooks[0].currentDraft || '');
    } else {
      setActiveBookId(null);
      setCurrentDraft('');
    }
    setEntryTitle('');
  }, [currentUserId]);

  // Save books for the active user whenever books state updates
  useEffect(() => {
    saveUserBooks(currentUserId, books);
  }, [books, currentUserId]);

  // Sync draft when active book changes
  useEffect(() => {
    if (activeBook) {
      setCurrentDraft(activeBook.currentDraft || '');
      setEntryTitle('');
    } else {
      setCurrentDraft('');
      setEntryTitle('');
    }
  }, [activeBookId]);

  // Update currentDraft inside activeBook
  const handleDraftChange = useCallback((newDraft: string) => {
    setCurrentDraft(newDraft);
    if (activeBookId) {
      setBooks(prev => prev.map(b => 
        b.id === activeBookId ? { ...b, currentDraft: newDraft, updatedAt: new Date().toISOString() } : b
      ));
    }
  }, [activeBookId]);

  // Metrics
  const metrics = calculateCarriageMetrics(currentDraft, MAX_COLS_PER_LINE, MAX_LINES_PER_PAGE);

  // Global Physical Keyboard Listener for Tactile Response
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isArchiving || isDiaryOpen || isBookshelfOpen || isCreateBookOpen || isAuthOpen || showIntro) return;

      const key = e.key;
      setActiveKey(key);
      setTimeout(() => setActiveKey(null), 100);

      if (key === 'Enter') {
        audioEngine.playCarriageReturn();
      } else if (key === ' ') {
        audioEngine.playSpacebar();
      } else if (key === 'Backspace') {
        audioEngine.playKeyClick('del');
      } else if (key.length === 1) {
        audioEngine.playKeyClick(key);
        if (metrics.shouldRingBell) {
          audioEngine.playBell();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [metrics.shouldRingBell, isArchiving, isDiaryOpen, isBookshelfOpen, isCreateBookOpen, isAuthOpen, showIntro]);

  // Key Strike handler for on-screen keyboard
  const handleKeyStrike = (char: string) => {
    setActiveKey(char);
    setTimeout(() => setActiveKey(null), 90);

    if (char === ' ') {
      audioEngine.playSpacebar();
      handleDraftChange(currentDraft + ' ');
    } else {
      audioEngine.playKeyClick(char);
      if (metrics.shouldRingBell) {
        audioEngine.playBell();
      }
      handleDraftChange(currentDraft + char);
    }
  };

  const handleBackspace = () => {
    audioEngine.playKeyClick('del');
    setActiveKey('Backspace');
    setTimeout(() => setActiveKey(null), 90);
    handleDraftChange(currentDraft.slice(0, -1));
  };

  const handleReturn = () => {
    audioEngine.playCarriageReturn();
    setActiveKey('Enter');
    setTimeout(() => setActiveKey(null), 90);
    handleDraftChange(currentDraft + '\n');
  };

  // Signature Paper Archiving Choreography
  const handlePreservePage = () => {
    if (currentDraft.trim().length === 0 || isArchiving) return;

    // If no book exists yet, automatically create first volume
    let targetBookId = activeBookId;
    if (!targetBookId || !activeBook) {
      const defaultFirstBook: Book = {
        id: `book-${Date.now()}`,
        title: entryTitle.trim() || 'My First Memoir',
        subtitle: 'Personal Collection',
        type: 'diary',
        coverMaterial: 'burgundy-leather',
        coverColor: '#542C2D',
        accentGold: true,
        tags: ['Journal', 'Memoir'],
        pages: [],
        currentDraft: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setBooks([defaultFirstBook]);
      setActiveBookId(defaultFirstBook.id);
      targetBookId = defaultFirstBook.id;
    }

    setIsArchiving(true);
    setArchiveProgress(0);
    setCameraMode('diary');

    // 1. Carriage returns & bell sounds
    audioEngine.playCarriageReturn();
    setTimeout(() => audioEngine.playBell(), 200);

    // 2. Paper slide swoosh
    setTimeout(() => {
      audioEngine.playPaperSlide();
    }, 600);

    // 3. Smooth animation progress over 3.2 seconds
    const startTime = Date.now();
    const duration = 3200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      setArchiveProgress(progress);

      if (progress >= 1.0) {
        clearInterval(interval);
        
        // 4. Book binding sound effect
        audioEngine.playBookOpen();

        // 5. Append new page to active book's infinite pages
        const bookObj = books.find(b => b.id === targetBookId) || activeBook;
        const pageNum = (bookObj?.pages.length || 0) + 1;

        const newPage: SheetPage = {
          id: `leaf-${Date.now()}`,
          bookId: targetBookId!,
          pageNumber: pageNum,
          title: entryTitle.trim() || `Leaf ${pageNum}`,
          date: formatAtelierDate(),
          content: currentDraft.trim(),
          lineCount: metrics.lineCount,
          wordCount: metrics.wordCount,
          archivedAt: new Date().toISOString()
        };

        const pageTitle = newPage.title;
        const pageDate = newPage.date;

        setBooks(prev => prev.map(b => {
          if (b.id === targetBookId) {
            return {
              ...b,
              currentDraft: '',
              pages: [...b.pages, newPage],
              updatedAt: new Date().toISOString()
            };
          }
          return b;
        }));

        setCurrentDraft('');
        setEntryTitle('');
        setIsArchiving(false);
        setArchiveProgress(0);

        // Toast confirmation
        setPreservationToast({ title: pageTitle, date: pageDate });
        setTimeout(() => setPreservationToast(null), 4000);

        // Return camera to active writing
        setTimeout(() => {
          setCameraMode('writing');
        }, 1200);
      }
    }, 30);
  };

  // Create new book handler
  const handleCreateBook = (bookData: {
    title: string;
    subtitle?: string;
    type: BookType;
    coverMaterial: CoverMaterial;
    coverColor: string;
    accentGold: boolean;
    tags: string[];
  }) => {
    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: bookData.title,
      subtitle: bookData.subtitle,
      type: bookData.type,
      coverMaterial: bookData.coverMaterial,
      coverColor: bookData.coverColor,
      accentGold: bookData.accentGold,
      tags: bookData.tags,
      pages: [],
      currentDraft: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setBooks(prev => [newBook, ...prev]);
    setActiveBookId(newBook.id);
    setCameraMode('writing');
  };

  // Update existing page inside DiaryViewer
  const handleUpdatePage = (pageId: string, updatedContent: string, updatedTitle: string) => {
    if (!activeBookId) return;
    setBooks(prev => prev.map(b => {
      if (b.id === activeBookId) {
        return {
          ...b,
          pages: b.pages.map(p => 
            p.id === pageId ? { ...p, content: updatedContent, title: updatedTitle } : p
          )
        };
      }
      return b;
    }));
  };

  // Delete page inside DiaryViewer
  const handleDeletePage = (pageId: string) => {
    if (!activeBookId) return;
    setBooks(prev => prev.map(b => {
      if (b.id === activeBookId) {
        return {
          ...b,
          pages: b.pages.filter(p => p.id !== pageId)
        };
      }
      return b;
    }));
  };

  // Delete entire book
  const handleDeleteBook = (bookId: string) => {
    const remaining = books.filter(b => b.id !== bookId);
    setBooks(remaining);
    if (activeBookId === bookId) {
      setActiveBookId(remaining[0]?.id || null);
    }
  };

  // Audio toggles
  const handleToggleMute = () => {
    audioEngine.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleToggleAmbient = () => {
    const playing = audioEngine.toggleAmbientSound();
    setIsAmbientOn(playing);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#151311] text-[#F5EBDD] font-serif-vintage select-none">
      {/* 1. Cinematic Intro Screen */}
      {showIntro && (
        <CinematicIntro 
          onEnter={() => {
            setShowIntro(false);
            setCameraMode('writing');
          }} 
        />
      )}

      {/* 2. Professional Vertical Navigation Rail (Left side) */}
      <VerticalNavRail
        currentMode={cameraMode}
        onSelectMode={(mode) => {
          setCameraMode(mode);
          if (mode === 'diary' && activeBook) setIsDiaryOpen(true);
          if (mode === 'bookshelf') setIsBookshelfOpen(true);
        }}
        onOpenCreateBook={() => setIsCreateBookOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        bookCount={books.length}
        hasActiveBook={!!activeBook}
        showKeyboard={showOnScreenKeyboard}
        onToggleKeyboard={() => setShowOnScreenKeyboard(!showOnScreenKeyboard)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isAmbientOn={isAmbientOn}
        onToggleAmbient={handleToggleAmbient}
      />

      {/* 3. The 3D Scene Layer (Three.js WebGL Engine) */}
      <div className="absolute inset-0 z-0 md:pl-60">
        <Atelier3DScene
          cameraMode={cameraMode}
          currentDraft={currentDraft}
          carriageRatio={metrics.carriageRatio}
          lineRatio={metrics.lineRatio}
          activeKeyChar={activeKey}
          isArchiving={isArchiving}
          archiveProgress={archiveProgress}
          activeBook={activeBook}
          onTypewriterClick={() => setCameraMode('writing')}
          onDiaryClick={() => {
            if (activeBook) {
              setCameraMode('diary');
              setIsDiaryOpen(true);
            }
          }}
        />
      </div>

      {/* 4. Minimalist Elegant Editorial Status Ribbon (Top of Writing Desk) */}
      <div className="absolute top-3 left-16 md:left-64 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-glass shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_8px_24px_rgba(0,0,0,0.6)] text-xs">
          {activeBook ? (
            <>
              <span 
                className="w-2.5 h-2.5 rounded-full border border-white/30 flex-shrink-0 shadow-[0_0_6px_rgba(196,166,106,0.6)]" 
                style={{ backgroundColor: activeBook.coverColor }}
              />
              <span className="font-cinzel text-[#C4A66A] font-semibold truncate max-w-[160px] sm:max-w-xs drop-shadow-sm">
                {activeBook.title}
              </span>
              <span className="text-[#C4A66A]/40">•</span>
              <span className="font-serif-vintage italic text-[#E6D4B0]/90">
                {activeBook.pages.length} {activeBook.pages.length === 1 ? 'leaf' : 'leaves'}
              </span>
            </>
          ) : (
            <button
              onClick={() => setIsCreateBookOpen(true)}
              className="flex items-center gap-1.5 text-[#C4A66A] hover:text-[#F5EBDD] font-cinzel text-xs font-semibold drop-shadow-sm transition-colors"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span>Bind Your First Volume</span>
            </button>
          )}
        </div>

        <div className="pointer-events-auto hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full liquid-glass shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),0_8px_24px_rgba(0,0,0,0.6)] text-[11px] font-serif-vintage text-[#E6D4B0]/90">
          <span>{formatAtelierDate()}</span>
          <span className="text-[#C4A66A]/40">•</span>
          <span className="font-cinzel text-[#C4A66A] font-semibold">{metrics.wordCount} words</span>
        </div>
      </div>

      {/* 5. Central Overlay Writing Workspace */}
      <main className="absolute inset-0 z-10 flex flex-col justify-between pt-16 md:pl-60 pb-3 pointer-events-none">
        {/* Parchment Editor Aligned with 3D Typewriter */}
        <div className="pointer-events-auto flex-1 flex flex-col justify-center items-center overflow-y-auto px-3 sm:px-6">
          <PaperEditor
            draft={currentDraft}
            onDraftChange={handleDraftChange}
            entryTitle={entryTitle}
            onEntryTitleChange={setEntryTitle}
            onPreservePage={handlePreservePage}
            isArchiving={isArchiving}
            onClearDraft={() => {
              if (currentDraft && confirm('Insert fresh blank sheet? Current unsaved draft will be wiped.')) {
                handleDraftChange('');
                setEntryTitle('');
              }
            }}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            bookTitle={activeBook?.title || 'Fresh Manuscript'}
          />
        </div>

        {/* Vintage Brass Keyboard on Lower Edge */}
        {showOnScreenKeyboard && (
          <div className="pointer-events-auto mt-1 px-3">
            <TypewriterKeyboard
              onKeyStrike={handleKeyStrike}
              onBackspace={handleBackspace}
              onReturn={handleReturn}
              activeKey={activeKey}
            />
          </div>
        )}
      </main>

      {/* 6. Preservation Success Toast Notification */}
      {preservationToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:translate-x-12 z-50 px-6 py-3 bg-[#542C2D] border-2 border-[#C4A66A] rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] text-[#F5EBDD] flex items-center gap-3 animate-fade-in">
          <BookmarkCheck className="w-5 h-5 text-[#C4A66A]" />
          <div>
            <p className="font-cinzel text-xs font-bold text-[#C4A66A] uppercase tracking-wider">
              YOUR WORDS ARE PRESERVED
            </p>
            <p className="font-serif-vintage italic text-xs text-[#E6D4B0]">
              “{preservationToast.title}” bound into {activeBook?.title || 'your volume'}
            </p>
          </div>
        </div>
      )}

      {/* 7. Antique Diary Viewer Modal */}
      {isDiaryOpen && activeBook && (
        <DiaryViewer
          book={activeBook}
          onClose={() => {
            setIsDiaryOpen(false);
            setCameraMode('writing');
          }}
          onReturnToTypewriter={() => {
            setIsDiaryOpen(false);
            setCameraMode('writing');
          }}
          onDeletePage={handleDeletePage}
          onUpdatePage={handleUpdatePage}
        />
      )}

      {/* 8. Bookshelf / Library Modal */}
      {isBookshelfOpen && (
        <BookshelfModal
          isOpen={isBookshelfOpen}
          onClose={() => {
            setIsBookshelfOpen(false);
            setCameraMode('writing');
          }}
          books={books}
          activeBookId={activeBookId || ''}
          onSelectBook={(bookId) => {
            setActiveBookId(bookId);
            setCameraMode('writing');
          }}
          onOpenDiary={(bookId) => {
            setActiveBookId(bookId);
            setIsDiaryOpen(true);
            setCameraMode('diary');
          }}
          onOpenCreateModal={() => {
            setIsCreateBookOpen(true);
          }}
          onDeleteBook={handleDeleteBook}
        />
      )}

      {/* 9. Create Book Modal */}
      {isCreateBookOpen && (
        <CreateBookModal
          isOpen={isCreateBookOpen}
          onClose={() => setIsCreateBookOpen(false)}
          onCreateBook={handleCreateBook}
        />
      )}

      {/* 10. Account Sign In / Sign Up Modal */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onUserChange={(user) => {
            setCurrentUser(user);
          }}
        />
      )}
    </div>
  );
}

export default App;
