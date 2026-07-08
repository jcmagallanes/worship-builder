import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Music2,
  Hash,
  ArrowRight,
  Gauge,
  Clock,
  Maximize2,
  Minimize2,
  List,
  Eye,
} from "lucide-react";

// ── Slide content layouts ──────────────────────────────────────
function KeyBadge({ original, perform }) {
  const changed = perform && original && perform !== original;
  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      <span className="text-2xl font-bold font-mono bg-white px-4 py-1.5 rounded-xl">
        {original || "—"}
      </span>
      {changed && (
        <>
          <ArrowRight size={20} className="text-amber-300" />
          <span className="text-2xl font-bold font-mono bg-amber-400 border border-amber-300/40 text-amber-200 px-4 py-1.5 rounded-xl">
            {perform}
          </span>
          <span className="text-xs font-bold bg-amber-400 text-amber-200 border border-amber-300/40 px-2.5 py-1 rounded-full uppercase tracking-widest">
            Key Change
          </span>
        </>
      )}
    </div>
  );
}

function SlideView({ song, tab, setTab }) {
  const tabs = [
    { id: "overview", label: "Overview", icon: Eye },
    ...(song.chords ? [{ id: "chords", label: "Chords", icon: Music2 }] : []),
    ...(song.progressions?.length > 0
      ? [{ id: "progressions", label: "Numbers", icon: Hash }]
      : []),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Song title area */}
      <div className="text-center px-6 pt-8 pb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
              song.type === "praise"
                ? "bg-orange-500/20 text-orange-200 border-orange-400/30"
                : "bg-blue-500/20 text-blue-200 border-blue-400/30"
            }`}>
            {song.type === "praise" ? "🔥 Praise" : "🕊 Worship"}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
          {song.title}
        </h1>
        {song.artist && (
          <p className="text-lg text-white/50 mt-2 font-medium">
            {song.artist}
          </p>
        )}
      </div>

      {/* Tab switcher */}
      {tabs.length > 1 && (
        <div className="flex justify-center mb-4 px-6">
          <div className="flex gap-1 bg-white/10 rounded-2xl p-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    tab === t.id
                      ? "bg-white text-[#241e16] shadow-sm"
                      : "text-white/60 hover:text-white/90"
                  }`}>
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-4 max-w-xl mx-auto">
            {/* Key */}
            {song.originalKey && (
              <div className="bg-white/8 rounded-2xl p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
                  Key
                </p>
                <KeyBadge
                  original={song.originalKey}
                  perform={song.performKey}
                />
              </div>
            )}

            {/* Tempo + Time Sig */}
            {(song.tempo || song.timeSignature) && (
              <div className="grid grid-cols-2 gap-3">
                {song.tempo && (
                  <div className="bg-white/8 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">
                      Tempo
                    </p>
                    <p className="text-3xl font-bold text-white font-mono">
                      {song.tempo}
                    </p>
                    <p className="text-white/40 text-xs mt-1">BPM</p>
                  </div>
                )}
                {song.timeSignature && (
                  <div className="bg-white/8 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">
                      Time
                    </p>
                    <p className="text-3xl font-bold text-white font-mono">
                      {song.timeSignature}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {song.notes && (
              <div className="bg-amber-400/10 border border-amber-300/20 rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-300/70 mb-2">
                  Performance Notes
                </p>
                <p className="text-white/80 text-base leading-relaxed">
                  {song.notes}
                </p>
              </div>
            )}

            {/* Quick chords preview if no separate tab */}
            {!song.chords && !song.progressions?.length && (
              <div className="text-center text-white/25 py-8 text-sm">
                No additional details
              </div>
            )}
          </div>
        )}

        {/* CHORDS TAB */}
        {tab === "chords" && song.chords && (
          <div className="max-w-2xl mx-auto">
            <pre className="text-white/90 font-mono text-lg sm:text-xl leading-loose whitespace-pre-wrap bg-white/6 rounded-2xl p-6">
              {song.chords}
            </pre>
          </div>
        )}

        {/* PROGRESSIONS TAB */}
        {tab === "progressions" && song.progressions?.length > 0 && (
          <div className="max-w-xl mx-auto space-y-3">
            {song.progressions.map((prog, i) => (
              <div
                key={prog.id || i}
                className="bg-white/8 rounded-2xl px-5 py-4 flex items-baseline gap-4">
                {prog.label && (
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40 w-20 shrink-0">
                    {prog.label}
                  </span>
                )}
                <span className="text-2xl font-bold font-mono text-white tracking-wide">
                  {prog.pattern}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Song list sidebar ──────────────────────────────────────────
function SongList({ songs, currentIdx, onSelect, onClose }) {
  return (
    <div className="absolute inset-0 z-10 bg-[#0f0e0c]/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h3 className="font-bold text-white text-lg">Set List</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-xl text-white/60">
          <X size={18} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-3">
        {songs.map((song, i) => (
          <button
            key={song.id}
            onClick={() => {
              onSelect(i);
              onClose();
            }}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
              i === currentIdx
                ? "bg-white/15 text-white"
                : "text-white/60 hover:bg-white/8 hover:text-white/90"
            }`}>
            <span
              className={`text-xs font-bold w-6 text-center shrink-0 ${i === currentIdx ? "text-white" : "text-white/30"}`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{song.title}</p>
              {song.artist && (
                <p className="text-xs text-white/40 truncate">{song.artist}</p>
              )}
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                song.type === "praise"
                  ? "bg-orange-500/20 text-orange-300"
                  : "bg-blue-500/20 text-blue-300"
              }`}>
              {song.type === "praise" ? "🔥" : "🕊"}
            </span>
            {i === currentIdx && (
              <div className="w-1.5 h-1.5 bg-white rounded-full shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main PresentationMode ──────────────────────────────────────
export default function PresentationMode({ songs, initialIndex = 0, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(initialIndex);
  const [tab, setTab] = useState("overview");
  const [showList, setShowList] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef(null);
  const containerRef = useRef(null);

  const song = songs[currentIdx];
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === songs.length - 1;

  const goTo = useCallback((idx) => {
    setCurrentIdx(idx);
    setTab("overview");
    setShowControls(true);
    resetControlsTimer();
  }, []);

  const goPrev = useCallback(() => {
    if (!isFirst) goTo(currentIdx - 1);
  }, [currentIdx, isFirst, goTo]);
  const goNext = useCallback(() => {
    if (!isLast) goTo(currentIdx + 1);
  }, [currentIdx, isLast, goTo]);

  const resetControlsTimer = () => {
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === "PageDown"
      )
        goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp")
        goPrev();
      if (e.key === "Escape") onClose();
      if (e.key === "l" || e.key === "L") setShowList((s) => !s);
      setShowControls(true);
      resetControlsTimer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  // Auto-hide controls
  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimer.current);
  }, []);

  // Touch swipe support
  const touchStart = useRef(null);
  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
    setShowControls(true);
    resetControlsTimer();
  };
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
    touchStart.current = null;
  };

  // Background gradient per type
  const bg =
    song.type === "praise"
      ? "from-[#1a0f06] via-[#2a1508] to-[#0f0a06]"
      : "from-[#060d1a] via-[#081526] to-[#06090f]";

  const accentColor = song.type === "praise" ? "#f97316" : "#60a5fa";

  if (!song) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-gradient-to-br ${bg} flex flex-col overflow-hidden`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseMove={() => {
        setShowControls(true);
        resetControlsTimer();
      }}>
      {/* Subtle top accent line */}
      <div
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}66, transparent)`,
        }}
      />

      {/* Header controls */}
      <div
        className={`flex items-center justify-between px-4 py-3 transition-opacity duration-300 no-print ${showControls ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-white/10 transition-all">
            <X size={16} /> Exit
          </button>
        </div>

        {/* Song counter + list toggle */}
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm font-mono">
            {currentIdx + 1} / {songs.length}
          </span>
          <button
            onClick={() => setShowList(true)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
            title="Song list (L)">
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Main slide content */}
      <div className="flex-1 overflow-hidden relative">
        <SlideView song={song} tab={tab} setTab={setTab} />
      </div>

      {/* Bottom navigation */}
      <div
        className={`flex items-center justify-between px-4 pb-6 pt-2 transition-opacity duration-300 no-print ${showControls ? "opacity-100" : "opacity-0"}`}>
        {/* Prev */}
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="flex items-center gap-2 text-white font-semibold px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95">
          <ChevronLeft size={20} />
          <span className="hidden sm:inline text-sm">Prev</span>
        </button>

        {/* Dots */}
        <div className="flex gap-1.5 items-center">
          {songs.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === currentIdx ? "w-6 h-2" : "w-2 h-2 hover:opacity-70"
              }`}
              style={{
                background:
                  i === currentIdx ? accentColor : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={goNext}
          disabled={isLast}
          className="flex items-center gap-2 text-white font-semibold px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95">
          <span className="hidden sm:inline text-sm">Next</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Song list overlay */}
      {showList && (
        <SongList
          songs={songs}
          currentIdx={currentIdx}
          onSelect={goTo}
          onClose={() => setShowList(false)}
        />
      )}

      {/* Keyboard hint — shown briefly at start */}
      <div
        className={`absolute bottom-20 left-1/2 -translate-x-1/2 text-white/25 text-xs font-medium transition-opacity duration-1000 pointer-events-none no-print ${showControls ? "opacity-100" : "opacity-0"}`}>
        ← → arrow keys to navigate • L for song list • Esc to exit
      </div>
    </div>
  );
}
