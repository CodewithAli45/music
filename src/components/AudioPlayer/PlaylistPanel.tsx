import { useEffect, useRef } from "react";
import { Pause, Play, X } from "lucide-react";
import type { PlaylistPanelProps } from "./types";

export default function PlaylistPanel({
  open,
  songs,
  currentIndex,
  isPlaying,
  onClose,
  onSelect,
  formatTime,
}: PlaylistPanelProps) {
  const pushedHistoryRef = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Let the Android hardware back button close the panel instead of the app.
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ playlistOpen: true }, "");
    pushedHistoryRef.current = true;

    const handlePopState = () => {
      pushedHistoryRef.current = false;
      onClose();
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Closed programmatically (button / overlay / track pick) — consume
      // the history entry we pushed so the browser Back stack stays clean.
      if (pushedHistoryRef.current) {
        pushedHistoryRef.current = false;
        window.history.back();
      }
    };
  }, [open, onClose]);

  // Escape key closes the panel.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <>
      <div
        className={`panel-overlay ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="playlist-panel"
        className={`panel ${open ? "open" : ""}`}
        inert={!open}
        aria-label="Playlist"
      >
        <header className="panel-header">
          <h2 className="panel-title">
            <span className="panel-prompt" aria-hidden="true">
              $
            </span>{" "}
            playlist
          </h2>
          <span className="panel-count">{songs.length} tracks</span>
          <button
            ref={closeRef}
            type="button"
            className="btn panel-close"
            onClick={onClose}
            aria-label="Close playlist"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <ul className="panel-list">
          {songs.map((song, index) => {
            const active = index === currentIndex;
            return (
              <li key={song.id}>
                <button
                  type="button"
                  className={`panel-item ${active ? "active" : ""}`}
                  onClick={() => onSelect(index)}
                  aria-current={active ? "true" : undefined}
                >
                  <span className="panel-item-index" aria-hidden="true">
                    {active ? (
                      isPlaying ? (
                        <Play size={11} fill="currentColor" />
                      ) : (
                        <Pause size={11} fill="currentColor" />
                      )
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>
                  <span className="panel-item-title">{song.title}</span>
                  <span className="panel-item-duration">{formatTime(song.duration)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
