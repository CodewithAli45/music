import type { CSSProperties } from "react";
import Image from "next/image";
import { ListMusic, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { PlayerViewProps } from "./types";

export default function PlayerView({
  currentSong,
  currentIndex,
  totalTracks,
  isPlaying,
  isPlaylistOpen,
  currentTime,
  duration,
  onTogglePlaylist,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  formatTime,
}: PlayerViewProps) {
  const hasDuration = duration > 0;
  const sliderValue = hasDuration ? Math.min(currentTime, duration) : 0;
  const fill = hasDuration ? Math.min(100, (sliderValue / duration) * 100) : 0;

  return (
    <div className="shell">
      {/* ── Top bar: single playlist trigger, top-left ─────────────────── */}
      <header className="topbar">
        <button
          type="button"
          className="btn playlist-btn"
          onClick={onTogglePlaylist}
          aria-expanded={isPlaylistOpen}
          aria-controls="playlist-panel"
        >
          <ListMusic size={16} aria-hidden="true" />
          <span>Playlist</span>
          <span className="playlist-btn-count" aria-hidden="true">
            {totalTracks}
          </span>
        </button>
        <span className="topbar-status" aria-hidden="true">
          <span className={`status-dot ${isPlaying ? "on" : ""}`} />
          {isPlaying ? "playing" : "paused"}
        </span>
      </header>

      {/* ── Center: static artwork stage, always centered ──────────────── */}
      <main className="stage">
        <section className="artwork-frame" aria-label="Album artwork">
          <div className="frame-header">
            <span className={`frame-label ${isPlaying ? "on" : ""}`}>
              {isPlaying ? "♪ now playing" : "♪ paused"}
            </span>
            <span className="frame-index">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(totalTracks).padStart(2, "0")}
            </span>
          </div>
          <div className="vinyl">
            <div className="vinyl-disc">
              <div className="vinyl-label">
                <Image
                  src={currentSong?.cover || "/asset/album-placeholder.png"}
                  alt=""
                  fill
                  sizes="240px"
                  priority
                  className="vinyl-art"
                />
              </div>
            </div>
          </div>
          <p className="frame-caption">{currentSong?.artist || "unknown artist"}</p>
        </section>
      </main>

      {/* ── Bottom controller ──────────────────────────────────────────── */}
      <footer className="controller">
        <div className="controller-inner">
          <h1 className="track-title" title={currentSong?.title || undefined}>
            {currentSong?.title || "no track selected"}
          </h1>

          <div className="progress-row">
            <span className="time-text" aria-label="Elapsed time">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              className="seek-slider"
              min={0}
              max={hasDuration ? duration : 100}
              step={1}
              value={sliderValue}
              disabled={!hasDuration}
              onChange={(e) => onSeek(Number(e.target.value))}
              aria-label="Seek"
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              style={{ "--fill": `${fill}%` } as CSSProperties}
            />
            <span className="time-text" aria-label="Total duration">
              {formatTime(duration)}
            </span>
          </div>

          <div className="transport">
            <button
              type="button"
              className="btn transport-btn"
              onClick={onPrev}
              aria-label="Previous track"
            >
              <SkipBack size={20} fill="currentColor" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn transport-btn transport-main"
              onClick={onTogglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" aria-hidden="true" />
              ) : (
                <Play size={24} fill="currentColor" aria-hidden="true" style={{ marginLeft: 2 }} />
              )}
            </button>
            <button
              type="button"
              className="btn transport-btn"
              onClick={onNext}
              aria-label="Next track"
            >
              <SkipForward size={20} fill="currentColor" aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
