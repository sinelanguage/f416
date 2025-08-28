import { useEffect, useMemo, useRef, useState } from "react";
import {
  Music,
  Search,
  Library,
  Heart,
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

type Release = {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  cover: string;
  url: string;
  duration: string;
  type: "album" | "ep" | "compilation";
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
      } shrink-0 flex-col gap-4 p-4 transition-all duration-300`}
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
            <item.icon className="size-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
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
                <Search className="size-4 shrink-0" />
                <span className="truncate">{artist}</span>
              </button>
            ))}

            <div className="mt-4 pt-4">
              <a
                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300 transition-colors"
                href="https://format416.bandcamp.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Heart className="size-4" /> Bandcamp Store
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
    <header className="h-24 flex items-center px-4 gap-3 sticky top-0 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60 z-50">
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
      className="group bg-neutral-900/80 cursor-pointer hover:bg-neutral-900/90 transition-colors"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={release.cover}
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
      <div className="p-2 md:p-3">
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

function HeroSection({
  currentRelease,
  onPlay,
  isPlaying,
}: {
  currentRelease: Release;
  onPlay: () => void;
  isPlaying: boolean;
}) {
  return (
    <div className="relative h-80 bg-gradient-to-b from-neutral-800 to-neutral-900 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-30">
        <img
          src={currentRelease.cover}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 text-white">
        <div className="mb-4">
          <p className="text-sm opacity-80 mb-1">Now Playing</p>
          <h1 className="text-2xl font-bold mb-1">{currentRelease.title}</h1>
          <p className="text-lg opacity-90">{currentRelease.artist}</p>
          <p className="text-sm opacity-70 mt-1">
            {currentRelease.type} • {currentRelease.duration}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={onPlay}
            size="icon"
            className="size-12 rounded-full bg-white text-black hover:bg-gray-200"
          >
            {isPlaying ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-white hover:bg-white/20"
            onClick={() => window.open(currentRelease.url, "_blank")}
          >
            <Heart className="size-5" />
          </Button>
        </div>
      </div>
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
    <footer className="h-16 md:h-20 px-3 md:px-4 flex items-center gap-2 md:gap-4 sticky bottom-0 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 md:flex-initial">
        <img
          src={release.cover}
          className="size-10 md:size-12 rounded object-cover"
          alt="cover"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs md:text-sm truncate">{release.title}</div>
          <div className="text-xs text-neutral-400 truncate">
            {release.artist}
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

  // Lazily create audio element once
  if (audioRef.current === null) {
    audioRef.current = new Audio();
  }

  const currentRelease = useMemo(() => RELEASES[currentIndex], [currentIndex]);

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

  useEffect(() => {
    const audio = audioRef.current!;
    // For demo purposes, we'll use a placeholder audio source
    audio.src = "https://www.soundjay.com/misc/sounds/button-1.mp3";
    audio.volume = volume;
    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, [currentRelease, isPlaying, volume]);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handlePrev = () =>
    setCurrentIndex((i) => (i - 1 + RELEASES.length) % RELEASES.length);
  const handleNext = () => setCurrentIndex((i) => (i + 1) % RELEASES.length);
  const handleSeek = (time: number) => {
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
    setIsPlaying(true);
    setQueue((q) => [...q.filter((i) => i !== idx), idx]);
  };

  return (
    <div className="min-h-full grid grid-rows-[auto,1fr,auto]">
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
          {/* Mobile Hero Section */}
          <div className="md:hidden">
            <HeroSection
              currentRelease={currentRelease}
              onPlay={() => handlePlayPause()}
              isPlaying={isPlaying}
            />
          </div>

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
        <SheetContent side="left" className="w-80">
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
                    <item.icon className="size-4 shrink-0" />
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
                    <Search className="size-4 shrink-0" />
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
                    <Heart className="size-4" /> Bandcamp Store
                  </a>
                </div>
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Queue sheet */}
      <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
        <SheetContent side="right">
          <div className="text-lg font-semibold mb-4">Queue</div>
          <div className="space-y-2">
            {(queue.length
              ? queue
              : [currentIndex, ...RELEASES.map((_, i) => i).slice(0, 10)]
            ).map((idx) => (
              <button
                key={`q-${idx}`}
                onClick={() => enqueueAndPlay(idx)}
                className="w-full flex items-center gap-3 text-left p-2 rounded hover:bg-neutral-900"
              >
                <img
                  src={RELEASES[idx].cover}
                  alt={RELEASES[idx].title}
                  className="size-10 rounded object-cover"
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
