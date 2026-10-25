import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  BellOff,
  Check,
  X,
  Volume2,
  VolumeX,
  Zap,
  ShieldAlert,
  Globe,
  TrendingUp,
  Cpu,
  Landmark,
  BookOpen,
  Clock,
  Radio,
  Settings2,
  Trash2,
} from 'lucide-react';
import type { NewsArticle } from '../data/omniNewsData';

export interface PushPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  autoLiveStream: boolean;
  priorityOnly: boolean;
  topics: {
    darurat: boolean;
    politik: boolean;
    global: boolean;
    ekonomi: boolean;
    teknologi: boolean;
  };
}

export interface PushAlertItem {
  id: string;
  articleId: string;
  title: string;
  summary: string;
  location: string;
  category: NewsArticle['category'];
  region: NewsArticle['region'];
  urgency: 'KRUSIAL' | 'DARURAT' | 'BREAKING';
  receivedAt: string;
  imageUrl: string;
  read: boolean;
}

const PUSH_PREFS_STORAGE_KEY = 'yeznews_push_prefs_v1';
const PUSH_INBOX_STORAGE_KEY = 'yeznews_push_inbox_v1';

const DEFAULT_PREFS: PushPreferences = {
  enabled: false,
  soundEnabled: true,
  autoLiveStream: true,
  priorityOnly: false,
  topics: {
    darurat: true,
    politik: true,
    global: true,
    ekonomi: true,
    teknologi: true,
  },
};

// Synthesize an authentic broadcast newsroom chime using Web Audio API
function playBreakingChime() {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, startOffset: number, duration: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration);
    };

    // Classic 3-note broadcast alert signature (E5 -> B5 -> E6)
    playTone(659.25, 0, 0.16, 0.14);
    playTone(987.77, 0.13, 0.16, 0.14);
    playTone(1318.51, 0.26, 0.35, 0.18);
  } catch {
    // Ignore audio context restrictions if user hasn't interacted yet
  }
}

interface BreakingNewsPushManagerProps {
  articles: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onUnreadCountChange?: (count: number) => void;
  onEnabledChange?: (enabled: boolean) => void;
}

