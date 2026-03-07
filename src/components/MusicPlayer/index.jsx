import { useContext } from "react";
import { Flex, Avatar, Typography, Slider } from "antd";
import { 
  StepBackwardOutlined, StepForwardOutlined, RetweetOutlined, 
  HeartOutlined, ExpandOutlined, UnorderedListOutlined, 
  SoundOutlined, MutedOutlined, PlayCircleFilled, PauseCircleFilled,
  LoadingOutlined
} from "@ant-design/icons";
import { TiArrowShuffle } from "react-icons/ti";
import { MusicContext } from "../../Context/MusicContext";

const { Text } = Typography;

function MusicPlayer() {
  const {
    currentSong, isPlaying, isLoading, currentTime, duration, progress, volume, isMuted, isLoop,
    togglePlay, handleSeek, handleVolumeChange, toggleMute, toggleLoop, formatTime,
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
          className={isPlaying ? "spinning" : ""} 
        />
        <div className="song-detail">
          <h5 className="song-name">{currentSong.title}</h5>
          <p className="artist-name">{currentSong.artist}</p>
        </div>
        <HeartOutlined className="heart-icon" style={{ marginLeft: '20px', color: '#FE2851' }} />
      </Flex>

      {/* PLAYER CONTROLS */}
      <Flex vertical align="center" className="player-controls">
        <Flex align="center" gap={25} className="control-buttons">
          <TiArrowShuffle style={{ color: '#9CA3A1', cursor: 'pointer' }} />
          <StepBackwardOutlined style={{ cursor: 'pointer' }} />
          
          <div onClick={togglePlay} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {isLoading ? (
              <LoadingOutlined className="play-btn" style={{ fontSize: '32px' }} />
            ) : isPlaying ? (
              <PauseCircleFilled className="play-btn" />
            ) : (
              <PlayCircleFilled className="play-btn" />
            )}
          </div>

          <StepForwardOutlined style={{ cursor: 'pointer' }} />
          
          {/* Nút Loop: Đổi màu khi được kích hoạt */}
          <div onClick={toggleLoop} style={{ cursor: 'pointer', display: 'flex' }}>
            <RetweetOutlined style={{ color: isLoop ? '#FE2851' : '#9CA3A1', fontSize: '20px' }} />
          </div>
        </Flex>

        <Flex align="center" className="progress-bar-container" gap={10}>
          <span className="time-text">{formatTime(currentTime)}</span>
          <Slider value={progress} onChange={handleSeek} tooltip={{ open: false }} />
          <span className="time-text">{formatTime(duration)}</span>
        </Flex>
      </Flex>

      {/* EXTRA CONTROLS */}
      <Flex align="center" justify="flex-end" gap={15} className="extra-controls">
        <UnorderedListOutlined style={{ cursor: 'pointer' }} />
        
        <div onClick={toggleMute} style={{ cursor: 'pointer', display: 'flex', fontSize: '18px' }}>
          {isMuted || volume === 0 ? (
            <MutedOutlined style={{ color: '#FE2851' }} />
          ) : (
            <SoundOutlined />
          )}
        </div>

        <div className="volume-slider">
          <Slider value={volume * 100} onChange={handleVolumeChange} size="small" tooltip={{ open: false }} />
        </div>
        <ExpandOutlined style={{ cursor: 'pointer' }} />
      </Flex>
    </footer>
  );
}

export default MusicPlayer;