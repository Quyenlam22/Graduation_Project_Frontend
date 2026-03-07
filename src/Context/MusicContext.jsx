import { createContext, useState, useRef, useContext } from "react";
import { Howl } from "howler";
import { AppContext } from "./AppProvider";
import { getPreview } from "../services/songService";

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const { messageApi } = useContext(AppContext);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  // Trạng thái lặp bài hát
  const [isLoop, setIsLoop] = useState(false);

  const playerRef = useRef(null);
  const timerRef = useRef(null);

  const startPlaying = (song, audioUrl) => {
    if (playerRef.current) {
      playerRef.current.unload();
    }

    setCurrentSong({ ...song, src: audioUrl });

    playerRef.current = new Howl({
      src: [audioUrl],
      html5: true, 
      volume: isMuted ? 0 : volume,
      loop: isLoop, // Gán trạng thái lặp khi khởi tạo
      onplay: () => {
        setIsPlaying(true);
        setDuration(playerRef.current.duration());
        startTimer();
      },
      onpause: () => setIsPlaying(false),
      onend: () => {
        // Nếu không lặp, dừng timer khi kết thúc
        if (!isLoop) {
          setIsPlaying(false);
          clearInterval(timerRef.current);
        }
      },
      onloaderror: () => {
        messageApi.error("The audio file could not be loaded.");
        setIsLoading(false);
      }
    });

    playerRef.current.play();
    setIsLoading(false);
  };

  const playSong = async (song) => {
    const idToFetch = song.deezerId || song.id || song._id; 
    if (!idToFetch) {
      messageApi.error("The song information is incomplete.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await getPreview(idToFetch);
      if (result.success && result.preview) {
        startPlaying(song, result.preview);
      } else {
        throw new Error(result.message || "No music link provided.");
      }
    } catch (error) {
      messageApi.error("Unable to connect to the music server.");
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    playerRef.current.playing() ? playerRef.current.pause() : playerRef.current.play();
  };

  const handleVolumeChange = (value) => {
    const vol = value / 100;
    setVolume(vol);
    if (vol > 0) setIsMuted(false);
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

  // Logic bật/tắt lặp bài hát
  const toggleLoop = () => {
    const newLoopState = !isLoop;
    setIsLoop(newLoopState);
    if (playerRef.current) {
      playerRef.current.loop(newLoopState); // Cập nhật trực tiếp vào Howler
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.playing()) {
        const seek = playerRef.current.seek();
        setCurrentTime(seek);
        setProgress((seek / playerRef.current.duration()) * 100);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <MusicContext.Provider value={{
      currentSong, isPlaying, isLoading, currentTime, duration, progress, volume, isMuted, isLoop,
      playSong, togglePlay, handleSeek, handleVolumeChange, toggleMute, toggleLoop, formatTime,
    }}>
      {children}
    </MusicContext.Provider>
  );
};