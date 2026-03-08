import { useState, useRef, useEffect } from 'react';
import { Button, Input, Avatar, Flex, Typography, Spin } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, MessageFilled } from '@ant-design/icons';
import { sendChatMessage } from '../../services/chatService';

const { Text } = Typography;

function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // 1. Khởi tạo messages từ localStorage (nếu có)
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('muzia_chat_history');
        return savedMessages ? JSON.parse(savedMessages) : [
            { role: 'model', text: "Hello! I'm Muzia's assistant, how can I help you?" }
        ];
    });

    // 2. Lưu messages vào localStorage mỗi khi mảng này thay đổi
    useEffect(() => {
        localStorage.setItem('muzia_chat_history', JSON.stringify(messages));
    }, [messages]);

    // Tự động cuộn xuống cuối
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Gọi service gửi tới Backend (Gemini)
            const result = await sendChatMessage({ text: userMsg.text });

            if (result && result.length > 0) {
                // Lấy phần tử cuối (model) từ mảng kết quả của Backend
                const aiReply = result[result.length - 1];
                setMessages(prev => [...prev, aiReply]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    // Hàm xóa lịch sử chat nếu cần
    const clearHistory = () => {
        const defaultMsg = [{ role: 'model', text: 'The history has been deleted. How else can I help?' }];
        setMessages(defaultMsg);
        localStorage.removeItem('muzia_chat_history');
    };

    return (
        <div className="ai-chat-wrapper">
            {!isOpen && (
                <Button 
                    type="primary" shape="circle" icon={<MessageFilled />} 
                    size="large" className="ai-chat-trigger"
                    onClick={() => setIsOpen(true)}
                />
            )}

            {isOpen && (
                <div className="ai-chat-window">
                    <Flex justify="space-between" align="center" className="ai-chat-header">
                        <Flex align="center" gap={10}>
                            <RobotOutlined style={{ fontSize: 20, color: '#FE2851' }} />
                            <Text strong style={{ color: '#fff' }}>Muzia AI Assistant</Text>
                        </Flex>
                        <Flex gap={10}>
                            {/* Nút xóa lịch sử nhanh */}
                            <Button type="text" onClick={clearHistory} style={{ color: '#9CA3A1', fontSize: '12px' }}>
                                Clear
                            </Button>
                            <Button type="text" icon={<CloseOutlined style={{ color: '#fff' }} />} onClick={() => setIsOpen(false)} />
                        </Flex>
                    </Flex>

                    <div className="ai-chat-body" ref={scrollRef}>
                        {messages.map((item, index) => (
                            <div key={index} className={`chat-msg-container ${item.role}`}>
                                <Flex gap={8} justify={item.role === 'user' ? 'end' : 'start'}>
                                    {item.role === 'model' && <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#FE2851' }} />}
                                    <div className={`chat-bubble ${item.role}`}>
                                        {item.text}
                                    </div>
                                </Flex>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-msg-container model">
                                <Flex gap={8}>
                                    <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#FE2851' }} />
                                    <div className="chat-bubble model">
                                        <Spin size="small" /> Assistant is thinking...
                                    </div>
                                </Flex>
                            </div>
                        )}
                    </div>

                    <div className="ai-chat-footer">
                        <Flex gap={8}>
                            <Input 
                                placeholder="Ask Muzia AI..." 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onPressEnter={handleSendMessage}
                                variant="borderless" 
                                style={{ color: '#fff' }}
                            />
                            <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} shape="circle" />
                        </Flex>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AIChat;