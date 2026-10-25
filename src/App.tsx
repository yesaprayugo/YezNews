/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Search,
  Bookmark,
  Tv,
  Sun,
  Moon,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Pause,
  Play,
  Sparkles,
  Clock,
  MapPin,
  Share2,
  Check,
  TrendingUp,
  TrendingDown,
  Signal,
  Bell,
  BellRing,
} from 'lucide-react';
import {
  TV_CHANNELS,
  NEWS_ARTICLES,
  type TVChannel,
  type NewsArticle,
} from './data/omniNewsData';
import { LiveBroadcastPlayer } from './components/LiveBroadcastPlayer';
import { TiltCard3D } from './components/TiltCard3D';
import { BreakingNewsPushManager } from './components/BreakingNewsPushManager';
import { ArticleLocationWeatherWidget } from './components/ArticleLocationWeatherWidget';
import { LiveMarketTickerBar } from './components/LiveMarketTickerBar';

type FilterTab =
  | 'Semua'
  | 'Nasional (Indonesia)'
  | 'Internasional (Global)'
  | 'Politik'
  | 'Ekonomi'
  | 'Teknologi'
  | 'Koleksi Berita';

type TVRegionFilter = 'ALL' | 'Nasional (Indonesia)' | 'Internasional (Global)';

const BOOKMARKS_STORAGE_KEY = 'yeznews_bookmarks_v2';
const THEME_STORAGE_KEY = 'yeznews_theme_v2';

