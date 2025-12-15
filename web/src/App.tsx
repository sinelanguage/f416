import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  Music,
  Library,
  Search,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";

import { Sheet, SheetContent } from "./components/ui/sheet";
import bandcampData from "./data/bandcamp.json";
import { getAssetUrl } from "./config";

type Track = {
  id: number;
  title: string;
  duration: number;
  path: string;
  trackNumber: number;
};

type Release = {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  cover: string;
  url: string;
  duration: string;
  type: "album" | "ep" | "compilation";
  tracks?: Track[];
};

const RELEASES: Release[] = bandcampData as Release[];

function Sidebar({
  collapsed,
  onToggleCollapse,
  selectedFilter,
  onFilterChange,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}) {
  // Get unique artists from releases
  const artists = Array.from(
    new Set(
      RELEASES.map((r) => r.artist).filter(
        (artist) => !artist.includes("Format416") && !artist.includes("Various")
      )
    )
  );

  const navItems = [
    { id: "all", label: "All Releases", icon: Library },
    { id: "album", label: "Albums", icon: Music },
    { id: "ep", label: "EPs & Singles", icon: List },
  ];

  return (
    <aside
      className={`hidden md:flex ${
        collapsed ? "w-16" : "w-64"
      } shrink-0 flex-col gap-4 p-4 transition-all duration-300 min-h-[calc(100vh-12rem)]`}
    >
      <div className="flex items-center justify-between">
        {!collapsed && (
          <span className="text-sm font-medium text-neutral-400">
            Navigation
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="size-8"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onFilterChange(item.id)}
            className={`flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-left transition-colors ${
              selectedFilter === item.id
                ? "bg-neutral-800 text-white"
                : "text-neutral-300"
            }`}
          >
            {collapsed ? (
              <item.icon className="size-4 shrink-0" />
            ) : (
              <span className="truncate">{item.label}</span>
            )}
          </button>
        ))}

        {!collapsed && (
          <>
            <div className="mt-4 mb-2">
              <span className="text-sm font-medium text-neutral-400">
                Artists
              </span>
            </div>
            {artists.map((artist) => (
              <button
                key={artist}
                onClick={() => onFilterChange(`artist:${artist}`)}
                className={`flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-left transition-colors ${
                  selectedFilter === `artist:${artist}`
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-300"
                }`}
              >
                {collapsed ? (
                  <Search className="size-4 shrink-0" />
                ) : (
                  <span className="truncate">{artist}</span>
                )}
              </button>
            ))}

            <div className="mt-4 pt-4">
              <a
                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300 transition-colors"
                href="https://format416.bandcamp.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {collapsed ? (
                  <Heart className="size-4" />
                ) : (
                  <span>Bandcamp Store</span>
                )}
              </a>
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}

function Navbar({
  onOpenMobile,
  onOpenQueue,
}: {
  onOpenMobile: () => void;
  onOpenQueue: () => void;
}) {
  return (
    <header className="h-24 flex items-center px-4 gap-3 sticky top-0 backdrop-blur z-50">
      <div className="md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenMobile}
          aria-label="Open menu"
          title="Open menu"
        >
          <List className="size-4" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center shrink-0">
          <img
            src="/formatLogo.svg"
            alt="Format416 Logo"
            className="h-16 w-16"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-thin truncate font-jetbrains tracking-tight">
            <span className="hidden sm:inline">FORMAT416</span>
            <span className="sm:hidden">F416</span>
          </h1>
          <p className="text-xs font-thin text-neutral-400 hidden sm:block truncate">
            Recordings: Toronto
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenQueue}
          aria-label="Open queue"
          title="Open queue"
        >
          <List className="size-4" />
        </Button>
      </div>
    </header>
  );
}

