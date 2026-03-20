import { useState, useRef, useEffect, useContext } from 'react';
import { Button, Input, Flex, Typography, Spin } from 'antd';
import { 
    RobotOutlined, SendOutlined, CloseOutlined, 
    MessageFilled, AudioOutlined, AudioMutedOutlined,
    SoundOutlined, MutedOutlined 
} from '@ant-design/icons';
import { sendChatMessage } from '../../services/chatService';
import { MusicContext } from '../../Context/MusicContext';
import { useTranslation } from 'react-i18next'; // IMPORT i18n

const { Text } = Typography;

function AIChat() {
    const { t, i18n } = useTranslation(); // Khai báo i18n
    const { isLoop, isShuffle, toggleLoop, toggleShuffle, toggleMute, isMuted } = useContext(MusicContext);

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    // ĐỒNG BỘ: ChatLang sẽ tự động đi theo ngôn ngữ hệ thống i18n
    const [chatLang, setChatLang] = useState(i18n.language === 'vi' ? 'vi-VN' : 'en-US'); 
    
    const [isChatMuted, setIsChatMuted] = useState(() => {
        return localStorage.getItem('muzia_chat_muted') === 'true';
    });

    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);

    // --- HÀM BẬT/TẮT TIẾNG TỨC THÌ ---
    const handleToggleMuteChat = () => {
        const nextMuteState = !isChatMuted;
        setIsChatMuted(nextMuteState);
        
        if (nextMuteState) {
            // TRƯỜNG HỢP TẮT TIẾNG: Ngắt âm thanh ngay lập tức
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        } else {
            // TRƯỜNG HỢP BẬT TIẾNG LẠI: 
            // Tìm tin nhắn cuối cùng của AI trong danh sách để đọc lại ngay
            const lastMessage = [...messages].reverse().find(msg => msg.role === 'model');
            if (lastMessage && lastMessage.text) {
                // Chúng ta gọi hàm speakText nhưng bỏ qua check isChatMuted tạm thời 
                // vì state isChatMuted có thể chưa cập nhật kịp (Async)
                const utterance = new SpeechSynthesisUtterance(lastMessage.text);
                utterance.lang = chatLang;
                window.speechSynthesis.cancel(); // Clear mọi thứ trước đó
                window.speechSynthesis.speak(utterance);
            }
        }
    };

    // Tự động cập nhật chatLang khi người dùng đổi ngôn ngữ ở Header
    useEffect(() => {
        setChatLang(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
    }, [i18n.language]);

    useEffect(() => {
        localStorage.setItem('muzia_chat_muted', isChatMuted);
    }, [isChatMuted]);

    const voiceCommands = {
        'vi-VN': {
            unshuffle: { keywords: ["tắt phát ngẫu nhiên", "dừng phát ngẫu nhiên", "tắt trộn bài", "hủy trộn bài"], reply: "Đã tắt chế độ phát ngẫu nhiên." },
            unloop: { keywords: ["tắt lặp lại", "dừng lặp lại", "hủy lặp lại"], reply: "Đã tắt chế độ lặp lại bài hát." },
            shuffle: { keywords: ["phát ngẫu nhiên", "trộn bài"], reply: "Đã kích hoạt chế độ phát ngẫu nhiên." },
            loop: { keywords: ["lặp lại", "phát lại"], reply: "Đã bật chế độ lặp lại bài hát." },
            mute: { keywords: ["tắt tiếng", "tắt âm", "im lặng"], reply: "Đã tắt âm thanh nhạc." },
            unmute: { keywords: ["mở tiếng", "bật tiếng", "mở âm"], reply: "Âm thanh nhạc đã được bật lại." },
            play: { keywords: ["tiếp tục phát", "mở nhạc", "chơi nhạc", "bật nhạc", "phát nhạc"], reply: "Vâng, Muzia đang tiếp tục phát nhạc cho bạn." },
            pause: { keywords: ["dừng nhạc", "tạm dừng", "ngưng nhạc", "tắt nhạc"], reply: "Đã tạm dừng nhạc theo yêu cầu của bạn." },
            next: { keywords: ["bài tiếp", "chuyển bài", "bài mới", "sang bài"], reply: "Đang chuyển sang bài hát kế tiếp." },
            prev: { keywords: ["bài trước", "quay lại", "trở lại"], reply: "Đang quay lại bài hát trước đó." },
            switchToEn: { keywords: ["tiếng anh"], reply: "Giao diện đã được chuyển sang Tiếng Anh." },
            switchToVi: { keywords: ["tiếng việt"], reply: "Bạn đang sử dụng Tiếng Việt." }
        },
        'en-US': {
            unshuffle: { keywords: ["turn off shuffle", "stop random", "disable shuffle", "cancel shuffle"], reply: "Shuffle mode disabled." },
            unloop: { keywords: ["turn off loop", "stop loop", "stop repeat", "disable repeat", "disable loop", "cancel loop", "cancel repeat"], reply: "Repeat mode disabled." },
            shuffle: { keywords: ["shuffle", "random play", "random"], reply: "Shuffle mode is now active." },
            loop: { keywords: ["loop", "repeat"], reply: "Repeat mode enabled." },
            mute: { keywords: ["mute", "silent", "turn off sound"], reply: "Sound muted." },
            unmute: { keywords: ["unmute", "turn on sound"], reply: "Sound is back on." },
            play: { keywords: ["resume", "play", "start"], reply: "Sure, resuming the music for you." },
            pause: { keywords: ["pause", "stop"], reply: "Music has been paused." },
            next: { keywords: ["next", "forward"], reply: "Skipping to the next track." },
            prev: { keywords: ["previous", "go back"], reply: "Going back to the previous track." },
            switchToVi: { keywords: ["vietnamese"], reply: "Interface has been switched to Vietnamese." },
            switchToEn: { keywords: ["english"], reply: "You are already using English." }
        }
    };

    const handleVoiceCommand = (transcript, currentLang) => {
        const text = transcript.toLowerCase();
        const currentLangData = voiceCommands[currentLang];
        const priorityOrder = ['switchToEn', 'switchToVi', 'unshuffle', 'unloop', 'mute', 'unmute', 'shuffle', 'loop', 'next', 'prev', 'play', 'pause'];

        for (let action of priorityOrder) {
            const item = currentLangData[action];
            if (item && item.keywords.some(key => text.includes(key))) {
                if (action === 'switchToEn') {
                    if (i18n.language !== 'en') {
                        i18n.changeLanguage('en');
                        localStorage.setItem('muzia_lang', 'en');
                    }
                } 
                else if (action === 'switchToVi') {
                    if (i18n.language !== 'vi') {
                        i18n.changeLanguage('vi');
                        localStorage.setItem('muzia_lang', 'vi');
                    }
                }
                else if (action === 'unshuffle') { if (isShuffle) toggleShuffle(); }
                else if (action === 'unloop') { if (isLoop) toggleLoop(); }
                else if (action === 'shuffle') { if (!isShuffle) toggleShuffle(); }
                else if (action === 'loop') { if (!isLoop) toggleLoop(); }
                else if (action === 'mute') { if (!isMuted) toggleMute(); }
                else if (action === 'unmute') { if (isMuted) toggleMute(); }
                else { window.dispatchEvent(new CustomEvent('muzia-control', { detail: action })); }
                return item.reply;
            }
        }
        return null;
    };

    const speakText = (text) => {
        if (isChatMuted || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = chatLang;
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
        // Dùng t() cho lời chào mặc định
        return savedMessages ? JSON.parse(savedMessages) : [{ role: 'model', text: t('chat.welcome_msg') }];
    });

    useEffect(() => { localStorage.setItem('muzia_chat_history', JSON.stringify(messages)); }, [messages]);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        const userMsg = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);
        // Prompt ép AI trả lời đúng ngôn ngữ đang chọn
        const promptWithLang = `(Reply in ${chatLang === 'vi-VN' ? 'Vietnamese' : 'English'}) ${userMsg.text}`;
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
        setMessages([{ role: 'model', text: t('chat.history_cleared') }]);
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
                        <Flex gap={15} align="center">
                            <Button 
                                type="text" 
                                icon={isChatMuted ? <MutedOutlined style={{color:'#9CA3A1'}}/> : <SoundOutlined style={{color:'#fff'}}/>} 
                                onClick={handleToggleMuteChat} 
                            />
                            <Button type="text" onClick={clearHistory} style={{ color: '#9CA3A1', fontSize: '11px', padding: 0 }}>{t('chat.clear')}</Button>
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
                                <Input 
                                    placeholder={isListening ? "" : t('chat.placeholder')} 
                                    value={inputValue} 
                                    onChange={(e) => setInputValue(e.target.value)} 
                                    onPressEnter={handleSendMessage} 
                                    variant="borderless" 
                                    style={{ color: '#fff', fontSize: '13px' }} 
                                />
                                {isListening && <div className="voice-waves"><span></span><span></span><span></span></div>}
                            </div>
                            <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} shape="circle" size="small" style={{ backgroundColor: inputValue.trim() ? '#FE2851' : '#393243', border: 'none' }} />
                        </Flex>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AIChat;