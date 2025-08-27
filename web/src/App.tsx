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
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./components/ui/dropdown-menu";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./components/ui/tooltip";
import { Sheet, SheetContent, SheetClose } from "./components/ui/sheet";
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

function useThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);
  return {
    theme,
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  };
}

function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col gap-6 p-4 border-r border-neutral-800">
      <div className="flex items-center gap-2 text-xl font-semibold">
        <div className="size-8 grid place-items-center rounded bg-gradient-to-br from-blue-500 to-purple-600">
          <span className="text-white font-bold text-xs">416</span>
        </div>
        Format416 Recordings
      </div>

      <nav className="flex flex-col gap-1">
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="#"
        >
          <Library className="size-4" /> All Releases
        </a>
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="#"
        >
          <Music className="size-4" /> Albums
        </a>
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="#"
        >
          <List className="size-4" /> EPs & Singles
        </a>
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="#"
        >
          <Search className="size-4" /> Artists
        </a>
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="https://format416.bandcamp.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Heart className="size-4" /> Bandcamp Store
        </a>
      </nav>

      <div className="mt-auto">
        <Button
          variant="outline"
          className="w-full justify-center gap-2"
          onClick={() =>
            window.open("https://format416.bandcamp.com/", "_blank")
          }
        >
          <Heart className="size-4" /> Visit Store
        </Button>
        <p className="mt-2 text-xs muted">Support our artists on Bandcamp</p>
      </div>
    </aside>
  );
}

function Navbar({
  onToggleTheme,
  theme,
  onOpenMobile,
  onOpenQueue,
}: {
  onToggleTheme: () => void;
  theme: "light" | "dark";
  onOpenMobile: () => void;
  onOpenQueue: () => void;
}) {
  return (
    <header className="h-14 border-b border-neutral-800 flex items-center px-4 gap-2">
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
      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <div className="md:hidden size-6 grid place-items-center rounded bg-gradient-to-br from-blue-500 to-purple-600 mr-2">
          <span className="text-white font-bold text-xs">416</span>
        </div>
        Format416 Catalog
      </div>
      <div className="ml-auto flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleTheme}
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-sm">
              Languages
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>हिंदी</DropdownMenuItem>
            <DropdownMenuItem>தமிழ்</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>System default</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="default" className="text-sm">
          Sign in
        </Button>
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
      className="group bg-neutral-900/60 cursor-pointer hover:bg-neutral-900/80 transition-colors"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={release.cover}
          alt={`${release.title} cover`}
          className="w-full h-44 object-cover rounded-xl"
        />
        <Button
          aria-label={`Play ${release.title}`}
          title={`Play ${release.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition"
        >
          <Play className="size-4" />
        </Button>
      </div>
      <div className="p-3">
        <div className="text-sm font-medium truncate">{release.title}</div>
        <div className="text-xs text-neutral-400 truncate">
          {release.artist}
        </div>
        <div className="text-xs text-neutral-500 truncate">
          {release.type} • {release.duration}
        </div>
      </div>
    </Card>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
    <footer className="h-20 border-t border-neutral-800 px-4 flex items-center gap-4 sticky bottom-0 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={release.cover}
          className="size-12 rounded object-cover"
          alt="cover"
        />
        <div className="min-w-0">
          <div className="text-sm truncate">{release.title}</div>
          <div className="text-xs text-neutral-400 truncate">
            {release.artist}
          </div>
        </div>
        <Heart className="size-4 text-neutral-400" />
      </div>
      <div className="flex-1 flex flex-col items-center gap-1">
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
  const { theme, toggle } = useThemeToggle();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [queue, setQueue] = useState<number[]>([]);

  // Lazily create audio element once
  if (audioRef.current === null) {
    audioRef.current = new Audio();
  }

  const currentRelease = useMemo(() => RELEASES[currentIndex], [currentIndex]);

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
        onToggleTheme={toggle}
        theme={theme}
        onOpenMobile={() => setMobileOpen(true)}
        onOpenQueue={() => setQueueOpen(true)}
      />
      <div className="grid grid-cols-[0,1fr] md:grid-cols-[16rem,1fr]">
        <Sidebar />
        <main className="min-h-[calc(100vh-5rem)] overflow-y-auto">
          <AlbumGrid
            title="Latest Releases"
            releases={RELEASES.slice(0, 6)}
            onSelect={enqueueAndPlay}
          />
          <AlbumGrid
            title="Full Albums"
            releases={RELEASES.filter((r) => r.type === "album")}
            onSelect={enqueueAndPlay}
          />
          <AlbumGrid
            title="EPs & Singles"
            releases={RELEASES.filter(
              (r) => r.type === "ep" || r.type === "compilation"
            )}
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
        <SheetContent side="left">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 grid place-items-center rounded bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-white font-bold text-xs">416</span>
            </div>
            Format416 Recordings
          </div>
          <div className="h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <Sidebar />
          </div>
          <SheetClose asChild>
            <Button variant="outline" className="mt-4 w-full">
              Close
            </Button>
          </SheetClose>
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
