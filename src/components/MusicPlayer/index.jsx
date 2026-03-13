import { useContext, useEffect } from "react";
import { Flex, Avatar, Slider, message } from "antd";
import { 
  StepBackwardOutlined, StepForwardOutlined, RetweetOutlined, 
  HeartOutlined, HeartFilled, ExpandOutlined, UnorderedListOutlined, 
  SoundOutlined, MutedOutlined, PlayCircleFilled, PauseCircleFilled,
  LoadingOutlined
} from "@ant-design/icons";
import { TiArrowShuffle } from "react-icons/ti";
import { MusicContext } from "../../Context/MusicContext";
import { AuthContext } from "../../Context/AuthProvider";
import { toggleFavorite } from "../../services/authService";

function MusicPlayer() {
  const { user, setUser } = useContext(AuthContext);
  const {
    currentSong, isPlaying, isLoading, currentTime, duration, progress, volume, isMuted, 
    isLoop, isShuffle,
    togglePlay, handleSeek, handleVolumeChange, toggleMute, toggleLoop, 
    toggleShuffle, formatTime, handleNext, handlePrev
  } = useContext(MusicContext);

  // --- LOGIC YÊU THÍCH ---
  const handleToggleFavorite = async (e) => {
    if (e) e.stopPropagation();
    if (!user) {
      message.error("Please log in to use this feature!");
      return;
    }

    try {
      const response = await toggleFavorite({
        uid: user.uid,
        type: 'songs',
        itemId: currentSong._id
      });
      
      if (response.success) {
        setUser({
          ...user,
          favorites: {
            ...user.favorites,
            songs: response.updatedFavorites
          }
        });
        message.success(response.updatedFavorites.includes(currentSong._id) ? "Added to favorites" : "Removed from favorites");
      }
    } catch (error) {
      message.error("An error occurred, please try again later.");
    }
  };

  // --- LẮNG NGHE LỆNH TỪ AI CHATBOT ---
  useEffect(() => {
    const onVoiceControl = (e) => {
      const action = e.detail;
      console.log("Muzia Command Received:", action);

      switch (action) {
        case 'play': if (!isPlaying) togglePlay(); break;
        case 'pause': if (isPlaying) togglePlay(); break;
        case 'next': handleNext(); break;
        case 'prev': handlePrev(); break;
        case 'mute': if (!isMuted) toggleMute(); break;
        case 'unmute': if (isMuted) toggleMute(); break;
        case 'shuffle': if (!isShuffle) toggleShuffle(); break;
        case 'unshuffle': if (isShuffle) toggleShuffle(); break;
        case 'loop': if (!isLoop) toggleLoop(); break;
        case 'unloop': if (isLoop) toggleLoop(); break;
        default: break;
      }
    };

    window.addEventListener('muzia-control', onVoiceControl);
    return () => window.removeEventListener('muzia-control', onVoiceControl);
  }, [isPlaying, isMuted, isLoop, isShuffle, togglePlay, toggleMute, toggleLoop, toggleShuffle, handleNext, handlePrev]);

  if (!currentSong) return null;

  return (
    <footer className="music-footer">
        <Flex align="center" className="song-info">
            <Avatar shape="circle" size={60} src={currentSong.cover || currentSong.avatar} className={isPlaying ? "spinning" : ""} style={{ border: '2px solid #FE2851', padding: '2px' }} />
            <div className="song-detail">
                <h5 className="song-name">{currentSong.title}</h5>
                <p className="artist-name" style={{ color: '#9CA3A1' }}>{currentSong.artistName}</p>
            </div>
            
            {/* NÚT TIM CHO BÀI HÁT ĐANG PHÁT */}
            <div onClick={handleToggleFavorite} style={{ marginLeft: '20px', cursor: 'pointer', fontSize: '20px' }}>
                {user?.favorites?.songs?.includes(currentSong._id) ? (
                    <HeartFilled style={{ color: '#FE2851' }} />
                ) : (
                    <HeartOutlined style={{ color: '#fff' }} className="heart-hover" />
                )}
            </div>
        </Flex>

        <Flex vertical align="center" className="player-controls">
            <Flex align="center" gap={25} className="control-buttons">
                <TiArrowShuffle onClick={toggleShuffle} style={{ color: isShuffle ? '#FE2851' : '#9CA3A1', cursor: 'pointer', fontSize: '20px' }} />
                <StepBackwardOutlined className="control-icon" onClick={handlePrev} />
                <div onClick={togglePlay} className="play-pause-wrapper">
                    {isLoading ? <LoadingOutlined className="play-btn-main" /> : isPlaying ? <PauseCircleFilled className="play-btn-main" /> : <PlayCircleFilled className="play-btn-main" />}
                </div>
                <StepForwardOutlined className="control-icon" onClick={handleNext} />
                <RetweetOutlined onClick={toggleLoop} style={{ color: isLoop ? '#FE2851' : '#9CA3A1', fontSize: '20px', cursor: 'pointer' }} />
            </Flex>
            <Flex align="center" className="progress-bar-container" gap={10}>
                <span className="time-text">{formatTime(currentTime)}</span>
                <Slider className="custom-slider" value={progress} onChange={handleSeek} tooltip={{ open: false }} />
                <span className="time-text">{formatTime(duration)}</span>
            </Flex>
        </Flex>

        <Flex align="center" justify="flex-end" gap={15} className="extra-controls">
            <UnorderedListOutlined className="control-icon-small" style={{ fontSize: '18px', cursor: 'pointer' }} />
            <div onClick={toggleMute} style={{ cursor: 'pointer', display: 'flex' }}>
                {isMuted || volume === 0 ? <MutedOutlined style={{ color: '#FE2851' }} /> : <SoundOutlined className="control-icon-small" />}
            </div>
            <div className="volume-slider">
                <Slider value={volume * 100} onChange={handleVolumeChange} size="small" tooltip={{ open: false }} />
            </div>
            <ExpandOutlined className="control-icon-small" style={{ fontSize: '18px', cursor: 'pointer' }} />
        </Flex>
    </footer>
  );
}

export default MusicPlayer;