export default function App() {
  // Default to Light Editorial Broadcast Theme so the rich navy/crimson/blue color palette shines immediately
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved ? saved === 'dark' : false;
    } catch {
      return false;
    }
  });

  // Live TV Hub state
  const [activeChannelId, setActiveChannelId] = useState<string>(TV_CHANNELS[0].id);
  const [tvRegionFilter, setTvRegionFilter] = useState<TVRegionFilter>('ALL');

  // Breaking News Ticker controls (slow & readable + manual step)
  const [tickerPaused, setTickerPaused] = useState<boolean>(false);
  const [focusedTickerIndex, setFocusedTickerIndex] = useState<number>(0);
  const [tickerSingleMode, setTickerSingleMode] = useState<boolean>(true);

  // News Dashboard state
  const [activeTab, setActiveTab] = useState<FilterTab>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage error
    }
    return ['art_20261025_001', 'art_20261025_002'];
  });

  // In-App Full Article Reader Modal state
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);
  const [readerLargeFont, setReaderLargeFont] = useState<boolean>(false);
  const [isSpeakingArticle, setIsSpeakingArticle] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Breaking News Push Notification Center state
  const [isPushModalOpen, setIsPushModalOpen] = useState<boolean>(false);
  const [pushUnreadCount, setPushUnreadCount] = useState<number>(2);
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage error
    }
  }, [darkMode]);

  // Persist bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      // ignore storage error
    }
  }, [bookmarks]);

  // Gentle auto-advance for single-headline ticker mode (every 7 seconds)
  useEffect(() => {
    if (tickerPaused || !tickerSingleMode) return;
    const timer = setInterval(() => {
      setFocusedTickerIndex((prev) => (prev + 1) % NEWS_ARTICLES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [tickerPaused, tickerSingleMode]);

  // Stop speech synthesis when closing article reader
  useEffect(() => {
    if (!readingArticle && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingArticle(false);
    }
  }, [readingArticle]);

  const filteredChannels = useMemo(() => {
    if (tvRegionFilter === 'ALL') return TV_CHANNELS;
    return TV_CHANNELS.filter((ch) => ch.region === tvRegionFilter);
  }, [tvRegionFilter]);

  const activeChannel: TVChannel = useMemo(() => {
    return (
      TV_CHANNELS.find((ch) => ch.id === activeChannelId) ||
      filteredChannels[0] ||
      TV_CHANNELS[0]
    );
  }, [activeChannelId, filteredChannels]);

  // When user clicks "Semua Saluran", "Indonesia", or "Internasional",
  // filter the list AND immediately switch to the first channel in that region if needed!
  const handleSelectTvRegion = (region: TVRegionFilter) => {
    setTvRegionFilter(region);
    if (region === 'ALL') {
      return;
    }
    const matching = TV_CHANNELS.filter((ch) => ch.region === region);
    if (matching.length > 0) {
      const isCurrentInRegion = matching.some((ch) => ch.id === activeChannelId);
      if (!isCurrentInRegion) {
        setActiveChannelId(matching[0].id);
      }
    }
  };

  const handlePrevChannel = () => {
    const list = filteredChannels.length > 0 ? filteredChannels : TV_CHANNELS;
    const idx = list.findIndex((c) => c.id === activeChannel.id);
    const prevIdx = (idx - 1 + list.length) % list.length;
    setActiveChannelId(list[prevIdx].id);
  };

  const handleNextChannel = () => {
    const list = filteredChannels.length > 0 ? filteredChannels : TV_CHANNELS;
    const idx = list.findIndex((c) => c.id === activeChannel.id);
    const nextIdx = (idx + 1) % list.length;
    setActiveChannelId(list[nextIdx].id);
  };

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return NEWS_ARTICLES.filter((article) => {
      if (activeTab === 'Koleksi Berita') {
        if (!bookmarks.includes(article.id)) return false;
      } else if (
        activeTab === 'Nasional (Indonesia)' ||
        activeTab === 'Internasional (Global)'
      ) {
        if (article.region !== activeTab) return false;
      } else if (
        activeTab === 'Politik' ||
        activeTab === 'Ekonomi' ||
        activeTab === 'Teknologi'
      ) {
        if (article.category !== activeTab) return false;
      }

      if (q.length > 0) {
        const searchableText = [
          article.title,
          article.summary,
          article.source_name,
          article.category,
          article.region,
          article.location,
          ...article.full_content,
          ...article.ai_takeaways,
        ]
          .join(' ')
          .toLowerCase();
        return searchableText.includes(q);
      }

      return true;
    });
  }, [activeTab, searchQuery, bookmarks]);

  const leadArticle = useMemo(() => {
    if (activeTab === 'Semua' && searchQuery.trim() === '' && filteredArticles.length > 0) {
      return filteredArticles[0];
    }
    return null;
  }, [activeTab, searchQuery, filteredArticles]);

  const gridArticles = useMemo(() => {
    if (leadArticle) {
      return filteredArticles.slice(1);
    }
    return filteredArticles;
  }, [leadArticle, filteredArticles]);

  const toggleBookmark = (articleId: string) => {
    setBookmarks((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleJumpToSection = (tab: FilterTab) => {
    setActiveTab(tab);
    const el = document.getElementById('news-feed');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleArticleSpeech = (article: NewsArticle) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakingArticle) {
      window.speechSynthesis.cancel();
      setIsSpeakingArticle(false);
    } else {
      window.speechSynthesis.cancel();
      const fullText = `${article.title}. ${article.full_content.join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeakingArticle(false);
      utterance.onerror = () => setIsSpeakingArticle(false);
      setIsSpeakingArticle(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShareArticle = (article: NewsArticle) => {
    const shareText = `${article.title} — Baca selengkapnya di YezNews`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  const handleNavigateReaderArticle = (direction: 'prev' | 'next') => {
    if (!readingArticle) return;
    const currentIndex = NEWS_ARTICLES.findIndex((a) => a.id === readingArticle.id);
    if (currentIndex === -1) return;
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % NEWS_ARTICLES.length
        : (currentIndex - 1 + NEWS_ARTICLES.length) % NEWS_ARTICLES.length;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingArticle(false);
    }
    setReadingArticle(NEWS_ARTICLES[nextIndex]);
  };

  const filterTabs: FilterTab[] = [
    'Semua',
    'Nasional (Indonesia)',
    'Internasional (Global)',
    'Politik',
    'Ekonomi',
    'Teknologi',
    'Koleksi Berita',
  ];

  const getCategoryColorClass = (category: NewsArticle['category']) => {
    switch (category) {
      case 'Ekonomi':
        return 'text-emerald-700 dark:text-emerald-400';
      case 'Teknologi':
        return 'text-blue-700 dark:text-sky-400';
      case 'Politik':
        return 'text-rose-700 dark:text-rose-400';
      default:
        return 'text-rose-700 dark:text-rose-400';
    }
  };

  const currentTickerArticle = NEWS_ARTICLES[focusedTickerIndex] || NEWS_ARTICLES[0];

  const countAllChannels = TV_CHANNELS.length;
  const countIdChannels = TV_CHANNELS.filter(
    (c) => c.region === 'Nasional (Indonesia)'
  ).length;
  const countIntChannels = TV_CHANNELS.filter(
    (c) => c.region === 'Internasional (Global)'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] text-slate-900 dark:bg-[#060d1a] dark:text-slate-100 transition-colors duration-200">
      {/* Top Broadcast Masthead (Strict 3-Zone Contract in Authoritative Royal Navy & Crimson) */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0a1628] via-[#112240] to-[#0a1628] text-white border-b-2 border-rose-600 shadow-md">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-editorial text-2xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
          >
            YezNews
          </a>

          {/* Zone 2: 4 concise single-line navigation links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-200"
          >
            <a
              href="#live-tv"
              className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
            >
              Siaran TV Live
            </a>
            <button
              type="button"
              onClick={() => handleJumpToSection('Nasional (Indonesia)')}
              className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Berita Nasional
            </button>
            <button
              type="button"
              onClick={() => handleJumpToSection('Internasional (Global)')}
              className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Berita Internasional
            </button>
            <button
              type="button"
              onClick={() => handleJumpToSection('Koleksi Berita')}
              className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Koleksi Tersimpan (<span className="font-mono-tabular text-amber-300">{bookmarks.length}</span>)
            </button>
          </nav>

          {/* Zone 3: Push Breaking News Trigger & Theme Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPushModalOpen(true)}
              aria-label="Pengaturan Notifikasi Push Breaking News"
              className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                isPushEnabled
                  ? 'bg-emerald-600/25 hover:bg-emerald-600/35 border-emerald-400/50 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 border-rose-400/60 text-white shadow-sm'
              }`}
            >
              {isPushEnabled ? (
                <BellRing className="w-4 h-4 text-emerald-300" />
              ) : (
                <Bell className="w-4 h-4 text-white" />
              )}
              <span className="hidden sm:inline">
                {isPushEnabled ? 'Push Aktif' : 'Push Breaking News'}
              </span>
              {pushUnreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-black/30 text-amber-300 font-mono-tabular">
                  {pushUnreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label={darkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-300" />
                  <span className="hidden sm:inline">Mode Gelap</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Kilas Terkini (Breaking News Ribbon) + Market Indicators */}
      <div
        aria-label="Kilas Berita Terkini"
        className="bg-white dark:bg-[#0c1629] border-b border-slate-200 dark:border-slate-800 shadow-xs"
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-11 gap-3">
          <div className="flex items-center gap-2 shrink-0 px-2.5 py-1 rounded bg-rose-600 text-white">
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold tracking-wider uppercase whitespace-nowrap">
              KILAS TERKINI
            </span>
          </div>

          {/* Readable Headline Area */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {tickerSingleMode ? (
              <AnimatePresence mode="wait">
                <motion.button
                  key={currentTickerArticle.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  type="button"
                  onClick={() => setReadingArticle(currentTickerArticle)}
                  className="w-full text-left flex items-center gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 hover:text-rose-600 dark:hover:text-rose-400 transition-colors truncate cursor-pointer"
                >
                  <span className="font-mono-tabular text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                    {focusedTickerIndex + 1}/{NEWS_ARTICLES.length}
                  </span>
                  <span className="font-bold text-blue-800 dark:text-sky-400 shrink-0">
                    {currentTickerArticle.location}
                  </span>
                  <span aria-hidden="true" className="text-slate-400">
                    ·
                  </span>
                  <span className="truncate font-semibold">{currentTickerArticle.title}</span>
                  <span aria-hidden="true" className="text-slate-400 hidden sm:inline">
                    ·
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular shrink-0 hidden sm:inline">
                    {currentTickerArticle.relative_time}
                  </span>
                </motion.button>
              </AnimatePresence>
            ) : (
              <div
                className={`animate-ticker ${
                  tickerPaused ? 'paused' : ''
                } items-center gap-10 text-xs text-slate-700 dark:text-slate-200`}
              >
                {[...NEWS_ARTICLES, ...NEWS_ARTICLES].map((item, idx) => (
                  <button
                    key={`${item.id}-${idx}`}
                    type="button"
                    onClick={() => setReadingArticle(item)}
                    className="inline-flex items-center gap-2 hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap cursor-pointer text-left"
                  >
                    <span className="font-bold text-blue-800 dark:text-sky-400">
                      {item.location}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium">{item.title}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono-tabular">
                      {item.relative_time}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ticker Navigation Controls */}
          <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-slate-200 dark:border-slate-800">
            {tickerSingleMode && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setFocusedTickerIndex(
                      (prev) => (prev - 1 + NEWS_ARTICLES.length) % NEWS_ARTICLES.length
                    )
                  }
                  aria-label="Berita sebelumnya"
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFocusedTickerIndex((prev) => (prev + 1) % NEWS_ARTICLES.length)
                  }
                  aria-label="Berita berikutnya"
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setTickerPaused((prev) => !prev)}
              aria-label={tickerPaused ? 'Lanjutkan kilas terkini' : 'Jeda kilas terkini'}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {tickerPaused ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setTickerSingleMode((prev) => !prev)}
              className="hidden sm:inline-flex px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              {tickerSingleMode ? 'Mode Geser' : 'Mode Fokus'}
            </button>
          </div>
        </div>

        {/* Real-Time Auto-Updating Market & Foreign Exchange Strip */}
        <LiveMarketTickerBar />
      </div>

      {/* Main YezNews Content */}
      <main
        id="top"
        className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-14"
      >
        {/* SECTION 1: INTERACTIVE LIVE TV HUB (REAL HLS STREAMING) */}
        <section id="live-tv" className="space-y-5">
          {/* Broadcast Section Banner with Symmetrical Category Card */}
          <div className="rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#0f172a] p-6 sm:p-7 text-white shadow-lg border border-blue-800/40 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-sky-300 font-semibold">
                <Signal className="w-4 h-4 text-rose-400 shrink-0" />
                <span>STREAMING TELEVISI LANGSUNG (REAL-TIME HLS)</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{countAllChannels} Saluran Berita 24 Jam</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Pusat Siaran Langsung Televisi Nasional & Dunia
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                Pilih kategori wilayah atau klik saluran TV di bawah untuk langsung menyaksikan tayangan televisi berita secara langsung tanpa keluar dari halaman.
              </p>
            </div>

            {/* Symmetrical 3-Column Region Category Card */}
            <div
              role="group"
              aria-label="Pilih Wilayah Saluran TV"
              className="w-full xl:w-[480px] shrink-0 grid grid-cols-3 gap-2 p-2 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/15 shadow-inner"
            >
              {(
                [
                  { id: 'ALL', label: 'Semua Saluran', count: countAllChannels },
                  { id: 'Nasional (Indonesia)', label: 'Indonesia', count: countIdChannels },
                  { id: 'Internasional (Global)', label: 'Internasional', count: countIntChannels },
                ] as const
              ).map((tab) => {
                const isActive = tvRegionFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTvRegion(tab.id)}
                    className={`h-11 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      isActive
                        ? 'bg-rose-600 text-white border-rose-400/60 shadow-md'
                        : 'bg-white/5 text-slate-200 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/15'
                    }`}
                  >
                    <span className="truncate">{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] rounded-md font-mono-tabular shrink-0 ${
                        isActive
                          ? 'bg-black/25 text-white'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symmetrical 5-Column Channel Selector Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {filteredChannels.map((ch) => {
              const isSelected = ch.id === activeChannel.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`h-12 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-700 dark:bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-500/30'
                      : 'bg-white dark:bg-[#0f1b2d] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Tv
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-amber-300' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    />
                    <span className="truncate">{ch.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono-tabular shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {ch.countryCode}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Primary 16:9 Real HLS Live Broadcast Video Player */}
            <div className="lg:col-span-8 flex flex-col justify-between border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0f1b2d] shadow-md">
              <LiveBroadcastPlayer
                channel={activeChannel}
                onPrevChannel={handlePrevChannel}
                onNextChannel={handleNextChannel}
              />

              <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      SEDANG TAYANG LIVE
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-blue-700 dark:text-sky-400">
                      {activeChannel.region}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeChannel.network}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeChannel.language}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {activeChannel.name} — {activeChannel.currentProgram}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeChannel.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Channel Directory with Real Documentary Thumbnails */}
            <div className="lg:col-span-4 flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0f1b2d] overflow-hidden shadow-md">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1626] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Daftar Saluran ({tvRegionFilter === 'ALL' ? 'Semua' : tvRegionFilter === 'Nasional (Indonesia)' ? 'Indonesia' : 'Internasional'})
                  </h2>
                </div>
                <span className="text-xs font-semibold text-blue-700 dark:text-sky-400 font-mono-tabular">
                  {filteredChannels.length} aktif
                </span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800 overflow-y-auto max-h-[500px] flex-1">
                {filteredChannels.map((channel, index) => {
                  const isSelected = channel.id === activeChannel.id;
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setActiveChannelId(channel.id)}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500 ${
                        isSelected
                          ? 'bg-blue-50/90 dark:bg-blue-950/50'
                          : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="w-28 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-300 dark:border-slate-700 relative">
                        <img
                          src={channel.thumbnailUrl}
                          alt={channel.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div
                          style={{ backgroundColor: channel.badgeColor }}
                          className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                        >
                          {channel.shortName}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono-tabular font-semibold">
                              0{index + 1}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`font-bold ${
                                isSelected
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-emerald-700 dark:text-emerald-400'
                              }`}
                            >
                              LIVE
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold">{channel.countryCode}</span>
                          </div>

                          <span
                            className={`text-[11px] font-bold whitespace-nowrap shrink-0 ${
                              isSelected
                                ? 'text-blue-700 dark:text-sky-400'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {isSelected ? 'Sedang Diputar' : 'Putar Live'}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {channel.name}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {channel.currentProgram}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1626] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Klik saluran untuk langsung memutar siaran TV</span>
                <span className="font-mono-tabular font-semibold text-emerald-700 dark:text-emerald-400">
                  HLS 1080p
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: REAL-TIME NEWS DASHBOARD WITH REAL DOCUMENTARY PHOTOGRAPHY */}
        <section id="news-feed" className="space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b-2 border-slate-200 dark:border-slate-800 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                <span>REDAKSI UTAMA YEZNEWS</span>
                <span aria-hidden="true">·</span>
                <span className="text-blue-700 dark:text-sky-400">
                  FOTO DOKUMENTASI ASLI & LAPORAN LENGKAP
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Berita Terkini Nasional & Internasional
              </h2>
            </div>

            {/* Live Search Bar */}
            <div className="flex items-center gap-2 w-full lg:w-96">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berita, topik, kota, atau tokoh..."
                  aria-label="Cari berita"
                  className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f1b2d] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus pencarian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Breaking News Push Subscription & Alert Manager */}
          <BreakingNewsPushManager
            articles={NEWS_ARTICLES}
            onOpenArticle={(article) => setReadingArticle(article)}
            isModalOpen={isPushModalOpen}
            setIsModalOpen={setIsPushModalOpen}
            onUnreadCountChange={setPushUnreadCount}
            onEnabledChange={setIsPushEnabled}
          />

          {/* Interactive Category & Region Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Filter Kategori Berita"
              className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 dark:bg-[#0c1626] rounded-xl border border-slate-300/80 dark:border-slate-800 overflow-x-auto max-w-full"
            >
              {filterTabs.map((tab) => {
                const isActive = activeTab === tab;
                const isBookmarkTab = tab === 'Koleksi Berita';
                return (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isBookmarkTab && (
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          isActive ? 'text-amber-300' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      />
                    )}
                    <span>{tab}</span>
                    {isBookmarkTab && (
                      <span className="font-mono-tabular text-[11px] opacity-90">
                        ({bookmarks.length})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-mono-tabular font-semibold">
                Menampilkan {filteredArticles.length} dari {NEWS_ARTICLES.length} laporan
              </span>
              {(activeTab !== 'Semua' || searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('Semua');
                    setSearchQuery('');
                  }}
                  className="text-rose-600 dark:text-rose-400 font-semibold hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {filteredArticles.length === 0 ? (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0f1b2d] p-12 text-center space-y-4 shadow-xs">
              <p className="font-editorial text-xl font-bold text-slate-900 dark:text-white">
                {activeTab === 'Koleksi Berita'
                  ? 'Belum ada artikel dalam Koleksi Berita Anda'
                  : 'Tidak ditemukan laporan berita yang sesuai'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {activeTab === 'Koleksi Berita'
                  ? 'Klik tombol "Simpan" pada artikel mana pun untuk menyimpannya agar mudah dibaca kembali.'
                  : `Tidak ada hasil untuk kata kunci "${searchQuery}" pada kategori ${activeTab}.`}
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('Semua');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Tampilkan Semua Berita
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Contextual Real-Time Weather Widget for Active/Lead Article Location */}
              {leadArticle && (
                <ArticleLocationWeatherWidget
                  articleLocation={(readingArticle || leadArticle).location}
                  articleTitle={(readingArticle || leadArticle).title}
                />
              )}

              {/* Featured Lead Story Hero Card (With Real Documentary Photo) */}
              {leadArticle && (
                <TiltCard3D intensity={3}>
                  <article className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0f1b2d] overflow-hidden shadow-md">
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                      <div
                        onClick={() => setReadingArticle(leadArticle)}
                        className="lg:col-span-7 relative aspect-video lg:aspect-auto bg-slate-900 overflow-hidden cursor-pointer group border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800"
                      >
                        <img
                          src={leadArticle.image_url}
                          alt={leadArticle.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                          <span className="text-xs font-medium text-white/95">
                            {leadArticle.image_caption}
                          </span>
                        </div>
                      </div>

                      <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          {/* Clean Unboxed Metadata with Strong Color Hierarchy */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              LAPORAN UTAMA
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-bold text-blue-800 dark:text-sky-400">
                              {leadArticle.location}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className={`font-bold ${getCategoryColorClass(leadArticle.category)}`}>
                              {leadArticle.category}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">{leadArticle.relative_time}</span>
                          </div>

                          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-snug">
                            <button
                              type="button"
                              onClick={() => setReadingArticle(leadArticle)}
                              className="text-left hover:text-blue-700 dark:hover:text-sky-400 transition-colors cursor-pointer"
                            >
                              {leadArticle.title}
                            </button>
                          </h3>

                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                            {leadArticle.summary}
                          </p>

                          {/* Key Stats Strip */}
                          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                            {leadArticle.key_stats.map((stat, i) => (
                              <div key={i} className="space-y-0.5">
                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                  {stat.label}
                                </p>
                                <p className="text-sm font-bold text-blue-900 dark:text-sky-300 font-mono-tabular">
                                  {stat.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(leadArticle.id)}
                            className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
                              bookmarks.includes(leadArticle.id)
                                ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                bookmarks.includes(leadArticle.id) ? 'fill-current' : ''
                              }`}
                            />
                            <span>
                              {bookmarks.includes(leadArticle.id) ? 'Tersimpan' : 'Simpan'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setReadingArticle(leadArticle)}
                            className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-2 cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Baca Berita Lengkap</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </TiltCard3D>
              )}

              {/* Documentary News Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((article, index) => {
                  const isBookmarked = bookmarks.includes(article.id);
                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                    >
                      <TiltCard3D className="h-full" intensity={4}>
                        <article className="h-full border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0f1b2d] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition-shadow duration-200">
                          <div>
                            {/* Real Documentary Press Photo */}
                            <div
                              onClick={() => setReadingArticle(article)}
                              className="aspect-video w-full bg-slate-900 overflow-hidden border-b border-slate-200 dark:border-slate-800 relative group cursor-pointer"
                            >
                              <img
                                src={article.image_url}
                                alt={article.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-4">
                                <span className="text-xs font-bold text-white inline-flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Baca laporan lengkap di sini</span>
                                </span>
                              </div>
                            </div>

                            <div className="p-5 sm:p-6 space-y-3.5">
                              {/* Zero-Pill Metadata with Clear Category Color */}
                              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-bold text-blue-800 dark:text-sky-400">
                                  {article.location}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className={`font-bold ${getCategoryColorClass(article.category)}`}>
                                  {article.category}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>
                                  {article.region === 'Nasional (Indonesia)'
                                    ? 'Nasional'
                                    : 'Internasional'}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono-tabular">{article.relative_time}</span>
                              </div>

                              {/* Headline */}
                              <h3 className="font-editorial text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                                <button
                                  type="button"
                                  onClick={() => setReadingArticle(article)}
                                  className="text-left hover:text-blue-700 dark:hover:text-sky-400 transition-colors cursor-pointer"
                                >
                                  {article.title}
                                </button>
                              </h3>

                              {/* Concise 2-Sentence Summary */}
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {article.summary}
                              </p>

                              {/* Key Stat Preview Strip */}
                              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2">
                                {article.key_stats.map((st, idx) => (
                                  <div key={idx} className="min-w-0">
                                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                                      {st.label}
                                    </p>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono-tabular truncate">
                                      {st.value}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0c1626] flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => toggleBookmark(article.id)}
                              aria-pressed={isBookmarked}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer ${
                                isBookmarked
                                  ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                                  : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`}
                              />
                              <span>{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setReadingArticle(article)}
                              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-700 text-white hover:bg-rose-600 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Baca Selengkapnya</span>
                            </button>
                          </div>
                        </article>
                      </TiltCard3D>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Authoritative Royal Navy Footer */}
      <footer className="bg-[#0a1628] text-slate-300 border-t-2 border-rose-600 py-8 mt-14">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-editorial text-base font-bold text-white">
              YezNews
            </span>
            <span aria-hidden="true">·</span>
            <span>Portal Berita Terpercaya & Siaran Langsung Televisi Nasional-Internasional</span>
          </div>
          <p className="text-slate-400">
            © {new Date().getFullYear()} YezNews Network. Hak cipta dilindungi.
          </p>
        </div>
      </footer>

      {/* FULL IN-APP ARTICLE READER MODAL */}
      <AnimatePresence>
        {readingArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-article-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setReadingArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22 }}
              className="bg-white dark:bg-[#0f1b2d] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Reader Sticky Top Toolbar */}
              <div className="px-5 sm:px-7 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-[#0a1628] text-white">
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <span className="font-bold text-amber-300">YEZNEWS</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate font-semibold">{readingArticle.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-mono-tabular text-slate-300">
                    <Clock className="w-3 h-3" />
                    {readingArticle.read_time}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleArticleSpeech(readingArticle)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                      isSpeakingArticle
                        ? 'bg-rose-600 text-white'
                        : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                  >
                    {isSpeakingArticle ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Hentikan Suara</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Dengarkan Berita</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setReaderLargeFont((prev) => !prev)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-mono font-bold text-white transition-colors cursor-pointer"
                    title="Ubah ukuran huruf bacaan"
                  >
                    {readerLargeFont ? 'A+' : 'A'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setReadingArticle(null)}
                    aria-label="Tutup artikel"
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Full Article Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 font-bold text-blue-800 dark:text-sky-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      {readingArticle.location}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{readingArticle.region}</span>
                    <span aria-hidden="true">·</span>
                    <span>Oleh {readingArticle.author}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{readingArticle.relative_time}</span>
                  </div>

                  <h1
                    id="reader-article-title"
                    className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight"
                  >
                    {readingArticle.title}
                  </h1>
                </div>

                {/* Real Documentary Photograph */}
                <figure className="space-y-2">
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <img
                      src={readingArticle.image_url}
                      alt={readingArticle.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <figcaption className="text-xs italic text-slate-500 dark:text-slate-400">
                    {readingArticle.image_caption} (Sumber: {readingArticle.source_name})
                  </figcaption>
                </figure>

                {/* Real-Time Weather Widget Relevant to the Location of the Article Being Read */}
                <ArticleLocationWeatherWidget
                  articleLocation={readingArticle.location}
                  articleTitle={readingArticle.title}
                  compact
                />

                {/* Key Quantitative Metrics Strip */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-100 dark:bg-[#091221] border border-slate-200 dark:border-slate-800">
                  {readingArticle.key_stats.map((stat, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </p>
                      <p className="text-base sm:text-lg font-bold text-blue-900 dark:text-sky-300 font-mono-tabular">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 3 Poin Intisari */}
                <div className="p-5 rounded-xl bg-blue-50/70 dark:bg-[#091221] border border-blue-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-800 dark:text-sky-400">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>Intisari 3 Poin Utama</span>
                  </div>
                  <ol className="space-y-2 text-sm text-slate-800 dark:text-slate-200">
                    {readingArticle.ai_takeaways.map((point, index) => (
                      <li key={index} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="font-mono-tabular text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                          0{index + 1}.
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Full Multi-Paragraph Journalistic Story */}
                <div
                  className={`space-y-4 text-slate-800 dark:text-slate-200 leading-relaxed max-w-prose ${
                    readerLargeFont ? 'text-lg' : 'text-base'
                  }`}
                >
                  {readingArticle.full_content.map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      className={
                        pIdx === 0
                          ? 'first-letter:text-4xl first-letter:font-editorial first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-blue-800 dark:first-letter:text-sky-400'
                          : ''
                      }
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Editorial Pull Quote */}
                <blockquote className="py-5 px-6 my-6 border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#091221] space-y-2">
                  <p className="font-editorial italic text-lg sm:text-xl text-slate-900 dark:text-white leading-relaxed">
                    "{readingArticle.quote.text}"
                  </p>
                  <footer className="text-xs text-slate-500 dark:text-slate-400">
                    — <strong className="text-slate-800 dark:text-slate-200">{readingArticle.quote.speaker}</strong>, {readingArticle.quote.role}
                  </footer>
                </blockquote>
              </div>

              {/* Reader Bottom Action Bar */}
              <div className="px-5 sm:px-7 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1626] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(readingArticle.id)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                      bookmarks.includes(readingArticle.id)
                        ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        bookmarks.includes(readingArticle.id) ? 'fill-current' : ''
                      }`}
                    />
                    <span>
                      {bookmarks.includes(readingArticle.id)
                        ? 'Tersimpan di Koleksi'
                        : 'Simpan Berita'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareArticle(readingArticle)}
                    className="px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedShareLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Bagikan</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleNavigateReaderArticle('prev')}
                    className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateReaderArticle('next')}
                    className="px-3.5 py-2 text-xs font-bold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Berita Berikutnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
