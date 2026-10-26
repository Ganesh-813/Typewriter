import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCarriageMetrics,
  countWords,
  splitDraftIntoPages,
  searchLibrary,
  formatAtelierDate,
  getInitialSeedBooks,
  MAX_COLS_PER_LINE,
  MAX_LINES_PER_PAGE
} from './journalLogic';

test('countWords accurately tallies space-separated words', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   '), 0);
  assert.equal(countWords('The antique typewriter resonates.'), 4);
  assert.equal(countWords('Multiple   spaces\nand newlines\tpreserved.'), 5);
});

test('calculateCarriageMetrics computes column and line ratios correctly', () => {
  const shortText = 'Hello World';
  const metrics = calculateCarriageMetrics(shortText, 50, 20);
  assert.equal(metrics.currentCol, 11);
  assert.equal(metrics.lineCount, 1);
  assert.equal(metrics.carriageRatio, 11 / 50);
  assert.equal(metrics.isPageFull, false);
});

test('calculateCarriageMetrics wraps long lines and calculates bell warning near edge', () => {
  const longLine = 'A'.repeat(46); // 50 - 46 = 4 chars from margin (within threshold 6)
  const metrics = calculateCarriageMetrics(longLine, 50, 20);
  assert.equal(metrics.shouldRingBell, true);
  assert.equal(metrics.isPageFull, false);
});

test('splitDraftIntoPages divides long texts according to page limits', () => {
  const lines = Array.from({ length: 45 }, (_, i) => `Line number ${i + 1}`).join('\n');
  const pages = splitDraftIntoPages(lines, 20, 50);
  // 45 lines with max 20 lines per page should create 3 pages
  assert.equal(pages.length, 3);
  assert.ok(pages[0].includes('Line number 1'));
  assert.ok(pages[2].includes('Line number 45'));
});

test('searchLibrary matches titles, subtitles, tags, and page contents', () => {
  const books: any[] = [
    {
      id: 'book-diary-1',
      title: 'The Book of Memories',
      subtitle: 'Chronicles',
      type: 'diary',
      currentDraft: '',
      tags: ['Memories'],
      pages: [{ id: 'p1', title: 'I', content: 'aged parchment', date: 'Oct 24' }]
    },
    {
      id: 'book-manuscript-2',
      title: 'The Cartography of Lost Stars',
      subtitle: 'Navigation',
      type: 'novel',
      currentDraft: '',
      tags: ['Fiction'],
      pages: []
    },
    {
      id: 'book-research-3',
      title: 'Treatise on Mechanical Inventions',
      subtitle: 'Linkages',
      type: 'research',
      currentDraft: '',
      tags: ['Science'],
      pages: []
    }
  ];
  
  // Search by book title
  const starBooks = searchLibrary(books, 'Stars');
  assert.equal(starBooks.length, 1);
  assert.equal(starBooks[0].id, 'book-manuscript-2');

  // Search by archived content
  const parchmentSearch = searchLibrary(books, 'parchment');
  assert.equal(parchmentSearch.length, 1);
  assert.equal(parchmentSearch[0].id, 'book-diary-1');

  // Filter by book type
  const researchFilter = searchLibrary(books, '', 'research');
  assert.equal(researchFilter.length, 1);
  assert.equal(researchFilter[0].type, 'research');
});

test('formatAtelierDate produces valid readable dates', () => {
  const formatted = formatAtelierDate(new Date('1926-10-24T12:00:00Z'));
  assert.ok(formatted.includes('1926'));
  assert.ok(formatted.includes('October'));
});