export const BreakingNewsPushManager: React.FC<BreakingNewsPushManagerProps> = ({
  articles,
  onOpenArticle,
  isModalOpen,
  setIsModalOpen,
  onUnreadCountChange,
  onEnabledChange,
}) => {
  const [prefs, setPrefs] = useState<PushPreferences>(() => {
    try {
      const saved = localStorage.getItem(PUSH_PREFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PREFS,
          ...parsed,
          topics: { ...DEFAULT_PREFS.topics, ...(parsed.topics || {}) },
        };
      }
    } catch {
      // ignore storage error
    }
    return DEFAULT_PREFS;
  });

  const [inbox, setInbox] = useState<PushAlertItem[]>(() => {
    try {
      const saved = localStorage.getItem(PUSH_INBOX_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    // Seed with 2 initial crucial breaking alerts
    return articles.slice(0, 2).map((art, index) => ({
      id: `push_seed_${art.id}`,
      articleId: art.id,
      title: art.title,
      summary: art.summary,
      location: art.location,
      category: art.category,
      region: art.region,
      urgency: index === 0 ? 'KRUSIAL' : 'BREAKING',
      receivedAt: index === 0 ? 'Baru saja' : '12 menit lalu',
      imageUrl: art.image_url,
      read: false,
    }));
  });

  const [activeToast, setActiveToast] = useState<PushAlertItem | null>(null);
  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const nextArticleCursorRef = useRef<number>(2);

  // Sync preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PUSH_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    onEnabledChange?.(prefs.enabled);
  }, [prefs, onEnabledChange]);

  // Sync inbox to localStorage & notify parent of unread count
  useEffect(() => {
    try {
      localStorage.setItem(PUSH_INBOX_STORAGE_KEY, JSON.stringify(inbox));
    } catch {
      // ignore
    }
    const unread = inbox.filter((item) => !item.read).length;
    onUnreadCountChange?.(unread);
  }, [inbox, onUnreadCountChange]);

  const requestNativePermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserPermission('unsupported');
      return 'unsupported';
    }
    try {
      const result = await Notification.requestPermission();
      setBrowserPermission(result);
      return result;
    } catch {
      return Notification.permission;
    }
  };

  // Trigger a real-time push alert from an article
  const triggerPushNotification = useCallback(
    (customArticle?: NewsArticle, customUrgency?: 'KRUSIAL' | 'DARURAT' | 'BREAKING') => {
      const candidatePool = articles.filter((art) => {
        if (art.category === 'Politik' && !prefs.topics.politik) return false;
        if (art.category === 'Ekonomi' && !prefs.topics.ekonomi) return false;
        if (art.category === 'Teknologi' && !prefs.topics.teknologi) return false;
        if (art.region === 'Internasional (Global)' && !prefs.topics.global) return false;
        return true;
      });

      const pool = candidatePool.length > 0 ? candidatePool : articles;
      const chosenArticle =
        customArticle || pool[nextArticleCursorRef.current % pool.length] || articles[0];
      nextArticleCursorRef.current = (nextArticleCursorRef.current + 1) % pool.length;

      const timeStr = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const urgencyLevel: 'KRUSIAL' | 'DARURAT' | 'BREAKING' =
        customUrgency ||
        (prefs.topics.darurat && nextArticleCursorRef.current % 3 === 0
          ? 'DARURAT'
          : nextArticleCursorRef.current % 2 === 0
          ? 'KRUSIAL'
          : 'BREAKING');

      const newAlert: PushAlertItem = {
        id: `push_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        articleId: chosenArticle.id,
        title: chosenArticle.title,
        summary: chosenArticle.summary,
        location: chosenArticle.location,
        category: chosenArticle.category,
        region: chosenArticle.region,
        urgency: urgencyLevel,
        receivedAt: `${timeStr} WIB`,
        imageUrl: chosenArticle.image_url,
        read: false,
      };

      setInbox((prev) => [newAlert, ...prev.slice(0, 19)]);
      setActiveToast(newAlert);

      if (prefs.soundEnabled) {
        playBreakingChime();
      }

      // Also dispatch browser native Notification if granted
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          const nativeNotif = new Notification(
            `[YEZNEWS ${newAlert.urgency}] ${newAlert.location}`,
            {
              body: newAlert.title,
              icon: newAlert.imageUrl,
              tag: newAlert.id,
            }
          );
          nativeNotif.onclick = () => {
            window.focus();
            onOpenArticle(chosenArticle);
            nativeNotif.close();
          };
        } catch {
          // Ignore environments where Notification constructor is restricted
        }
      }
    },
    [articles, prefs.soundEnabled, prefs.topics, onOpenArticle]
  );

  // Auto-dismiss active floating toast after 9 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 9000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  // Background real-time breaking news stream when enabled & autoLiveStream is on
  useEffect(() => {
    if (!prefs.enabled || !prefs.autoLiveStream) return;
    const interval = setInterval(() => {
      triggerPushNotification();
    }, 45000);
    return () => clearInterval(interval);
  }, [prefs.enabled, prefs.autoLiveStream, triggerPushNotification]);

  const handleToggleMasterEnable = async () => {
    const nextState = !prefs.enabled;
    setPrefs((prev) => ({ ...prev, enabled: nextState }));

    if (nextState) {
      await requestNativePermission();
      // Immediately send a welcome breaking news push confirmation
      setTimeout(() => {
        triggerPushNotification(articles[0], 'KRUSIAL');
      }, 250);
    } else {
      setActiveToast(null);
    }
  };

  const handleToggleTopic = (key: keyof PushPreferences['topics']) => {
    setPrefs((prev) => ({
      ...prev,
      topics: {
        ...prev.topics,
        [key]: !prev.topics[key],
      },
    }));
  };

  const handleReadAlert = (alertItem: PushAlertItem) => {
    setInbox((prev) =>
      prev.map((item) => (item.id === alertItem.id ? { ...item, read: true } : item))
    );
    setActiveToast(null);
    const found = articles.find((a) => a.id === alertItem.articleId) || articles[0];
    setIsModalOpen(false);
    onOpenArticle(found);
  };

  const handleMarkAllRead = () => {
    setInbox((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleClearInbox = () => {
    setInbox([]);
  };

  const unreadCount = inbox.filter((i) => !i.read).length;

  return (
    <>
      {/* INLINE BREAKING NEWS PUSH CALLOUT BANNER (Displayed inside News Dashboard) */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1930] via-[#13284c] to-[#0c1930] text-white p-5 sm:p-6 border border-blue-800/50 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
              prefs.enabled
                ? 'bg-rose-600/20 border-rose-400/50 text-rose-400'
                : 'bg-white/10 border-white/15 text-amber-300'
            }`}
          >
            {prefs.enabled ? (
              <BellRing className="w-6 h-6 animate-bounce" />
            ) : (
              <Bell className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase ${
                  prefs.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    prefs.enabled ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                  }`}
                />
                {prefs.enabled ? 'PUSH BREAKING NEWS AKTIF' : 'PERINGATAN BERITA KRUSIAL'}
              </span>
              <span className="text-xs text-sky-300 font-medium">
                Pembaruan Real-Time Redaksi YezNews
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {prefs.enabled
                ? 'Anda terhubung ke jalur distribusi cepat Breaking News Nasional & Global'
                : 'Aktifkan Notifikasi Push Breaking News untuk informasi darurat & berita krusial seketika'}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Dapatkan peringatan instan saat terjadi kebijakan ekonomi besar, peringatan cuaca/bencana nasional, atau perkembangan geopolitik dunia tanpa perlu memuat ulang halaman.
            </p>
          </div>
        </div>

        {/* Symmetrical Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleMasterEnable}
            className={`h-11 px-4 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-2 cursor-pointer border whitespace-nowrap ${
              prefs.enabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400/50 shadow-md'
                : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400/50 shadow-md'
            }`}
          >
            {prefs.enabled ? (
              <>
                <Check className="w-4 h-4" />
                <span>Notifikasi Aktif</span>
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4" />
                <span>Aktifkan Push Sekarang</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => triggerPushNotification(undefined, 'KRUSIAL')}
            className="h-11 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Simulasi Push</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-4 rounded-xl text-xs font-bold bg-slate-950/70 hover:bg-slate-900 text-slate-100 border border-white/15 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Settings2 className="w-4 h-4 text-sky-400" />
            <span>Preferensi & Riwayat</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-rose-600 text-white font-mono-tabular">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* FLOATING REAL-TIME BREAKING NEWS PUSH TOAST (Top-Right Viewport) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            key={activeToast.id}
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            role="alert"
            aria-live="assertive"
            className="fixed top-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] rounded-2xl bg-[#0b1528] text-white border-2 border-rose-500 shadow-2xl overflow-hidden"
          >
            {/* Top Urgency Bar */}
            <div className="px-4 py-2.5 bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-white animate-pulse shrink-0" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                  {activeToast.urgency} · PUSH REAL-TIME YEZNEWS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono-tabular text-rose-100">
                  {activeToast.receivedAt}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  aria-label="Tutup peringatan"
                  className="p-1 rounded hover:bg-black/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body with Documentary Thumbnail */}
            <div className="p-4 space-y-3.5">
              <div className="flex items-start gap-3.5">
                <img
                  src={activeToast.imageUrl}
                  alt={activeToast.title}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/15 bg-slate-900"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400">
                    <span>{activeToast.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-300">{activeToast.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                    {activeToast.title}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {activeToast.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveToast(null);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Pengaturan Push
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveToast(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
                  >
                    Abaikan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReadAlert(activeToast)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Baca Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PUSH NOTIFICATION PREFERENCES & LIVE ALERT CENTER MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="push-modal-title"
              className="bg-white dark:bg-[#0f1b2d] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-[#0a1628] via-[#13284c] to-[#0a1628] text-white flex items-center justify-between gap-4 border-b border-blue-800/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 id="push-modal-title" className="text-base sm:text-lg font-bold text-white truncate">
                        Pusat Notifikasi Push Breaking News
                      </h2>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                          prefs.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {prefs.enabled ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 truncate">
                      Konfigurasi peringatan berita krusial real-time & riwayat kilas darurat YezNews
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Tutup panel notifikasi"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {/* 1. Master Activation Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#091221] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Status Langganan Push Breaking News
                      </span>
                      <span className="text-[11px] font-mono-tabular px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-sky-300 font-semibold">
                        Izin Browser:{' '}
                        {browserPermission === 'granted'
                          ? 'Diizinkan'
                          : browserPermission === 'denied'
                          ? 'Mode In-App'
                          : 'Siap Diaktifkan'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Saat aktif, YezNews mengirimkan kartu peringatan real-time beserta nada isyarat redaksi setiap kali berita krusial diterbitkan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleToggleMasterEnable}
                      className={`h-10 px-4 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer ${
                        prefs.enabled
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                          : 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm'
                      }`}
                    >
                      {prefs.enabled ? (
                        <>
                          <BellOff className="w-4 h-4" />
                          <span>Matikan Notifikasi</span>
                        </>
                      ) : (
                        <>
                          <BellRing className="w-4 h-4" />
                          <span>Aktifkan Push Real-Time</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerPushNotification(undefined, 'DARURAT')}
                      className="h-10 px-3.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f1b2d] text-slate-800 dark:text-slate-100 hover:border-blue-500 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Uji Push</span>
                    </button>
                  </div>
                </div>

                {/* 2. Symmetrical Topic Filter Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Kategori Berita Krusial yang Dipantau
                    </h3>
                    <span className="text-xs text-blue-700 dark:text-sky-400 font-semibold">
                      Pilih topik peringatan
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(
                      [
                        {
                          key: 'darurat',
                          label: 'Darurat & Bencana',
                          desc: 'Peringatan BMKG, gempa & keselamatan publik',
                          icon: ShieldAlert,
                          accent: 'text-rose-600 dark:text-rose-400',
                        },
                        {
                          key: 'politik',
                          label: 'Nasional & Politik',
                          desc: 'Keputusan kabinet, parlemen & regulasi',
                          icon: Landmark,
                          accent: 'text-blue-700 dark:text-sky-400',
                        },
                        {
                          key: 'global',
                          label: 'Geopolitik Dunia',
                          desc: 'Diplomasi internasional & krisis global',
                          icon: Globe,
                          accent: 'text-indigo-600 dark:text-indigo-400',
                        },
                        {
                          key: 'ekonomi',
                          label: 'Ekonomi & Pasar',
                          desc: 'Suku bunga BI, IHSG, kurs Rupiah & komoditas',
                          icon: TrendingUp,
                          accent: 'text-emerald-600 dark:text-emerald-400',
                        },
                        {
                          key: 'teknologi',
                          label: 'Teknologi & Siber',
                          desc: 'Infrastruktur digital, AI & keamanan data',
                          icon: Cpu,
                          accent: 'text-amber-600 dark:text-amber-400',
                        },
                      ] as const
                    ).map((item) => {
                      const IconComponent = item.icon;
                      const isChecked = prefs.topics[item.key];
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleToggleTopic(item.key)}
                          className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                            isChecked
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500/70 shadow-xs'
                              : 'bg-white dark:bg-[#091221] border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <IconComponent className={`w-4 h-4 mt-0.5 shrink-0 ${item.accent}`} />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {item.label}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                              isChecked
                                ? 'bg-blue-700 border-blue-700 text-white'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Sound & Delivery Controls (Symmetrical 2-Column Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPrefs((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
                    }
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#091221] flex items-center justify-between gap-3 cursor-pointer hover:border-blue-400 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {prefs.soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Nada Isyarat Redaksi (Audio Chime)
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Bunyikan nada khas ruang berita saat push masuk
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        prefs.soundEnabled
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {prefs.soundEnabled ? 'Aktif' : 'Bisu'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPrefs((prev) => ({ ...prev, autoLiveStream: !prev.autoLiveStream }))
                    }
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#091221] flex items-center justify-between gap-3 cursor-pointer hover:border-blue-400 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Radio
                        className={`w-4 h-4 shrink-0 ${
                          prefs.autoLiveStream
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Pembaruan Push Otomatis Berkala
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Terima dorongan berita terbaru secara berkala
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        prefs.autoLiveStream
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {prefs.autoLiveStream ? 'Real-Time' : 'Manual'}
                    </span>
                  </button>
                </div>

                {/* 4. Live Breaking News Alert History / Inbox */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Riwayat Notifikasi Breaking News ({inbox.length})
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          {unreadCount} belum dibaca
                        </span>
                      )}
                    </div>

                    {inbox.length > 0 && (
                      <div className="flex items-center gap-3 text-xs">
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="font-semibold text-blue-700 dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Tandai semua dibaca
                        </button>
                        <button
                          type="button"
                          onClick={handleClearInbox}
                          className="font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Bersihkan</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {inbox.length === 0 ? (
                    <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2 bg-slate-50/50 dark:bg-[#091221]">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Belum ada riwayat notifikasi breaking news
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Klik tombol "Uji Push" di atas untuk menerima simulasi peringatan berita krusial secara real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      {inbox.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 sm:p-4 flex items-start justify-between gap-3.5 transition-colors ${
                            item.read
                              ? 'bg-white dark:bg-[#0f1b2d]'
                              : 'bg-blue-50/60 dark:bg-blue-950/30'
                          }`}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-900"
                          />

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                  item.urgency === 'DARURAT'
                                    ? 'bg-rose-600 text-white'
                                    : item.urgency === 'KRUSIAL'
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-blue-700 text-white'
                                }`}
                              >
                                {item.urgency}
                              </span>
                              <span className="font-bold text-blue-800 dark:text-sky-400">
                                {item.location}
                              </span>
                              <span aria-hidden="true" className="text-slate-400">
                                ·
                              </span>
                              <span className="text-slate-500 dark:text-slate-400 font-mono-tabular inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.receivedAt}
                              </span>
                              {!item.read && (
                                <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                              )}
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                              {item.summary}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleReadAlert(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white transition-colors shrink-0 cursor-pointer self-center"
                          >
                            Baca
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1626] flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Pengaturan disimpan otomatis pada perangkat Anda
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-blue-600 text-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
