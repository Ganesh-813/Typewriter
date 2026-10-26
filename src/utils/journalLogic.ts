export type BookType = 
  | 'diary' 
  | 'journal' 
  | 'research' 
  | 'novel' 
  | 'study' 
  | 'travel' 
  | 'letter' 
  | 'custom';

export type CoverMaterial = 
  | 'burgundy-leather' 
  | 'espresso-leather' 
  | 'navy-cloth' 
  | 'dark-walnut' 
  | 'olive-morocco' 
  | 'antique-parchment';

export interface SheetPage {
  id: string;
  bookId: string;
  pageNumber: number;
  title: string;
  date: string;
  content: string;
  lineCount: number;
  wordCount: number;
  archivedAt: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  type: BookType;
  coverMaterial: CoverMaterial;
  coverColor: string;
  accentGold: boolean;
  pages: SheetPage[];
  currentDraft: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const BOOK_TYPE_METADATA: Record<BookType, { label: string; description: string; defaultColor: string }> = {
  diary: {
    label: 'Personal Diary',
    description: 'Private reflections, daily secrets, and intimate moments bound in leather.',
    defaultColor: '#542C2D' // aged burgundy
  },
  journal: {
    label: 'Philosophical Journal',
    description: 'Ongoing observations, meditations, and spontaneous thoughts.',
    defaultColor: '#281B15' // espresso
  },
  research: {
    label: 'Research Report',
    description: 'Scholarly investigations, empirical records, and analytical treatises.',
    defaultColor: '#453025' // dark walnut
  },
  novel: {
    label: 'Book or Manuscript',
    description: 'Literary fiction, dramatic essays, long-form creative narratives.',
    defaultColor: '#171310' // deep charcoal
  },
  study: {
    label: 'Study Notebook',
    description: 'Academic concepts, lecture notes, diagrams, and systematic learning.',
    defaultColor: '#3B3A2C' // muted olive
  },
  travel: {
    label: 'Travel Journal',
    description: 'Expeditions, distant voyages, foreign impressions, and coordinates.',
    defaultColor: '#6B4226' // antique tan
  },
  letter: {
    label: 'Letters & Epistles',
    description: 'Epistolary drafts, historical letters, and heartfelt correspondence.',
    defaultColor: '#4A2A2B' // deep wine
  },
  custom: {
    label: 'Atelier Tome',
    description: 'Bespoke volume tailored with custom ruling and gilded binding.',
    defaultColor: '#281B15'
  }
};

export const MAX_COLS_PER_LINE = 54;
export const MAX_LINES_PER_PAGE = 22;
export const MARGIN_BELL_THRESHOLD = 6; // chars from edge to chime bell

/**
 * Calculates carriage coordinates from text cursor position
 */
export function calculateCarriageMetrics(text: string, maxCols = MAX_COLS_PER_LINE, maxLines = MAX_LINES_PER_PAGE) {
  const lines = text.split('\n');
  const totalRawLines = lines.length;
  
  // Wrapped lines calculation
  const wrappedLines: string[] = [];
  for (const line of lines) {
    if (line.length === 0) {
      wrappedLines.push('');
      continue;
    }
    let remaining = line;
    while (remaining.length > maxCols) {
      // Find clean space wrap if possible
      let breakIndex = remaining.lastIndexOf(' ', maxCols);
      if (breakIndex === -1 || breakIndex < 15) {
        breakIndex = maxCols;
      }
      wrappedLines.push(remaining.slice(0, breakIndex));
      remaining = remaining.slice(breakIndex).trimStart();
    }
    wrappedLines.push(remaining);
  }

  const currentLineIndex = wrappedLines.length - 1;
  const currentLineText = wrappedLines[currentLineIndex] || '';
  const currentCol = currentLineText.length;
  
  // Carriage moves from right to left mechanically (or paper moves right as we type)
  // Horizontal offset ratio: 0 (start of line) to 1.0 (end of line)
  const carriageRatio = Math.min(1.0, currentCol / maxCols);
  
  // Vertical line ratio: 0 (top) to 1.0 (bottom of page)
  const lineRatio = Math.min(1.0, currentLineIndex / maxLines);
  
  const isPageFull = wrappedLines.length >= maxLines && currentCol >= maxCols - 4;
  const shouldRingBell = (maxCols - currentCol) <= MARGIN_BELL_THRESHOLD && (maxCols - currentCol) > 0;

  return {
    wrappedLines,
    lineCount: wrappedLines.length,
    currentLineIndex,
    currentCol,
    carriageRatio,
    lineRatio,
    isPageFull,
    shouldRingBell,
    wordCount: countWords(text),
    charCount: text.length
  };
}

export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Split long drafted text into printable sheets
 */
export function splitDraftIntoPages(
  content: string, 
  maxLines = MAX_LINES_PER_PAGE, 
  maxCols = MAX_COLS_PER_LINE
): string[] {
  const { wrappedLines } = calculateCarriageMetrics(content, maxCols, maxLines);
  const pages: string[] = [];
  
  for (let i = 0; i < wrappedLines.length; i += maxLines) {
    const chunk = wrappedLines.slice(i, i + maxLines).join('\n');
    pages.push(chunk);
  }
  
  return pages.length > 0 ? pages : [''];
}

/**
 * Search books & pages by query string
 */
export function searchLibrary(books: Book[], query: string, typeFilter?: string): Book[] {
  const q = query.trim().toLowerCase();
  return books.filter(book => {
    if (typeFilter && typeFilter !== 'all' && book.type !== typeFilter) {
      return false;
    }
    if (!q) return true;
    
    // Check title, subtitle, tags
    if (book.title.toLowerCase().includes(q)) return true;
    if (book.subtitle?.toLowerCase().includes(q)) return true;
    if (book.tags.some(t => t.toLowerCase().includes(q))) return true;
    if (book.currentDraft.toLowerCase().includes(q)) return true;
    
    // Check inside archived pages
    return book.pages.some(p => 
      p.title.toLowerCase().includes(q) || 
      p.content.toLowerCase().includes(q)
    );
  });
}

/**
 * Formats date into refined editorial classical presentation
 */
export function formatAtelierDate(date: string | Date = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Undated Entry';
  
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Generates initial starter library: returns empty array for fresh start
 */
export function getInitialSeedBooks(): Book[] {
  return [];
}