function AlbumCard({
  release,
  onPlay,
}: {
  release: Release;
  onPlay: () => void;
}) {
  const handleCardClick = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      !(e.target as HTMLElement).closest("button")
    ) {
      window.open(release.url, "_blank");
    }
  };

  return (
    <Card
      className="group cursor-pointer transition-colors"
      onClick={handleCardClick}
    >
      <div className="relative rounded-xl overflow-hidden bg-neutral-900/80 group-hover:bg-neutral-900/90 transition-colors">
        <img
          src={getAssetUrl(release.cover)}
          alt={`${release.title} cover`}
          className="w-full h-32 sm:h-36 md:h-44 object-cover rounded-xl"
        />
        <Button
          aria-label={`Play ${release.title}`}
          title={`Play ${release.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          size="icon"
          className="absolute bottom-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition size-8 md:size-9"
        >
          <Play className="size-3 md:size-4" />
        </Button>
      </div>
      <div className="p-2 md:p-3 bg-transparent">
        <div className="text-xs md:text-sm font-medium truncate">
          {release.title}
        </div>
        <div className="text-xs text-neutral-400 truncate">
          {release.artist}
        </div>
        <div className="text-xs text-neutral-500 truncate hidden sm:block">
          {release.type} • {release.duration}
        </div>
      </div>
    </Card>
  );
}

function TopBannerPlayer({
  release,
  track,
  isActive,
  currentTime,
  duration,
  onPlay,
  onSeek,
}: {
  release: Release;
  track: Track | null;
  isActive: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onSeek: (time: number) => void;
}) {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [barCount, setBarCount] = useState<number>(200);
  // Deterministic pseudo-random for consistent waveform per release
  const peaks = useMemo(() => {
    const seedString = `${release.id}-${release.title}-${release.artist}`;
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed * 31 + seedString.charCodeAt(i)) >>> 0;
    }
    const random = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return ((seed >>> 0) % 1000) / 1000;
    };
    const values: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // Bias to create a build-up and fade-out shape
      const envelope = Math.sin((Math.PI * i) / barCount);
      const jitter = 0.6 + random() * 0.4;
      values.push(Math.max(0.1, envelope * jitter));
    }
    return values;
  }, [release.id, release.title, release.artist, barCount]);

  // Resize-aware bar count to render on tablet/mobile
  useEffect(() => {
    const el = waveformRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width || el.clientWidth || 0;
      const step = window.innerWidth >= 768 ? 7 : 3; // px per bar incl. gap (mobile denser)
      const count = Math.max(80, Math.floor(width / step));
      setBarCount(count);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const playedRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    onSeek(ratio * duration);
  };

  return (
    <div className="px-4 mt-4">
      <Card className="relative w-full overflow-hidden bg-neutral-900/50">
        {/* Background gradient and blurred art on the right */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-900" />
          <div
            className="absolute right-0 top-0 h-full w-1/2 md:w-2/5"
            style={{
              backgroundImage: `url(${getAssetUrl(release.cover)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(12px) saturate(120%)",
              maskImage: "linear-gradient(to left, black, transparent)",
              WebkitMaskImage: "linear-gradient(to left, black, transparent)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-20 px-4 pt-4 md:px-4 md:pt-6 pb-0 flex items-start gap-3 md:gap-6">
          <Button
            onClick={onPlay}
            size="icon"
            className="size-12 sm:size-14 md:size-16 rounded-full bg-white text-black hover:bg-gray-200 shrink-0"
            aria-label={isActive ? "Pause" : "Play"}
            title={isActive ? "Pause" : "Play"}
          >
            {isActive ? (
              <Pause className="size-6 sm:size-7 md:size-8" />
            ) : (
              <Play className="size-6 sm:size-7 md:size-8" />
            )}
          </Button>

          <div className="min-w-0 flex-1">
            <div className="mb-2 md:mb-3">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                {track ? track.title : release.title}
              </h2>
              <div className="text-xs sm:text-sm text-neutral-300 truncate">
                {release.artist} {track && `• ${release.title}`}
              </div>
            </div>

            {/* Waveform overlay handled at Card level */}
            <div className="sr-only">waveform overlay</div>
          </div>

          {/* Artwork card on the right */}
          <div className="hidden sm:block ml-auto mb-4">
            <img
              src={getAssetUrl(release.cover)}
              alt={`${release.title} cover`}
              className="h-40 w-40 md:h-56 md:w-56 object-cover rounded-xl shadow-md"
            />
          </div>
        </div>
        {/* Full-width waveform overlay above background, below content */}
        <div
          className="absolute left-0 right-0 bottom-0 z-10 select-none"
          onClick={handleSeekClick}
        >
          <div
            ref={waveformRef}
            className="w-full h-24 sm:h-28 md:h-36 flex items-end gap-0 sm:gap-px md:gap-[2px] px-4"
          >
            {peaks.map((v, i) => {
              const barRatio = i / peaks.length;
              const played = barRatio <= playedRatio;
              return (
                <div
                  key={i}
                  className={`w-px sm:w-[2px] md:w-[3px] ${
                    played ? "bg-white" : "bg-neutral-400/40"
                  }`}
                  style={{ height: `${Math.max(16, v * 140)}px` }}
                />
              );
            })}
          </div>
          <div
            className="absolute bottom-0 translate-x-[-50%]"
            style={{ left: `${playedRatio * 100}%` }}
          >
            <div className="size-4 sm:size-5 md:size-6 rounded-full bg-white ring-2 ring-black/30" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function AlbumGrid({
  onSelect,
  title = "Discover",
  releases = RELEASES,
}: {
  onSelect: (index: number) => void;
  title?: string;
  releases?: Release[];
}) {
  return (
    <section className="p-4">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {releases.map((release, idx) => (
          <AlbumCard
            key={release.id}
            release={release}
            onPlay={() => onSelect(idx)}
          />
        ))}
      </div>
    </section>
  );
}

function AudioPlayer({
  release,
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onVolume,
}: {
  release: Release;
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolume: (vol: number) => void;
}) {
  return (
    <footer className="h-16 md:h-20 px-3 md:px-4 flex items-center gap-2 md:gap-4 sticky bottom-0 backdrop-blur">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 md:flex-initial">
        <img
          src={getAssetUrl(release.cover)}
          className="size-10 md:size-12 rounded object-cover"
          alt="cover"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs md:text-sm truncate">
            {track ? track.title : release.title}
          </div>
          <div className="text-xs text-neutral-400 truncate">
            {release.artist} {track && `• ${release.title}`}
          </div>
        </div>
        <Heart className="size-4 text-neutral-400 hidden md:block" />
      </div>
      <div className="hidden md:flex flex-1 flex-col items-center gap-1">
        <div className="flex items-center gap-4">
          <Shuffle className="size-4 text-neutral-400" />
          <button aria-label="Previous" title="Previous" onClick={onPrev}>
            <SkipBack className="size-5" />
          </button>
          <button
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
            onClick={onPlayPause}
            className="size-9 grid place-items-center rounded-full bg-white text-black"
          >
            {isPlaying ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5" />
            )}
          </button>
          <button aria-label="Next" title="Next" onClick={onNext}>
            <SkipForward className="size-5" />
          </button>
          <Repeat className="size-4 text-neutral-400" />
        </div>
        <div className="flex items-center gap-3 w-full max-w-xl text-xs text-neutral-400">
          <span>{formatTime(currentTime)}</span>
          <input
            aria-label="Seek"
            type="range"
            min={0}
            max={Math.max(1, duration)}
            value={Math.min(currentTime, duration)}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1 accent-white bg-neutral-800 rounded"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden flex items-center gap-3">
        <button aria-label="Previous" title="Previous" onClick={onPrev}>
          <SkipBack className="size-5" />
        </button>
        <button
          aria-label={isPlaying ? "Pause" : "Play"}
          title={isPlaying ? "Pause" : "Play"}
          onClick={onPlayPause}
          className="size-8 grid place-items-center rounded-full bg-white text-black"
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </button>
        <button aria-label="Next" title="Next" onClick={onNext}>
          <SkipForward className="size-5" />
        </button>
      </div>
      <div className="hidden md:flex items-center gap-3">
        <Volume2 className="size-4" />
        <input
          aria-label="Volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolume(Number(e.target.value))}
          className="w-28 h-1 accent-white bg-neutral-800 rounded"
        />
      </div>
    </footer>
  );
}

function formatTime(seconds: number) {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [queue, setQueue] = useState<number[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [bannerIndex, setBannerIndex] = useState<number>(0);
  const [bannerTrackIndex, setBannerTrackIndex] = useState<number>(0);
  const [backgroundIndex, setBackgroundIndex] = useState<number>(0);

  // Lazily create audio element once
  if (audioRef.current === null) {
    audioRef.current = new Audio();
  }

  const currentRelease = useMemo(() => RELEASES[currentIndex], [currentIndex]);
  const currentTrack = useMemo(() => {
    if (currentRelease?.tracks && currentRelease.tracks.length > 0) {
      return (
        currentRelease.tracks[currentTrackIndex] || currentRelease.tracks[0]
      );
    }
    return null;
  }, [currentRelease, currentTrackIndex]);

  const bannerRelease = useMemo(() => RELEASES[bannerIndex], [bannerIndex]);
  const bannerTrack = useMemo(() => {
    if (bannerRelease?.tracks && bannerRelease.tracks.length > 0) {
      return bannerRelease.tracks[bannerTrackIndex] || bannerRelease.tracks[0];
    }
    return null;
  }, [bannerRelease, bannerTrackIndex]);

  // Filter releases based on selected filter
  const filteredReleases = useMemo(() => {
    if (selectedFilter === "all") return RELEASES;
    if (selectedFilter.startsWith("artist:")) {
      const artist = selectedFilter.replace("artist:", "");
      return RELEASES.filter((r) => r.artist === artist);
    }
    if (selectedFilter === "ep") {
      return RELEASES.filter(
        (r) => r.type === "ep" || r.type === "compilation"
      );
    }
    return RELEASES.filter((r) => r.type === selectedFilter);
  }, [selectedFilter]);

  // Pick a contextual random banner track whenever the filter changes
  useEffect(() => {
    const setRandomBanner = () => {
      const candidates = filteredReleases;
      if (!candidates.length) return;
      const idxInFiltered = Math.floor(Math.random() * candidates.length);
      const id = candidates[idxInFiltered].id;
      const idxInAll = RELEASES.findIndex((r) => r.id === id);
      if (idxInAll !== -1) {
        setBannerIndex(idxInAll);
        const release = RELEASES[idxInAll];
        // Set banner track to first track if available
        if (release?.tracks && release.tracks.length > 0) {
          setBannerTrackIndex(0);
        } else {
          setBannerTrackIndex(0);
        }
      }
    };
    setRandomBanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, filteredReleases]);

  // Pick a separate contextual random background cover (distinct from banner when possible)
  useEffect(() => {
    const candidates = filteredReleases.length ? filteredReleases : RELEASES;
    if (!candidates.length) return;
    let idxInAll = -1;
    for (let attempt = 0; attempt < 5; attempt++) {
      const idx = Math.floor(Math.random() * candidates.length);
      const id = candidates[idx].id;
      const found = RELEASES.findIndex((r) => r.id === id);
      if (found !== -1 && found !== bannerIndex) {
        idxInAll = found;
        break;
      }
      if (found !== -1) idxInAll = found; // fallback if all equal
    }
    if (idxInAll !== -1) setBackgroundIndex(idxInAll);
  }, [selectedFilter, filteredReleases, bannerIndex]);

  useEffect(() => {
    const audio = audioRef.current!;

    // Use actual track audio if available
    if (currentTrack?.path) {
      audio.src = getAssetUrl(currentTrack.path);
      setDuration(currentTrack.duration);
    } else {
      // Fallback to placeholder if no track
      audio.src = "https://www.soundjay.com/misc/sounds/button-1.mp3";
    }

    audio.volume = volume;

    const onLoaded = () => {
      if (!currentTrack?.duration) {
        setDuration(audio.duration || 0);
      }
    };
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => {
      // Auto-play next track when current ends
      if (currentRelease?.tracks && currentRelease.tracks.length > 0) {
        if (currentTrackIndex < currentRelease.tracks.length - 1) {
          setCurrentTrackIndex(currentTrackIndex + 1);
          return;
        }
      }
      const nextIndex = (currentIndex + 1) % RELEASES.length;
      setCurrentIndex(nextIndex);
      setCurrentTrackIndex(0);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [
    currentRelease,
    currentTrack,
    currentIndex,
    currentTrackIndex,
    isPlaying,
    volume,
  ]);

  const handlePlayPause = () => setIsPlaying((p) => !p);

  const handlePrev = () => {
    if (currentRelease?.tracks && currentRelease.tracks.length > 0) {
      // If we're not on the first track, go to previous track
      if (currentTrackIndex > 0) {
        setCurrentTrackIndex(currentTrackIndex - 1);
        return;
      }
    }
    // Otherwise go to previous release
    const prevIndex = (currentIndex - 1 + RELEASES.length) % RELEASES.length;
    setCurrentIndex(prevIndex);
    const prevRelease = RELEASES[prevIndex];
    if (prevRelease?.tracks && prevRelease.tracks.length > 0) {
      setCurrentTrackIndex(prevRelease.tracks.length - 1);
    } else {
      setCurrentTrackIndex(0);
    }
  };

  const handleNext = () => {
    if (currentRelease?.tracks && currentRelease.tracks.length > 0) {
      // If we're not on the last track, go to next track
      if (currentTrackIndex < currentRelease.tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
        return;
      }
    }
    // Otherwise go to next release
    const nextIndex = (currentIndex + 1) % RELEASES.length;
    setCurrentIndex(nextIndex);
    setCurrentTrackIndex(0);
  };
  const handleSeek = (time: number) => {
    const audio = audioRef.current!;
    audio.currentTime = time;
    setCurrentTime(time);
  };
  const handleBannerPlay = () => {
    if (
      currentIndex === bannerIndex &&
      currentTrackIndex === bannerTrackIndex
    ) {
      setIsPlaying((p) => !p);
    } else {
      setCurrentIndex(bannerIndex);
      setCurrentTrackIndex(bannerTrackIndex);
      setIsPlaying(true);
    }
  };
  const handleBannerSeek = (time: number) => {
    if (
      currentIndex !== bannerIndex ||
      currentTrackIndex !== bannerTrackIndex
    ) {
      setCurrentIndex(bannerIndex);
      setCurrentTrackIndex(bannerTrackIndex);
      setIsPlaying(true);
    }
    const audio = audioRef.current!;
    audio.currentTime = time;
    setCurrentTime(time);
  };
  const handleVolume = (vol: number) => {
    setVolume(vol);
    const audio = audioRef.current!;
    audio.volume = vol;
  };
  const enqueueAndPlay = (idx: number) => {
    setCurrentIndex(idx);
    setCurrentTrackIndex(0); // Start with first track
    setIsPlaying(true);
    setQueue((q) => [...q.filter((i) => i !== idx), idx]);
  };

  return (
    <div className="min-h-full grid grid-rows-[auto,1fr,auto]">
      {/* Global blurred background from random cover */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-neutral-950" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `url(${getAssetUrl(
              RELEASES[backgroundIndex]?.cover || ""
            )})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(28px) saturate(115%) brightness(0.6)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/40 to-neutral-950/80" />
      </div>
      <Navbar
        onOpenMobile={() => setMobileOpen(true)}
        onOpenQueue={() => setQueueOpen(true)}
      />
      <div
        className={`grid grid-cols-1 ${
          sidebarCollapsed
            ? "md:grid-cols-[4rem,1fr]"
            : "md:grid-cols-[16rem,1fr]"
        }`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
        <main className="min-h-[calc(100vh-12rem)] overflow-y-auto">
          <TopBannerPlayer
            release={bannerRelease}
            track={bannerTrack}
            isActive={
              isPlaying &&
              currentIndex === bannerIndex &&
              currentTrackIndex === bannerTrackIndex
            }
            currentTime={
              currentIndex === bannerIndex &&
              currentTrackIndex === bannerTrackIndex
                ? currentTime
                : 0
            }
            duration={
              bannerTrack?.duration ||
              (currentIndex === bannerIndex &&
              currentTrackIndex === bannerTrackIndex
                ? duration
                : 0)
            }
            onPlay={handleBannerPlay}
            onSeek={handleBannerSeek}
          />

          <AlbumGrid
            title={
              selectedFilter === "all"
                ? "All Releases"
                : selectedFilter === "album"
                ? "Albums"
                : selectedFilter === "ep"
                ? "EPs & Singles"
                : selectedFilter.startsWith("artist:")
                ? `${selectedFilter.replace("artist:", "")} - Releases`
                : "Releases"
            }
            releases={filteredReleases}
            onSelect={enqueueAndPlay}
          />
        </main>
      </div>
      <AudioPlayer
        release={currentRelease}
        track={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onPlayPause={handlePlayPause}
        onPrev={handlePrev}
        onNext={handleNext}
        onSeek={handleSeek}
        onVolume={handleVolume}
      />
      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-80 p-4 bg-neutral-900/40 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/30"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 pb-4">
              <img
                src="/formatLogo.svg"
                alt="Format416 Logo"
                className="h-12 w-12"
              />
              <div>
                <h2 className="text-lg font-thin font-jetbrains tracking-wide">
                  F416
                </h2>
                <p className="text-xs font-thin text-neutral-400">
                  Recordings: Toronto
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col gap-1">
                {[
                  { id: "all", label: "All Releases", icon: Library },
                  { id: "album", label: "Albums", icon: Music },
                  { id: "ep", label: "EPs & Singles", icon: List },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedFilter(item.id);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-left transition-colors ${
                      selectedFilter === item.id
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-300"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}

                <div className="mt-4 mb-2">
                  <span className="text-sm font-medium text-neutral-400">
                    Artists
                  </span>
                </div>

                {Array.from(
                  new Set(
                    RELEASES.map((r) => r.artist).filter(
                      (artist) =>
                        !artist.includes("Format416") &&
                        !artist.includes("Various")
                    )
                  )
                ).map((artist) => (
                  <button
                    key={artist}
                    onClick={() => {
                      setSelectedFilter(`artist:${artist}`);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-left transition-colors ${
                      selectedFilter === `artist:${artist}`
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-300"
                    }`}
                  >
                    <span className="truncate">{artist}</span>
                  </button>
                ))}

                <div className="mt-4 pt-4">
                  <a
                    className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300 transition-colors"
                    href="https://format416.bandcamp.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>Bandcamp Store</span>
                  </a>
                </div>
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Queue sheet */}
      <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
        <SheetContent
          side="right"
          className="w-96 p-4 bg-neutral-900/40 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/30"
        >
          <div className="text-lg font-semibold mb-4">Queue</div>
          <div className="space-y-2">
            {(queue.length
              ? queue
              : [currentIndex, ...RELEASES.map((_, i) => i).slice(0, 10)]
            ).map((idx) => (
              <button
                key={`q-${idx}`}
                onClick={() => enqueueAndPlay(idx)}
                className="w-full flex items-center gap-3 text-left p-2 hover:bg-neutral-900/50"
              >
                <img
                  src={getAssetUrl(RELEASES[idx].cover)}
                  alt={RELEASES[idx].title}
                  className="size-10 object-cover"
                />
                <div className="min-w-0">
                  <div className="text-sm truncate">{RELEASES[idx].title}</div>
                  <div className="text-xs text-neutral-400 truncate">
                    {RELEASES[idx].artist}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
