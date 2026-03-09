import { useContext } from "react";
import { Flex, Avatar, Slider } from "antd";
import { 
  StepBackwardOutlined, StepForwardOutlined, RetweetOutlined, 
  HeartOutlined, ExpandOutlined, UnorderedListOutlined, 
  SoundOutlined, MutedOutlined, PlayCircleFilled, PauseCircleFilled,
  LoadingOutlined
} from "@ant-design/icons";
import { TiArrowShuffle } from "react-icons/ti";
import { MusicContext } from "../../Context/MusicContext";

function MusicPlayer() {
  const {
    currentSong, isPlaying, isLoading, currentTime, duration, progress, volume, isMuted, 
    isLoop, isShuffle, // Thêm isShuffle
    togglePlay, handleSeek, handleVolumeChange, toggleMute, toggleLoop, 
    toggleShuffle, // Thêm toggleShuffle
    formatTime, handleNext, handlePrev
  } = useContext(MusicContext);

  if (!currentSong) return null;

  return (
    <footer className="music-footer">
      {/* SONG INFO */}
      <Flex align="center" className="song-info">
        <Avatar 
          shape="circle" 
          size={60} 
          src={currentSong.cover || currentSong.avatar} 
          // Hiệu ứng xoay đĩa được kích hoạt qua class "spinning" khi isPlaying = true
          className={isPlaying ? "spinning" : ""} 
          style={{ border: '2px solid #FE2851', padding: '2px' }}
        />
        <div className="song-detail">
          <h5 className="song-name">{currentSong.title}</h5>
          <p className="artist-name">{currentSong.artistName}</p>
        </div>
        <HeartOutlined className="heart-icon" style={{ marginLeft: '20px', color: '#FE2851', cursor: 'pointer' }} />
      </Flex>

      {/* PLAYER CONTROLS */}
      <Flex vertical align="center" className="player-controls">
        <Flex align="center" gap={25} className="control-buttons">
          {/* Hiệu ứng màu cho Shuffle */}
          <TiArrowShuffle 
            onClick={toggleShuffle} 
            style={{ 
              color: isShuffle ? '#FE2851' : '#9CA3A1', 
              cursor: 'pointer',
              fontSize: '20px',
              transition: 'all 0.3s' 
            }} 
          />
          
          <StepBackwardOutlined className="control-icon" onClick={handlePrev} />
          
          <div onClick={togglePlay} className="play-pause-wrapper">
            {isLoading ? (
              <LoadingOutlined className="play-btn-main" />
            ) : isPlaying ? (
              <PauseCircleFilled className="play-btn-main" />
            ) : (
              <PlayCircleFilled className="play-btn-main" />
            )}
          </div>

          <StepForwardOutlined className="control-icon" onClick={handleNext} />
          
          {/* Hiệu ứng màu cho Loop */}
          <div onClick={toggleLoop} style={{ cursor: 'pointer', display: 'flex' }}>
            <RetweetOutlined 
               style={{ 
                 color: isLoop ? '#FE2851' : '#9CA3A1', 
                 fontSize: '20px',
                 transition: 'all 0.3s' 
               }} 
            />
          </div>
        </Flex>

        <Flex align="center" className="progress-bar-container" gap={10}>
          <span className="time-text">{formatTime(currentTime)}</span>
          <Slider 
            className="custom-slider"
            value={progress} 
            onChange={handleSeek} 
            tooltip={{ open: false }} 
          />
          <span className="time-text">{formatTime(duration)}</span>
        </Flex>
      </Flex>

      {/* EXTRA CONTROLS */}
      <Flex align="center" justify="flex-end" gap={15} className="extra-controls">
        <UnorderedListOutlined className="control-icon-small" />
        
        <div onClick={toggleMute} style={{ cursor: 'pointer', display: 'flex', fontSize: '18px' }}>
          {isMuted || volume === 0 ? (
            <MutedOutlined style={{ color: '#FE2851' }} />
          ) : (
            <SoundOutlined className="control-icon-small" />
          )}
        </div>

        <div className="volume-slider">
          <Slider 
            value={volume * 100} 
            onChange={handleVolumeChange} 
            size="small" 
            tooltip={{ open: false }} 
          />
        </div>
        <ExpandOutlined className="control-icon-small" />
      </Flex>
    </footer>
  );
}

export default MusicPlayer;