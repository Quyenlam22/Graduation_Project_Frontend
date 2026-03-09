import { createContext, useState, useRef, useContext, useEffect } from "react";
import { Howl } from "howler";
import { AppContext } from "./AppProvider";
import { getPreview } from "../services/songService";

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const { messageApi } = useContext(AppContext);
  
  // --- TRẠNG THÁI PHÁT NHẠC (UI STATE) ---
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // --- TRẠNG THÁI ĐIỀU KHIỂN ---
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.7);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false); // Trạng thái Shuffle

  // --- TRẠNG THÁI HÀNG ĐỢI (QUEUE) ---
  const [playQueue, setPlayQueue] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(-1);

  // --- SỬ DỤNG REF ĐỂ TRÁNH LỖI GIÁ TRỊ CŨ (STALE CLOSURE) ---
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const isLoopRef = useRef(isLoop);
  const isShuffleRef = useRef(isShuffle);
  const playQueueRef = useRef(playQueue);
  const currentIndexRef = useRef(currentIndex);

  // Cập nhật Ref mỗi khi State thay đổi
  useEffect(() => { isLoopRef.current = isLoop; }, [isLoop]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { playQueueRef.current = playQueue; }, [playQueue]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // 1. Hàm khởi tạo Howler và bắt đầu phát
  const startPlaying = (song, audioUrl) => {
    if (playerRef.current) {
      playerRef.current.unload();
    }

    setCurrentSong({ ...song, src: audioUrl });

    playerRef.current = new Howl({
      src: [audioUrl],
      html5: true, 
      volume: isMuted ? 0 : volume,
      loop: false, // Luôn để false để onend có thể kích hoạt
      onplay: () => {
        setIsPlaying(true);
        setDuration(playerRef.current.duration());
        startTimer();
      },
      onpause: () => setIsPlaying(false),
      onend: () => {
        // Kiểm tra logic: Ưu tiên Loop -> Sau đó mới đến Next/Shuffle
        if (isLoopRef.current) {
          playerRef.current.play(); 
        } else {
          handleNext(); 
        }
      },
      onloaderror: () => {
        messageApi.error("Không thể tải file âm thanh.");
        setIsLoading(false);
      }
    });

    playerRef.current.play();
    setIsLoading(false);
  };

  // 2. Hàm playSong: Nhận bài hát và danh sách đi kèm
  const playSong = async (song, list = []) => {
    const newList = list.length > 0 ? list : [song];
    const index = newList.findIndex(s => (s.deezerId || s._id) === (song.deezerId || song._id));
    
    setPlayQueue(newList);
    setCurrentIndex(index !== -1 ? index : 0);
    
    // Cập nhật Ref ngay lập tức cho các hàm điều hướng
    playQueueRef.current = newList;
    currentIndexRef.current = index !== -1 ? index : 0;

    const idToFetch = song.deezerId || song.id || song._id; 
    if (!idToFetch) return;

    setIsLoading(true);
    try {
      const result = await getPreview(idToFetch);
      if (result.success && result.preview) {
        startPlaying(song, result.preview);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  // 3. Logic Chuyển bài (Next/Prev) tích hợp Shuffle
  const handleNext = () => {
    const queue = playQueueRef.current;
    const idx = currentIndexRef.current;

    if (queue.length === 0) return;
    
    let nextIndex;
    if (isShuffleRef.current) {
      // Logic phát ngẫu nhiên: chọn 1 index bất kỳ trong queue
      nextIndex = Math.floor(Math.random() * queue.length);
      // Tránh phát trùng bài cũ nếu danh sách có nhiều bài
      if (nextIndex === idx && queue.length > 1) {
        nextIndex = (nextIndex + 1) % queue.length;
      }
    } else {
      // Phát theo thứ tự tuần tự
      nextIndex = idx + 1;
      if (nextIndex >= queue.length) nextIndex = 0; 
    }

    playSong(queue[nextIndex], queue);
  };

  const handlePrev = () => {
    const queue = playQueueRef.current;
    const idx = currentIndexRef.current;

    if (queue.length === 0) return;
    
    let prevIndex = idx - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1; 

    playSong(queue[prevIndex], queue);
  };

  // 4. Các hàm điều khiển Player
  const togglePlay = () => {
    if (!playerRef.current) return;
    playerRef.current.playing() ? playerRef.current.pause() : playerRef.current.play();
  };

  const toggleLoop = () => setIsLoop(!isLoop);
  
  const toggleShuffle = () => setIsShuffle(!isShuffle); // Chuyển đổi trạng thái Shuffle

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
      currentSong, isPlaying, isLoading, currentTime, duration, progress, 
      volume, isMuted, isLoop, isShuffle, playQueue, currentIndex,
      playSong, togglePlay, handleSeek, handleVolumeChange, 
      toggleMute, toggleLoop, toggleShuffle, formatTime, handleNext, handlePrev
    }}>
      {children}
    </MusicContext.Provider>
  );
};