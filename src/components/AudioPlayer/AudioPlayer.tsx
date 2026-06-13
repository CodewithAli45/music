"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capgo/capacitor-native-audio";
import { Song } from "@/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobilePlayer from "./MobilePlayer";
import DesktopPlayer from "./DesktopPlayer";

export default function AudioPlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isShuffle, setIsShuffle] = useState(true);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSong = songs[currentIndex];
  const isNative = Capacitor.isNativePlatform();
  const [nativeLoadedUrl, setNativeLoadedUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const nextSong = useCallback(() => {
    if (songs.length === 0) return;
    setIsPlaying(true);
    if (isShuffle && songs.length > 1) {
      let randomIndex = Math.floor(Math.random() * songs.length);
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * songs.length);
      }
      setCurrentIndex(randomIndex);
    } else {
      setCurrentIndex((prev) => (prev + 1) % songs.length);
    }
  }, [isShuffle, songs.length, currentIndex]);

  const prevSong = useCallback(() => {
    if (songs.length === 0) return;
    setIsPlaying(true);
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  }, [songs.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 1;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const targetTime = (x / rect.width) * duration;
    
    if (isNative) {
      try {
        await NativeAudio.setCurrentTime({ assetId: 'player', time: targetTime });
        setCurrentTime(targetTime);
        setProgress((targetTime / duration) * 100);
      } catch (err) { console.error("Seek error", err); }
    } else if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  // Initial Fetch
  useEffect(() => {
    const apiPath = process.env.NEXT_PUBLIC_CAPACITOR_BUILD === "true" ? "/api/songs.json" : "/api/songs";
    fetch(apiPath)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const unique = [];
          const seen = new Set();
          for (const s of data) {
            if (!seen.has(s.title)) { seen.add(s.title); unique.push(s); }
          }
          setSongs(unique);
        }
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // Native Audio Time and Completion Listeners
  useEffect(() => {
    if (!isNative) return;
    
    const timeListener = NativeAudio.addListener('currentTime', (state: any) => {
       if (state.assetId === 'player') {
           setCurrentTime(state.currentTime);
           setDuration(currentSong?.duration || 1);
           setProgress((state.currentTime / (currentSong?.duration || 1)) * 100);
       }
    });

    const completionListener = NativeAudio.addListener('complete', (state: any) => {
       if (state.assetId === 'player') {
           nextSong();
       }
    });

    return () => {
        timeListener.then(l => l.remove());
        completionListener.then(l => l.remove());
    };
  }, [isNative, currentSong?.duration, nextSong]);

  // Playback Control
  useEffect(() => {
    if (isNative) {
      if (!currentSong) return;
      const manageNativeAudio = async () => {
        try {
          if (nativeLoadedUrl !== currentSong.url) {
            try { await NativeAudio.stop({ assetId: 'player' }); } catch(e){}
            try { await NativeAudio.unload({ assetId: 'player' }); } catch(e){}
            
            await NativeAudio.preload({
              assetId: 'player',
              assetPath: currentSong.url,
            });
            setNativeLoadedUrl(currentSong.url);
            setDuration(currentSong.duration || 0);
            
            if (isPlaying) {
              await NativeAudio.play({ assetId: 'player' });
            }
          } else {
            if (isPlaying) {
              await NativeAudio.play({ assetId: 'player' });
            } else {
              await NativeAudio.pause({ assetId: 'player' });
            }
          }
        } catch (err) {
          console.error("NativeAudio error:", err);
        }
      };
      manageNativeAudio();
    } else {
      if (audioRef.current) {
        if (isPlaying) audioRef.current.play().catch(() => {});
        else audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex, currentSong, isNative, nativeLoadedUrl]);

  // Media Session & Metadata
  useEffect(() => {
    if (!currentSong || typeof window === "undefined" || !("mediaSession" in navigator)) return;
    
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist || "My Music",
        artwork: [
          { src: currentSong.cover || "/asset/album-placeholder.png", sizes: "512x512", type: "image/png" }
        ]
      });

      navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler("previoustrack", prevSong);
      navigator.mediaSession.setActionHandler("nexttrack", nextSong);
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch (e) {
      console.warn("MediaSession failed", e);
    }
  }, [currentSong, isPlaying, nextSong, prevSong]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading || !isMounted) return <div className="text-white p-8">Loading your music...</div>;
  if (!songs.length) return <div className="text-white p-8">No songs found.</div>;

  const playerProps = {
    songs,
    currentIndex,
    currentSong,
    isPlaying,
    progress,
    duration,
    currentTime,
    isShuffle,
    isRepeat,
    togglePlay,
    nextSong,
    prevSong,
    handleSeek,
    setIsShuffle,
    setIsRepeat,
    setCurrentIndex,
    setIsPlaying,
    formatTime,
  };

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
      {isDesktop ? <DesktopPlayer {...playerProps} /> : <MobilePlayer {...playerProps} />}
    </>
  );
}
