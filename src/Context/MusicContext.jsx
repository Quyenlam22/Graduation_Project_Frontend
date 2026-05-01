import { createContext, useState, useRef, useEffect, useCallback } from "react";
import { Howl } from "howler";
import { getPreview } from "../services/songService";

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const savedSong = JSON.parse(localStorage.getItem('muzia_current_song'));
  const savedQueue = JSON.parse(localStorage.getItem('muzia_play_queue')) || [];
  const savedIndex = parseInt(localStorage.getItem('muzia_current_index')) || -1;
  const savedTime = parseFloat(localStorage.getItem('muzia_current_time')) || 0;
  const savedVolume = parseFloat(localStorage.getItem('muzia_volume')) || 0.7;

  const [queueTitle, setQueueTitle] = useState(localStorage.getItem('muzia_queue_title') || "");
  const [currentSong, setCurrentSong] = useState(savedSong);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(savedTime);
  const [duration, setDuration] = useState(savedSong?.duration || 0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(savedVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(savedVolume);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playQueue, setPlayQueue] = useState(savedQueue);
  const [currentIndex, setCurrentIndex] = useState(savedIndex);

  const playerRef = useRef(null);
  const timerRef = useRef(null);

  const isLoopRef = useRef(isLoop);
  const isShuffleRef = useRef(isShuffle);
  const playQueueRef = useRef(playQueue);
  const currentIndexRef = useRef(currentIndex);
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);

  useEffect(() => { isLoopRef.current = isLoop; }, [isLoop]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => {
    playQueueRef.current = playQueue;
    localStorage.setItem('muzia_play_queue', JSON.stringify(playQueue));
  }, [playQueue]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
    localStorage.setItem('muzia_current_index', currentIndex);
  }, [currentIndex]);
  useEffect(() => {
    volumeRef.current = volume;
    localStorage.setItem('muzia_volume', volume);
  }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.playing()) {
        const seek = playerRef.current.seek();
        setCurrentTime(seek);
        const d = playerRef.current.duration();
        if (d) setProgress((seek / d) * 100);
        localStorage.setItem('muzia_current_time', seek);
      }
    }, 1000);
  };

  const playSong = async (song, list = [], title = "") => {
    if (title) {
      setQueueTitle(title);
      localStorage.setItem('muzia_queue_title', title);
    }
    const newList = list.length > 0 ? list : [song];
    const index = newList.findIndex(s => s._id === song._id);

    setPlayQueue(newList);
    setCurrentIndex(index !== -1 ? index : 0);
    setIsLoading(true);

    try {
      const idToFetch = song.deezerId || song._id;
      const result = await getPreview(idToFetch);
      if (result.success && result.preview) {
        const updatedSong = { ...song, src: result.preview };
        setCurrentSong(updatedSong);
        initPlayer(result.preview, true);
      }
    } catch (error) {
      console.error("Play Song Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    const queue = playQueueRef.current;
    if (queue.length === 0) return;
    let nextIndex = isShuffleRef.current
      ? Math.floor(Math.random() * queue.length)
      : (currentIndexRef.current + 1) % queue.length;
    playSong(queue[nextIndex], queue);
  }, []);

  const handlePrev = useCallback(() => {
    const queue = playQueueRef.current;
    if (queue.length === 0) return;
    let prevIndex = (currentIndexRef.current - 1 + queue.length) % queue.length;
    playSong(queue[prevIndex], queue);
  }, []);

  const initPlayer = useCallback((audioUrl, autoPlay = true) => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.unload();
      playerRef.current = null;
    }

    playerRef.current = new Howl({
      src: [audioUrl],
      html5: true,
      volume: isMutedRef.current ? 0 : volumeRef.current,
      onplay: () => {
        setIsPlaying(true);
        setDuration(playerRef.current.duration());
        startTimer();
      },
      onpause: () => setIsPlaying(false),
      onend: () => {
        if (isLoopRef.current) playerRef.current.play();
        else handleNext();
      },
      onload: () => {
        const d = playerRef.current.duration();
        setDuration(d);
        if (!autoPlay && savedTime > 0) {
          playerRef.current.seek(savedTime);
          setCurrentTime(savedTime);
          setProgress((savedTime / d) * 100);
        }
      },
      onplayerror: (id, err) => {
        setIsPlaying(false);
        setIsLoading(false);
        console.error("Howl Play Error:", err);
      }
    });

    if (autoPlay) playerRef.current.play();
  }, [handleNext, savedTime]);

  const togglePlay = async () => {
    if (!playerRef.current || !currentSong) return;

    if (playerRef.current.playing()) {
      playerRef.current.pause();
    } else {
      if (playerRef.current.state() === 'loaded') {
        playerRef.current.play();
      } else {
        setIsLoading(true);
        try {
          const result = await getPreview(currentSong.deezerId || currentSong._id);
          if (result.success && result.preview) {
            initPlayer(result.preview, true);
          }
        } catch (error) {
          playerRef.current.play();
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleSeek = (value) => {
    if (!playerRef.current) return;
    const time = (value / 100) * playerRef.current.duration();
    playerRef.current.seek(time);
    setProgress(value);
    setCurrentTime(time);
  };

  const handleVolumeChange = (value) => {
    const vol = value / 100;
    setVolume(vol);
    volumeRef.current = vol;
    if (vol > 0) { setIsMuted(false); isMutedRef.current = false; }
    if (playerRef.current) playerRef.current.volume(vol);
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(prevVolume * 100);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      handleVolumeChange(0);
      setIsMuted(true);
    }
  };

  const toggleLoop = () => setIsLoop(prev => !prev);
  const toggleShuffle = () => setIsShuffle(prev => !prev);

  useEffect(() => {
    const refreshInitialSong = async () => {
      if (savedSong && !playerRef.current) {
        try {
          const idToFetch = savedSong.deezerId || savedSong._id;
          const result = await getPreview(idToFetch);
          if (result.success && result.preview) {
            const freshSong = { ...savedSong, src: result.preview };
            setCurrentSong(freshSong);
            initPlayer(result.preview, false);
          }
        } catch (error) {
          console.error("Refresh initial song failed", error);
        }
      }
    };
    refreshInitialSong();
  }, [initPlayer]);

  useEffect(() => {
    if (currentSong) localStorage.setItem('muzia_current_song', JSON.stringify(currentSong));
  }, [currentSong]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playerRef.current) playerRef.current.unload();
    };
  }, []);

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, isLoading, currentTime, duration, progress, volume, isMuted, isLoop, isShuffle, playQueue, currentIndex, queueTitle,
      playSong, togglePlay, handleSeek, handleVolumeChange, toggleMute, toggleLoop, toggleShuffle, formatTime, handleNext, handlePrev
    }}>
      {children}
    </MusicContext.Provider>
  );
};