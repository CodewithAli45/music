"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capgo/capacitor-native-audio";
import { Song } from "@/types";
import PlayerView from "./PlayerView";
import PlaylistPanel from "./PlaylistPanel";

export default function AudioPlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSong = songs[currentIndex];
  const isNative = Capacitor.isNativePlatform();
  const [nativeLoadedUrl, setNativeLoadedUrl] = useState<string | null>(null);
  const [nativeConfigured, setNativeConfigured] = useState(false);
  // Track if we paused (vs loading new track) to use resume() correctly
  const [nativePaused, setNativePaused] = useState(false);

  // Ref to ignore 'complete' events triggered by manual seeking, stopping, or pausing on Android
  const ignoreCompleteRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* ------------------------------- formatting ------------------------------- */

  const formatTime = useCallback((time: number): string => {
    if (!Number.isFinite(time) || time < 0) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, []);

  /* ------------------------------ native setup ------------------------------ */

  // Configure NativeAudio once on mount (native only)
  useEffect(() => {
    if (!isNative) return;
    const init = async () => {
      try {
        await NativeAudio.configure({
          focus: true,
          background: true,
          backgroundPlayback: true,
          showNotification: true,
        } as any);
        setNativeConfigured(true);
      } catch (err) {
        console.error("NativeAudio configure error:", err);
      }
    };
    init();
  }, [isNative]);

  /* -------------------------------- transport -------------------------------- */

  const nextSong = useCallback(() => {
    if (songs.length === 0) return;
    setIsPlaying(true);
    setNativePaused(false);
    setCurrentIndex((prev) => (prev + 1) % songs.length);
  }, [songs.length]);

  const prevSong = useCallback(() => {
    if (songs.length === 0) return;
    setIsPlaying(true);
    setNativePaused(false);
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  }, [songs.length]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const togglePlaylist = useCallback(() => {
    setIsPlaylistOpen((prev) => !prev);
  }, []);

  const closePlaylist = useCallback(() => {
    setIsPlaylistOpen(false);
  }, []);

  const selectSong = useCallback(
    (index: number) => {
      setIsPlaylistOpen(false);
      if (index === currentIndex) {
        setIsPlaying((prev) => !prev);
        return;
      }
      setCurrentIndex(index);
      setIsPlaying(true);
      setNativePaused(false);
    },
    [currentIndex]
  );

  const handleSeek = useCallback(
    async (time: number) => {
      const total = duration || 0;
      const target = Math.max(0, Math.min(time, total));
      setCurrentTime(target);

      if (isNative) {
        try {
          // Set ignore complete flag to prevent seeking from triggering nextSong()
          ignoreCompleteRef.current = true;
          await NativeAudio.setCurrentTime({ assetId: "player", time: target });
          // Reset flag after seek is completed and audio resumes
          setTimeout(() => {
            ignoreCompleteRef.current = false;
          }, 1500);
        } catch (err) {
          console.error("Seek error", err);
          ignoreCompleteRef.current = false;
        }
      } else if (audioRef.current) {
        audioRef.current.currentTime = target;
      }
    },
    [duration, isNative]
  );

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);

  /* --------------------------------- library -------------------------------- */

  // Initial Fetch
  useEffect(() => {
    const apiPath =
      process.env.NEXT_PUBLIC_CAPACITOR_BUILD === "true"
        ? "/api/songs.json"
        : "/api/songs";
    fetch(apiPath)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const unique: Song[] = [];
          const seen = new Set();
          for (const s of data) {
            if (!seen.has(s.title)) {
              seen.add(s.title);
              unique.push(s);
            }
          }
          setSongs(unique);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  /* --------------------------- native event wiring -------------------------- */

  // Native Audio Listeners (time updates, completion, remote controls)
  useEffect(() => {
    if (!isNative) return;

    const timeListener = NativeAudio.addListener("currentTime", (state: any) => {
      if (state.assetId === "player") {
        setCurrentTime(state.currentTime);
      }
    });

    const completionListener = NativeAudio.addListener("complete", (state: any) => {
      if (state.assetId === "player") {
        if (ignoreCompleteRef.current) {
          console.log("Ignored complete listener invocation (triggered manually)");
          return;
        }
        nextSong();
      }
    });

    // Listen for lock screen / notification controls (play, pause, next, prev)
    const playbackStateListener = NativeAudio.addListener("playbackState", (state: any) => {
      if (state.assetId === "player") {
        if (state.reason === "remotePlay") {
          setIsPlaying(true);
        } else if (state.reason === "remotePause") {
          setIsPlaying(false);
          setNativePaused(true);
        } else if (state.reason === "remoteNext") {
          nextSong();
        } else if (state.reason === "remotePrevious") {
          prevSong();
        }
        // Update duration from native if available
        if (state.duration && state.duration > 0) {
          setDuration(state.duration);
        }
      }
    });

    return () => {
      timeListener.then((l) => l.remove());
      completionListener.then((l) => l.remove());
      playbackStateListener.then((l) => l.remove());
    };
  }, [isNative, nextSong, prevSong]);

  /* ------------------------------ playback sync ----------------------------- */

  // Playback Control
  useEffect(() => {
    if (isNative) {
      if (!currentSong || !nativeConfigured) return;
      const manageNativeAudio = async () => {
        try {
          if (nativeLoadedUrl !== currentSong.url) {
            // Setting flag to ignore the 'complete' event fired during stop/unload
            ignoreCompleteRef.current = true;

            // New song — stop, unload, preload, play
            try {
              await NativeAudio.stop({ assetId: "player" });
            } catch (e) {}
            try {
              await NativeAudio.unload({ assetId: "player" });
            } catch (e) {}

            await NativeAudio.preload({
              assetId: "player",
              assetPath: currentSong.url,
              isUrl: true,
              notificationMetadata: {
                title: currentSong.title,
                artist: currentSong.artist || "My Music",
                artworkUrl: currentSong.cover || "",
              },
            });
            setNativeLoadedUrl(currentSong.url);
            setNativePaused(false);

            // Get the actual duration from native player
            try {
              const { duration: nativeDuration } = await NativeAudio.getDuration({
                assetId: "player",
              });
              if (nativeDuration > 0) setDuration(nativeDuration);
            } catch (e) {
              setDuration(currentSong.duration || 0);
            }

            if (isPlaying) {
              await NativeAudio.play({ assetId: "player" });
            }

            // Restore complete events handling after new song has preloaded & played
            setTimeout(() => {
              ignoreCompleteRef.current = false;
            }, 1500);
          } else {
            // Same song — toggle play/pause
            if (isPlaying) {
              if (nativePaused) {
                await NativeAudio.resume({ assetId: "player" });
                setNativePaused(false);
              } else {
                await NativeAudio.play({ assetId: "player" });
              }
            } else {
              // Ignore complete event that might trigger while pausing/stopping
              ignoreCompleteRef.current = true;
              await NativeAudio.pause({ assetId: "player" });
              setNativePaused(true);
              setTimeout(() => {
                ignoreCompleteRef.current = false;
              }, 1000);
            }
          }
        } catch (err) {
          console.error("NativeAudio error:", err);
          ignoreCompleteRef.current = false;
        }
      };
      manageNativeAudio();
    } else {
      if (audioRef.current) {
        if (isPlaying) audioRef.current.play().catch(() => {});
        else audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex, currentSong, isNative, nativeLoadedUrl, nativeConfigured, nativePaused]);

  /* ------------------------------ media session ----------------------------- */

  // Media Session & Metadata (Web/PWA only — native uses NativeAudio's notification)
  useEffect(() => {
    if (!currentSong || typeof window === "undefined" || !("mediaSession" in navigator)) return;
    if (isNative) return; // NativeAudio handles notifications natively

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist || "My Music",
        artwork: [
          {
            src: currentSong.cover || "/asset/album-placeholder.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler("previoustrack", prevSong);
      navigator.mediaSession.setActionHandler("nexttrack", nextSong);
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch (e) {
      console.warn("MediaSession failed", e);
    }
  }, [currentSong, isPlaying, nextSong, prevSong, isNative]);

  /* ----------------------------- keyboard control --------------------------- */

  // Space toggles playback, arrow keys skip tracks (when not focused on a control)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("button, input, select, textarea, a, [contenteditable]")) return;
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        nextSong();
      } else if (e.key === "ArrowLeft") {
        prevSong();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay, nextSong, prevSong]);

  /* --------------------------------- render --------------------------------- */

  if (!isMounted || loading) {
    return (
      <div className="boot" role="status">
        <p className="boot-line">
          <span className="boot-prompt">$</span> fetching library
          <span className="boot-cursor" aria-hidden="true" />
        </p>
      </div>
    );
  }

  if (!songs.length) {
    return (
      <div className="boot">
        <p className="boot-line">
          <span className="boot-prompt">$</span> no tracks found
        </p>
        <p className="boot-hint"># upload audio to your Cloudinary library and reload</p>
      </div>
    );
  }

  return (
    <>
      {!isNative && (
        <audio
          ref={audioRef}
          src={currentSong?.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={nextSong}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
      <PlayerView
        currentSong={currentSong}
        currentIndex={currentIndex}
        totalTracks={songs.length}
        isPlaying={isPlaying}
        isPlaylistOpen={isPlaylistOpen}
        currentTime={currentTime}
        duration={duration}
        onTogglePlaylist={togglePlaylist}
        onTogglePlay={togglePlay}
        onPrev={prevSong}
        onNext={nextSong}
        onSeek={handleSeek}
        formatTime={formatTime}
      />
      <PlaylistPanel
        open={isPlaylistOpen}
        songs={songs}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        onClose={closePlaylist}
        onSelect={selectSong}
        formatTime={formatTime}
      />
    </>
  );
}
