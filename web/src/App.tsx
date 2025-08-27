import { useEffect, useMemo, useRef, useState } from "react";
import {
  Music,
  Search,
  Library,
  Plus,
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

type Track = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  duration: string;
};

const MOCK_TRACKS: Track[] = Array.from({ length: 16 }).map((_, i) => ({
  id: String(i + 1),
  title:
    ["Saiyaara", "Ehsas", "Radhe Radhe", "Raja Hindustani"][i % 4] +
    ` ${i + 1}`,
  artist: ["Various Artists", "Pritam", "Nadeem-Shravan"][i % 3],
  cover: `https://picsum.photos/seed/cover${i}/400/400`,
  src: `https://cdn.pixabay.com/download/audio/2022/10/24/audio_0f7b6f8f52.mp3?filename=sample-${i}.mp3`,
  duration: `${3 + (i % 2)}:${(30 + i) % 60}`,
}));

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
        <div className="size-8 grid place-items-center rounded bg-neutral-800">
          <Music className="size-5" />
        </div>
        infinitunes
      </div>

      <nav className="flex flex-col gap-1">
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="#"
        >
          <Search className="size-4" /> Top Albums
        </a>
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="#"
        >
          <List className="size-4" /> Top Charts
        </a>
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="#"
        >
          <Library className="size-4" /> Top Playlists
        </a>
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="#"
        >
          <Library className="size-4" /> Podcasts
        </a>
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="#"
        >
          <Library className="size-4" /> Top Artists
        </a>
        <a
          className="flex items-center gap-3 px-2 py-2 rounded hover:bg-neutral-900 text-neutral-300"
          href="#"
        >
          <Library className="size-4" /> Radio
        </a>
      </nav>

      <div className="mt-auto">
        <Button variant="outline" className="w-full justify-center gap-2">
          <Plus className="size-4" /> Create Playlist
        </Button>
        <p className="mt-2 text-xs muted">
          You need to be logged in to create a playlist.
        </p>
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
        Discover
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

function AlbumCard({ track, onPlay }: { track: Track; onPlay: () => void }) {
  return (
    <Card className="group bg-neutral-900/60">
      <div className="relative">
        <img
          src={track.cover}
          alt="cover"
          className="w-full h-44 object-cover rounded-xl"
        />
        <Button
          aria-label="Play album"
          title="Play album"
          onClick={onPlay}
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition"
        >
          <Play className="size-4" />
        </Button>
      </div>
      <div className="p-3">
        <div className="text-sm font-medium truncate">{track.title}</div>
        <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
      </div>
    </Card>
  );
}

function AlbumGrid({
  onSelect,
  title = "Discover",
}: {
  onSelect: (index: number) => void;
  title?: string;
}) {
  return (
    <section className="p-4">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {MOCK_TRACKS.map((t, idx) => (
          <AlbumCard key={t.id} track={t} onPlay={() => onSelect(idx)} />
        ))}
      </div>
    </section>
  );
}

function AudioPlayer({
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
  track: Track;
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
          src={track.cover}
          className="size-12 rounded object-cover"
          alt="cover"
        />
        <div className="min-w-0">
          <div className="text-sm truncate">{track.title}</div>
          <div className="text-xs text-neutral-400 truncate">
            {track.artist}
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

  const currentTrack = useMemo(() => MOCK_TRACKS[currentIndex], [currentIndex]);

  useEffect(() => {
    const audio = audioRef.current!;
    audio.src = currentTrack.src;
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
  }, [currentTrack, isPlaying, volume]);

  const handlePlayPause = () => setIsPlaying((p) => !p);
  const handlePrev = () =>
    setCurrentIndex((i) => (i - 1 + MOCK_TRACKS.length) % MOCK_TRACKS.length);
  const handleNext = () => setCurrentIndex((i) => (i + 1) % MOCK_TRACKS.length);
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
          <AlbumGrid title="Discover" onSelect={enqueueAndPlay} />
          <AlbumGrid title="Trending Today" onSelect={enqueueAndPlay} />
          <AlbumGrid title="Most Searched Songs" onSelect={enqueueAndPlay} />
        </main>
      </div>
      <AudioPlayer
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
        <SheetContent side="left">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 grid place-items-center rounded bg-neutral-800">
              <Music className="size-5" />
            </div>
            infinitunes
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
              : [currentIndex, ...MOCK_TRACKS.map((_, i) => i).slice(0, 10)]
            ).map((idx) => (
              <button
                key={`q-${idx}`}
                onClick={() => enqueueAndPlay(idx)}
                className="w-full flex items-center gap-3 text-left p-2 rounded hover:bg-neutral-900"
              >
                <img
                  src={MOCK_TRACKS[idx].cover}
                  alt={MOCK_TRACKS[idx].title}
                  className="size-10 rounded object-cover"
                />
                <div className="min-w-0">
                  <div className="text-sm truncate">
                    {MOCK_TRACKS[idx].title}
                  </div>
                  <div className="text-xs text-neutral-400 truncate">
                    {MOCK_TRACKS[idx].artist}
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
