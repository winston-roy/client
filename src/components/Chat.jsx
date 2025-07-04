import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createSocketConnection } from '../utils/socket';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { format, isToday, isYesterday } from 'date-fns';

function Chat() {
    const { targetUserId } = useParams();

    const [messages, setMessages] = useState([]);

    const user = useSelector(store => store.user);
    const userId = user?._id;
    const firstName = user?.firstName;

    useEffect(() => {

        if (!userId) { return }

        const socket = createSocketConnection();

        //as soon as the page load, socket connection made , joinChat event made
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            socket.emit("joinChat", {
                firstName,
                userId,
                targetUserId
            });

            // socket.on("messageReceived", ({ firstName, text }) => {
            //     console.log(firstName + ' : ' + text)
            //     setMessages((messages) => [...messages, { firstName, text }])
            // })

            socket.on("messageReceived", ({ senderId, firstName, profilePic, text, createdAt }) => {
                const isMe = senderId === userId;

                setMessages((messages) => [
                    ...messages,
                    {
                        name: firstName,
                        profilePic,
                        text,
                        sender: isMe ? 'me' : 'you',
                        sender_id: senderId,
                        user_id: userId,
                        time: getChatTime(createdAt)
                    }
                ]);
            });
            
        });

        //socket.emit("joinChat", { userId, targetUserId });

        return () => {
            socket.disconnect();
        }
    }, [userId, targetUserId])


    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const getChatTime = (createdAt) => {
        const msgDate = new Date(createdAt);
        let formattedTime = '';

        if (isToday(msgDate)) {
            formattedTime = format(msgDate, 'p'); // e.g. 2:48 PM
        } else if (isYesterday(msgDate)) {
            formattedTime = `Yesterday, ${format(msgDate, 'p')}`;
        } else {
            formattedTime = format(msgDate, 'dd MMM, p'); // e.g. 04 Jul, 2:48 PM
        }

        return formattedTime;
    }

    const fetchChatMessages = async (userId) => {
        try {
            const res = await axios.get(`${BASE_URL}/chat/messages/${targetUserId}`, {
                withCredentials: true,
            });

            const messages = res?.data?.data?.messages || [];

            const chatMessages = messages.map((msg) => ({
                name: msg?.senderId?.firstName,
                profilePic: msg?.senderId?.profilePic,
                text: msg?.text,
                sender: msg?.senderId?._id == userId ? 'me' : 'you',
                sender_id: msg?.senderId?._id,
                user_id: userId,
                time: getChatTime(msg?.createdAt)
            }));

            console.log('Fetched Chat Messages:', chatMessages);
            setMessages(chatMessages);
        } catch (err) {
            console.error('Error fetching chat messages:', err);
        }
    };


    useEffect(() => {
        if (!userId) return; // Wait until userId is available
        fetchChatMessages(userId);
    }, [userId]);

    const handleSend = () => {
        const socket = createSocketConnection();

        if (!newMessage.trim()) return;

        socket.emit("sendMessage", {
            firstName,
            userId,
            targetUserId,
            text: newMessage
        });

        setNewMessage('');

        console.log('send msg--', messages)
    };

    // const handleSend = () => {
    //     const socket = createSocketConnection();

    //     if (!newMessage.trim()) return;
    //     socket.emit("sendMessage", { firstName, userId, targetUserId, text: newMessage })
    //     // setMessages(prev => [...prev, { sender: 'me', text: newMessage }]);

    //     let msg = {
    //         name: firstName,
    //         profilePic: user?.profilePic || '', // fallback
    //         text: newMessage,
    //         sender: 'me',
    //         sender_id: userId,
    //         user_id: userId,
    //         time: getChatTime(new Date())
    //     }
    //     console.log('msg sent---', msg)
    //     setMessages(prev => [
    //         ...prev,
    //         msg
    //     ]);

    //     setNewMessage('');
    // };

    // 🔽 Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="relative h-screen bg-base-200">
            {/* Header */}
            <div className="bg-primary text-white p-4 text-xl font-bold">
                Chat Screen Of: {firstName}
            </div>

            {/* Chat body */}
            <div className="overflow-y-auto px-4 py-6 space-y-4 pb-32 h-[calc(100vh-25rem)]">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat ${msg.sender === 'me' ? 'chat-end' : 'chat-start'}`}
                    >
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <img
                                    alt="User Avatar"
                                    src={msg.profilePic}
                                />
                            </div>
                        </div>
                        <div className="chat-header">
                            {msg.sender === 'me' ? 'You' : msg.name || 'User'}
                            <time className="text-xs opacity-50 ml-2">{msg.time || 'Just now'}</time>
                        </div>
                        <div className="chat-bubble">{msg.text}</div>
                        <div className="chat-footer opacity-50">
                            {msg.sender === 'me' ? 'Seen' : 'Delivered'}
                        </div>
                    </div>
                ))}

                {/* Invisible div to scroll into view */}
                <div ref={messagesEndRef} />
            </div>

            {/* Fixed input box at bottom */}
            <div className="left-0 bg-base-100 p-4 border-t flex items-center gap-2">
                <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="btn btn-primary" onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}

export default Chat;
