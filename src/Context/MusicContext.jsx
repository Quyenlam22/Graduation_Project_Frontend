import { createContext, useState, useRef, useEffect, useCallback, useContext } from "react";
import { Howl } from "howler";
import { getPreview } from "../services/songService";
import { AppContext } from '../Context/AppProvider';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [queueTitle, setQueueTitle] = useState(localStorage.getItem('muzia_queue_title') || "");

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
  
  const { messageApi } = useContext(AppContext);

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
    // Giải phóng bộ nhớ cũ để tránh lỗi "Audio pool exhausted"
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
        if (!autoPlay && savedTime > 0) {
            playerRef.current.seek(savedTime);
            setDuration(playerRef.current.duration());
            setProgress((savedTime / playerRef.current.duration()) * 100);
        }
      },
      onplayerror: () => {
        setIsPlaying(false);
        message.error("Music playback error. Trying to refresh the link...");
        // Tự động thử lại bằng cách fetch link mới
        if (currentSong) playSong(currentSong, playQueueRef.current);
      }
    });

    if (autoPlay) playerRef.current.play();
  };

  // --- 4. CƠ CHẾ LÀM TƯƠI LINK KHI MỞ APP ---
  useEffect(() => {
    const refreshInitialSong = async () => {
      if (savedSong && !playerRef.current) {
        try {
          // Lấy ID chuẩn (hỗ trợ cả Local và Deezer dz_...)
          const idToFetch = savedSong.deezerId || savedSong._id;
          const result = await getPreview(idToFetch);
          
          if (result.success && result.preview) {
            const freshSong = { ...savedSong, src: result.preview };
            setCurrentSong(freshSong);
            initPlayer(result.preview, false);
          } else if (savedSong.src) {
            // Nếu API lỗi, fallback dùng link cũ trong máy
            initPlayer(savedSong.src, false);
          }
        } catch (error) {
          if (savedSong.src) initPlayer(savedSong.src, false);
        }
      }
    };
    refreshInitialSong();
  }, []);

  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('muzia_current_song', JSON.stringify(currentSong));
    }
  }, [currentSong]);

  // --- 5. ĐIỀU KHIỂN DANH SÁCH PHÁT ---
  const handleNext = useCallback(() => {
    const queue = playQueueRef.current;
    const idx = currentIndexRef.current;
    if (queue.length === 0) return;
    let nextIndex = isShuffleRef.current ? Math.floor(Math.random() * queue.length) : (idx + 1) % queue.length;
    playSong(queue[nextIndex], queue);
  }, []);

  const handlePrev = useCallback(() => {
    const queue = playQueueRef.current;
    const idx = currentIndexRef.current;
    if (queue.length === 0) return;
    let prevIndex = (idx - 1 + queue.length) % queue.length;
    playSong(queue[prevIndex], queue);
  }, []);

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
      } else {
          message.error("No music source found!");
      }
    } catch (error) { 
        console.error(error);
    } finally { 
        setIsLoading(false); 
    }
  };

  const togglePlay = async () => { 
    if (!playerRef.current || !currentSong) return;

    if (playerRef.current.playing()) {
        playerRef.current.pause();
    } else {
        // Mỗi khi bấm Play, ta kiểm tra/làm mới link một lần nữa để chắc chắn
        setIsLoading(true);
        try {
            const result = await getPreview(currentSong._id);
            if (result.success && result.preview) {
                if (result.preview !== currentSong.src) {
                    const seekPos = playerRef.current.seek();
                    setCurrentSong(prev => ({ ...prev, src: result.preview }));
                    initPlayer(result.preview, true);
                    playerRef.current.seek(seekPos);
                } else {
                    playerRef.current.play();
                }
            } else {
                playerRef.current.play();
            }
        } catch (error) {
            playerRef.current.play();
        } finally {
            setIsLoading(false);
        }
    }
  };

  // --- 6. TIMER, VOLUME & UTILS ---
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

  const handleSeek = (value) => {
    if (!playerRef.current) return;
    const time = (value / 100) * playerRef.current.duration();
    playerRef.current.seek(time);
    setProgress(value);
    setCurrentTime(time);
  };

  const toggleLoop = () => setIsLoop(!isLoop);
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Dọn dẹp khi Component bị hủy
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