import { useState, useRef, useEffect } from 'react';
import { Button, Input, Flex, Typography, Spin, Tooltip, Select } from 'antd';
import { 
    RobotOutlined, SendOutlined, CloseOutlined, 
    MessageFilled, AudioOutlined, AudioMutedOutlined,
    SoundOutlined, MutedOutlined 
} from '@ant-design/icons';
import { sendChatMessage } from '../../services/chatService';

const { Text } = Typography;
const { Option } = Select;

function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [chatLang, setChatLang] = useState('vi-VN'); 
    
    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);

    const voiceCommands = {
        'vi-VN': {
            play: {
                keywords: ["phát nhạc", "mở nhạc", "tiếp tục", "chơi nhạc"],
                reply: "Vâng, Muzia đang tiếp tục phát nhạc cho bạn."
            },
            pause: {
                keywords: ["dừng nhạc", "tạm dừng", "ngưng"],
                reply: "Đã tạm dừng nhạc theo yêu cầu của bạn."
            },
            next: {
                keywords: ["bài tiếp theo", "chuyển bài", "bài mới"],
                reply: "Đang chuyển sang bài hát kế tiếp."
            },
            prev: {
                keywords: ["bài trước", "quay lại"],
                reply: "Đang quay lại bài hát trước đó."
            },
            mute: {
                keywords: ["tắt tiếng", "im lặng"],
                reply: "Đã tắt âm thanh."
            },
            unmute: {
                keywords: ["mở tiếng", "bật tiếng"],
                reply: "Âm thanh đã được bật lại."
            },
            shuffle: {
                keywords: ["phát ngẫu nhiên", "trộn bài"],
                reply: "Đã kích hoạt chế độ phát ngẫu nhiên."
            },
            loop: {
                keywords: ["lặp lại", "phát lại"],
                reply: "Đã bật chế độ lặp lại bài hát."
            }
        },
        'en-US': {
            play: {
                keywords: ["start", "resume", "play"],
                reply: "Sure, resuming the music for you."
            },
            pause: {
                keywords: ["skip", "stop", "pause"],
                reply: "Music has been paused."
            },
            next: {
                keywords: ["forward", "next"],
                reply: "Skipping to the next track."
            },
            prev: {
                keywords: ["previous", "go back", "back"],
                reply: "Going back to the previous track."
            },
            mute: {
                keywords: ["mute", "turn off"],
                reply: "Sound muted."
            },
            unmute: {
                keywords: ["unmute", "turn on"],
                reply: "Sound is back on."
            },
            shuffle: {
                keywords: ["shuffle", "random"],
                reply: "Shuffle mode is now active."
            },
            loop: {
                keywords: ["loop", "repeat"],
                reply: "Repeat mode enabled."
            }
        }
    };

    const handleVoiceCommand = (transcript, currentLang) => {
        const text = transcript.toLowerCase();
        const currentLangData = voiceCommands[currentLang];

        for (let action in currentLangData) {
            const item = currentLangData[action];
            if (item.keywords.some(key => text.includes(key))) {
                // Gửi sự kiện điều khiển
                window.dispatchEvent(new CustomEvent('muzia-control', { detail: action }));
                // Trả về câu phản hồi riêng biệt cho hành động đó
                return item.reply;
            }
        }
        return null;
    };

    // Logic useEffect khởi tạo SpeechRecognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            if (recognitionRef.current) recognitionRef.current.stop();
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = chatLang;
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                
                // Gọi hàm xử lý và nhận câu phản hồi cụ thể
                const response = handleVoiceCommand(transcript, chatLang);
                if (response) {
                    setMessages(prev => [...prev, { role: 'model', text: response }]);
                    speakText(response);
                    setInputValue(''); 
                }
            };
            recognitionRef.current = recognition;
        }
    }, [chatLang]);

    const speakText = (text) => {
        if (isMuted || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = chatLang;
        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) recognitionRef.current?.stop();
        else {
            setInputValue(''); 
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
            recognitionRef.current?.start();
        }
    };

    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('muzia_chat_history');
        return savedMessages ? JSON.parse(savedMessages) : [
            { role: 'model', text: "Muzia AI Assistant sẵn sàng phục vụ!" }
        ];
    });

    useEffect(() => {
        localStorage.setItem('muzia_chat_history', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        const userMsg = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);
        const promptWithLang = `(Trả lời bằng ${chatLang === 'vi-VN' ? 'Tiếng Việt' : 'Tiếng Anh'}) ${userMsg.text}`;
        try {
            const result = await sendChatMessage({ text: promptWithLang });
            if (result && result.length > 0) {
                const aiReply = result[result.length - 1];
                setMessages(prev => [...prev, aiReply]);
                speakText(aiReply.text);
            }
        } catch (error) { console.error(error); } 
        finally { setIsTyping(false); }
    };

    const clearHistory = () => {
        window.speechSynthesis?.cancel();
        setMessages([{ role: 'model', text: chatLang === 'vi-VN' ? 'Lịch sử đã xóa.' : 'History cleared.' }]);
        localStorage.removeItem('muzia_chat_history');
    };

    return (
        <div className="ai-chat-wrapper">
            {!isOpen && (
                <Button type="primary" shape="circle" icon={<MessageFilled />} size="large" className="ai-chat-trigger" onClick={() => setIsOpen(true)} />
            )}

            {isOpen && (
                <div className="ai-chat-window">
                    {/* HEADER: Muzia AI Assistant */}
                    <Flex justify="space-between" align="center" className="ai-chat-header">
                        <Flex align="center" gap={8}>
                            <RobotOutlined style={{ fontSize: 18, color: '#FE2851' }} />
                            <Text strong style={{ color: '#fff' }}>Muzia AI Assistant</Text>
                        </Flex>
                        <Flex gap={5} align="center">
                            <Button type="text" icon={isMuted ? <MutedOutlined style={{color:'#9CA3A1'}}/> : <SoundOutlined style={{color:'#fff'}}/>} onClick={() => setIsMuted(!isMuted)} />
                            <Button type="text" onClick={clearHistory} style={{ color: '#9CA3A1', fontSize: '11px', padding: 0 }}>Clear</Button>
                            <Button type="text" icon={<CloseOutlined style={{color:'#fff'}}/>} onClick={() => setIsOpen(false)} />
                        </Flex>
                    </Flex>

                    <div className="ai-chat-body" ref={scrollRef}>
                        {messages.map((item, index) => (
                            <div key={index} className={`chat-msg-container ${item.role}`}>
                                <div className={`chat-bubble ${item.role}`}>{item.text}</div>
                            </div>
                        ))}
                        {isTyping && <div className="chat-msg-container model"><div className="chat-bubble model"><Spin size="small" /></div></div>}
                    </div>

                    {/* FOOTER: Nút Mic | Input | Select Language | Nút Gửi */}
                    <div className="ai-chat-footer">
                        <Flex gap={5} align="center" style={{ position: 'relative' }}>
                            <Button 
                                type={isListening ? "primary" : "default"}
                                danger={isListening} shape="circle" size="small"
                                icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />} 
                                onClick={toggleListening}
                                className={isListening ? "mic-active" : ""}
                            />
                            
                            <div className="input-wrapper" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Input 
                                    placeholder={isListening ? "" : (chatLang === 'vi-VN' ? "Hỏi Muzia..." : "Ask...")} 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onPressEnter={handleSendMessage}
                                    variant="borderless" 
                                    style={{ color: '#fff', fontSize: '13px' }}
                                />
                                {isListening && <div className="voice-waves"><span></span><span></span><span></span></div>}
                            </div>

                            {/* SELECT LANGUAGE ĐƯA XUỐNG ĐÂY */}
                            <Select 
                                value={chatLang} 
                                size="small" 
                                variant="borderless" 
                                onChange={(val) => setChatLang(val)}
                                className="lang-select-footer"
                                popupClassName="lang-dropdown-custom"
                                style={{ width: 55 }}
                            >
                                <Option value="vi-VN"><span style={{ color: '#FE2851', fontSize: '12px', fontWeight: 'bold' }}>VN</span></Option>
                                <Option value="en-US"><span style={{ color: '#FE2851', fontSize: '12px', fontWeight: 'bold' }}>EN</span></Option>
                            </Select>

                            <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} shape="circle" size="small" style={{ backgroundColor: inputValue.trim() ? '#FE2851' : '#393243', border: 'none' }} />
                        </Flex>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AIChat;