import { useState, useRef, useEffect, useContext } from 'react';
import { Button, Input, Flex, Typography, Spin, Select } from 'antd';
import { 
    RobotOutlined, SendOutlined, CloseOutlined, 
    MessageFilled, AudioOutlined, AudioMutedOutlined,
    SoundOutlined, MutedOutlined 
} from '@ant-design/icons';
import { sendChatMessage } from '../../services/chatService';
import { MusicContext } from '../../Context/MusicContext';

const { Text } = Typography;
const { Option } = Select;

function AIChat() {
    // Chỉ lấy các trạng thái điều khiển nhạc từ MusicContext
    const { isLoop, isShuffle, toggleLoop, toggleShuffle, toggleMute, isMuted } = useContext(MusicContext);

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [chatLang, setChatLang] = useState('vi-VN'); 
    
    // --- QUẢN LÝ LOA RIÊNG CHO CHATBOT (Để không tắt nhạc khi AI nói) ---
    // Chúng ta vẫn dùng nút Loa trên giao diện để điều khiển isChatMuted nội bộ
    const [isChatMuted, setIsChatMuted] = useState(() => {
        return localStorage.getItem('muzia_chat_muted') === 'true';
    });

    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);

    // Lưu trạng thái loa chatbot vào máy
    useEffect(() => {
        localStorage.setItem('muzia_chat_muted', isChatMuted);
    }, [isChatMuted]);

    // --- TỪ ĐIỂN LỆNH GIỮ NGUYÊN ---
    const voiceCommands = {
        'vi-VN': {
            unshuffle: { keywords: ["tắt phát ngẫu nhiên", "dừng phát ngẫu nhiên", "tắt trộn bài", "hủy trộn bài"], reply: "Đã tắt chế độ phát ngẫu nhiên." },
            unloop: { keywords: ["tắt lặp lại", "dừng lặp lại", "hủy lặp lại"], reply: "Đã tắt chế độ lặp lại bài hát." },
            shuffle: { keywords: ["phát ngẫu nhiên", "trộn bài"], reply: "Đã kích hoạt chế độ phát ngẫu nhiên." },
            loop: { keywords: ["lặp lại bài hát", "phát lại bài"], reply: "Đã bật chế độ lặp lại bài hát." },
            mute: { keywords: ["tắt tiếng nhạc", "tắt âm thanh", "im lặng"], reply: "Đã tắt âm thanh nhạc." },
            unmute: { keywords: ["mở tiếng nhạc", "bật tiếng nhạc", "mở âm"], reply: "Âm thanh nhạc đã được bật lại." },
            play: { keywords: ["tiếp tục phát", "mở nhạc", "chơi nhạc", "bật nhạc"], reply: "Vâng, Muzia đang tiếp tục phát nhạc cho bạn." },
            pause: { keywords: ["dừng nhạc", "tạm dừng", "ngưng nhạc", "tắt nhạc"], reply: "Đã tạm dừng nhạc theo yêu cầu của bạn." },
            next: { keywords: ["bài tiếp theo", "chuyển bài", "bài mới", "skip"], reply: "Đang chuyển sang bài hát kế tiếp." },
            prev: { keywords: ["bài trước", "quay lại bài"], reply: "Đang quay lại bài hát trước đó." }
        },
        'en-US': {
            unshuffle: { keywords: ["turn off shuffle", "stop random", "disable shuffle"], reply: "Shuffle mode disabled." },
            unloop: { keywords: ["turn off loop", "stop repeat", "disable repeat"], reply: "Repeat mode disabled." },
            shuffle: { keywords: ["shuffle mode", "random play", "turn on shuffle"], reply: "Shuffle mode is now active." },
            loop: { keywords: ["loop this song", "repeat mode", "turn on loop"], reply: "Repeat mode enabled." },
            mute: { keywords: ["mute", "silent", "turn off sound"], reply: "Sound muted." },
            unmute: { keywords: ["unmute", "turn on sound"], reply: "Sound is back on." },
            play: { keywords: ["resume", "play music", "start music"], reply: "Sure, resuming the music for you." },
            pause: { keywords: ["pause music", "stop music"], reply: "Music has been paused." },
            next: { keywords: ["next song", "forward"], reply: "Skipping to the next track." },
            prev: { keywords: ["previous song", "go back"], reply: "Going back to the previous track." }
        }
    };

    const handleVoiceCommand = (transcript, currentLang) => {
        const text = transcript.toLowerCase();
        const currentLangData = voiceCommands[currentLang];

        const priorityOrder = [
            'unshuffle', 'unloop', 'mute', 'unmute', 
            'shuffle', 'loop', 'next', 'prev', 'play', 'pause'
        ];

        for (let action of priorityOrder) {
            const item = currentLangData[action];
            if (item && item.keywords.some(key => text.includes(key))) {
                // Xử lý logic Un-toggle
                if (action === 'unshuffle') { if (isShuffle) toggleShuffle(); }
                else if (action === 'unloop') { if (isLoop) toggleLoop(); }
                else if (action === 'shuffle') { if (!isShuffle) toggleShuffle(); }
                else if (action === 'loop') { if (!isLoop) toggleLoop(); }
                else if (action === 'mute') { if (!isMuted) toggleMute(); }
                else if (action === 'unmute') { if (isMuted) toggleMute(); }
                else {
                    window.dispatchEvent(new CustomEvent('muzia-control', { detail: action }));
                }
                return item.reply;
            }
        }
        return null;
    };

    const speakText = (text) => {
        // GIẢI QUYẾT VẤN ĐỀ: Kiểm tra isChatMuted thay vì isMuted của nhạc
        if (isChatMuted || !window.speechSynthesis) return;
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = chatLang;
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(chatLang.split('-')[0]));
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    };

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
                const response = handleVoiceCommand(transcript, chatLang);
                if (response) {
                    setMessages(prev => [...prev, { role: 'model', text: response }]);
                    speakText(response);
                    setInputValue(''); 
                }
            };
            recognitionRef.current = recognition;
        }
    }, [chatLang, isShuffle, isLoop, isMuted, isChatMuted]);

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
        return savedMessages ? JSON.parse(savedMessages) : [{ role: 'model', text: "Muzia AI Assistant sẵn sàng phục vụ!" }];
    });

    useEffect(() => { localStorage.setItem('muzia_chat_history', JSON.stringify(messages)); }, [messages]);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isTyping]);

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
            {!isOpen && <Button type="primary" shape="circle" icon={<MessageFilled />} size="large" className="ai-chat-trigger" onClick={() => setIsOpen(true)} />}
            {isOpen && (
                <div className="ai-chat-window">
                    <Flex justify="space-between" align="center" className="ai-chat-header">
                        <Flex align="center" gap={8}>
                            <RobotOutlined style={{ fontSize: 18, color: '#FE2851' }} />
                            <Text strong style={{ color: '#fff' }}>Muzia AI Assistant</Text>
                        </Flex>
                        <Flex gap={5} align="center">
                            {/* GIAO DIỆN GIỮ NGUYÊN: Nhưng nút này giờ điều khiển isChatMuted thay vì MusicContext.toggleMute */}
                            <Button 
                                type="text" 
                                icon={isChatMuted ? <MutedOutlined style={{color:'#9CA3A1'}}/> : <SoundOutlined style={{color:'#fff'}}/>} 
                                onClick={() => setIsChatMuted(!isChatMuted)} 
                            />
                            <Button type="text" onClick={clearHistory} style={{ color: '#9CA3A1', fontSize: '11px', padding: 0 }}>Clear</Button>
                            <Button type="text" icon={<CloseOutlined style={{color:'#fff'}}/>} onClick={() => setIsOpen(false)} />
                        </Flex>
                    </Flex>
                    <div className="ai-chat-body" ref={scrollRef}>
                        {messages.map((item, index) => (
                            <div key={index} className={`chat-msg-container ${item.role}`}><div className={`chat-bubble ${item.role}`}>{item.text}</div></div>
                        ))}
                        {isTyping && <div className="chat-msg-container model"><div className="chat-bubble model"><Spin size="small" /></div></div>}
                    </div>
                    <div className="ai-chat-footer">
                        <Flex gap={5} align="center" style={{ position: 'relative' }}>
                            <Button type={isListening ? "primary" : "default"} danger={isListening} shape="circle" size="small" icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />} onClick={toggleListening} className={isListening ? "mic-active" : ""} />
                            <div className="input-wrapper" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Input placeholder={isListening ? "" : (chatLang === 'vi-VN' ? "Hỏi Muzia..." : "Ask...")} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onPressEnter={handleSendMessage} variant="borderless" style={{ color: '#fff', fontSize: '13px' }} />
                                {isListening && <div className="voice-waves"><span></span><span></span><span></span></div>}
                            </div>
                            <Select value={chatLang} size="small" variant="borderless" onChange={(val) => setChatLang(val)} className="lang-select-footer" popupClassName="lang-dropdown-custom" style={{ width: 55 }}>
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