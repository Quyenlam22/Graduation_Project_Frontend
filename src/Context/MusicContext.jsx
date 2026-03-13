import { createContext, useState, useRef, useContext, useEffect } from "react";
import { Howl } from "howler";
import { AppContext } from "./AppProvider";
import { getPreview } from "../services/songService";

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const { messageApi } = useContext(AppContext);
  
  const savedSong = JSON.parse(localStorage.getItem('muzia_current_song'));
  const savedQueue = JSON.parse(localStorage.getItem('muzia_play_queue')) || [];
  const savedIndex = parseInt(localStorage.getItem('muzia_current_index')) || -1;
  const savedTime = parseFloat(localStorage.getItem('muzia_current_time')) || 0;
  const savedVolume = parseFloat(localStorage.getItem('muzia_volume')) || 0.7;

  const [currentSong, setCurrentSong] = useState(savedSong);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(savedTime);
  const [duration, setDuration] = useState(0);
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

  const initPlayer = (audioUrl, autoPlay = true) => {
    if (playerRef.current) playerRef.current.unload();
    playerRef.current = new Howl({
      src: [audioUrl],
      html5: true, 
      volume: isMutedRef.current ? 0 : volumeRef.current, 
      onplay: () => { setIsPlaying(true); setDuration(playerRef.current.duration()); startTimer(); },
      onpause: () => setIsPlaying(false),
      onend: () => { if (isLoopRef.current) playerRef.current.play(); else handleNext(); },
      onload: () => {
        if (!autoPlay && savedTime > 0) {
            playerRef.current.seek(savedTime);
            setDuration(playerRef.current.duration());
            setProgress((savedTime / playerRef.current.duration()) * 100);
        }
      }
    });
    if (autoPlay) playerRef.current.play();
  };

  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('muzia_current_song', JSON.stringify(currentSong));
      if (!playerRef.current && currentSong.src) initPlayer(currentSong.src, false); 
    }
  }, [currentSong]);

  const handleNext = () => {
    const queue = playQueueRef.current;
    const idx = currentIndexRef.current;
    if (queue.length === 0) return;
    let nextIndex = isShuffleRef.current ? Math.floor(Math.random() * queue.length) : (idx + 1) % queue.length;
    playSong(queue[nextIndex], queue);
  };

  const playSong = async (song, list = []) => {
    const newList = list.length > 0 ? list : [song];
    const index = newList.findIndex(s => (s.deezerId || s._id) === (song.deezerId || song._id));
    setPlayQueue(newList);
    setCurrentIndex(index !== -1 ? index : 0);
    const idToFetch = song.deezerId || song.id || song._id; 
    if (!idToFetch) return;
    setIsLoading(true);
    try {
      const result = await getPreview(idToFetch);
      if (result.success && result.preview) {
          setCurrentSong({ ...song, src: result.preview });
          initPlayer(result.preview, true);
      }
    } catch (error) { setIsLoading(false); }
    finally { setIsLoading(false); }
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
      isMutedRef.current = false;
    } else {
      setPrevVolume(volume);
      handleVolumeChange(0);
      setIsMuted(true);
      isMutedRef.current = true;
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.playing()) {
        const seek = playerRef.current.seek();
        setCurrentTime(seek);
        setProgress((seek / playerRef.current.duration()) * 100);
        localStorage.setItem('muzia_current_time', seek);
      }
    }, 1000);
  };

  const handleSeek = (value) => {
    if (!playerRef.current) return;
    const time = (value / 100) * duration;
    playerRef.current.seek(time);
    setProgress(value);
    setCurrentTime(time);
  };

  const togglePlay = () => { if (playerRef.current) playerRef.current.playing() ? playerRef.current.pause() : playerRef.current.play(); };
  const toggleLoop = () => setIsLoop(!isLoop);
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const handlePrev = () => { /* Logic tương tự handleNext */ };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, isLoading, currentTime, duration, progress, volume, isMuted, isLoop, isShuffle, playQueue, currentIndex,
      playSong, togglePlay, handleSeek, handleVolumeChange, toggleMute, toggleLoop, toggleShuffle, formatTime, handleNext, handlePrev
    }}>
      {children}
    </MusicContext.Provider>
  );
};