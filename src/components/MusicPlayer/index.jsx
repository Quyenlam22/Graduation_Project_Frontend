// components/MusicPlayer/index.jsx
import { Flex, Avatar, Typography, Slider } from "antd";
import { StepBackwardOutlined, StepForwardOutlined, RetweetOutlined, HeartOutlined, ExpandOutlined, UnorderedListOutlined, SoundOutlined, PlayCircleFilled } from "@ant-design/icons";
import { TiArrowShuffle } from "react-icons/ti";
// import './MusicPlayer.scss';

const { Text } = Typography;

function MusicPlayer() {
    return (
        <footer className="music-footer">
            <Flex align="center" className="song-info" justify="space-between">
                <Flex align="center">
                  <Avatar shape="square" size={60} src="https://picsum.photos/200/200?random=100" />
                  <div className="song-detail">
                      <h5 strong className="song-name">Starlight</h5>
                      <p className="artist-name">Luna Eclipse</p>
                  </div>
                </Flex>
                <HeartOutlined className="heart-icon" />
            </Flex>

            <Flex align="center" className="player-controls">
                <Flex align="center" gap={25} className="control-buttons">
                    <TiArrowShuffle />
                    <StepBackwardOutlined />
                    <PlayCircleFilled className="play-btn" />
                    <StepForwardOutlined />
                    <RetweetOutlined />
                </Flex>
                <Flex align="center" className="progress-bar-container">
                    <span className="time-text">1:42</span>
                    <Slider defaultValue={45} tooltip={{ open: false }} />
                    <span className="time-text">3:45</span>
                </Flex>
            </Flex>

            <Flex align="center" justify="flex-end" gap={12} className="extra-controls">
                <UnorderedListOutlined />
                <SoundOutlined />
                <div className="volume-slider">
                    <Slider defaultValue={70} size="small" tooltip={{ open: false }} />
                </div>
                <ExpandOutlined />
            </Flex>
        </footer>
    );
}

export default MusicPlayer;