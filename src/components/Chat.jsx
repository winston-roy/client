import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createSocketConnection } from '../utils/socket';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { format, isToday, isYesterday } from 'date-fns';

function Chat() {
    const { targetUserId } = useParams();
    const user = useSelector((store) => store.user);
    const userId = user?._id;
    const firstName = user?.firstName;

    const [messages, setMessages] = useState([]);
    const [targetUserInfo, setTargetUserInfo] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // ✅ Fetch target user info (name, DP, lastSeen)
    useEffect(() => {
        if (!targetUserId) return;

        const fetchTargetUser = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/auth/user/${targetUserId}`, {
                    withCredentials: true,
                });
                setTargetUserInfo(res.data.data);
            } catch (error) {
                console.error("Failed to fetch target user info:", error);
            }
        };

        fetchTargetUser();
    }, [targetUserId]);

    // ✅ Establish and manage socket connection
    useEffect(() => {
        if (!userId || !targetUserId) return;

        socketRef.current = createSocketConnection();

        socketRef.current.on('connect', () => {
            socketRef.current.emit("joinChat", {
                firstName,
                userId,
                targetUserId
            });

            socketRef.current.on("messageReceived", ({ senderId, firstName, profilePic, text, createdAt }) => {
                const isMe = senderId === userId;
                setMessages((prev) => [
                    ...prev,
                    {
                        name: firstName,
                        profilePic,
                        text,
                        sender: isMe ? 'me' : 'you',
                        sender_id: senderId,
                        user_id: userId,
                        time: getChatTime(createdAt),
                    }
                ]);
            });
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [userId, targetUserId]);

    // ✅ Fetch previous chat messages
    useEffect(() => {
        if (!userId || !targetUserId) return;

        const fetchChatMessages = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/chat/messages/${targetUserId}`, {
                    withCredentials: true,
                });

                const messages = res?.data?.data?.messages || [];

                const chatMessages = messages.map((msg) => ({
                    name: msg?.senderId?.firstName,
                    profilePic: msg?.senderId?.profilePic,
                    text: msg?.text,
                    sender: msg?.senderId?._id === userId ? 'me' : 'you',
                    sender_id: msg?.senderId?._id,
                    user_id: userId,
                    time: getChatTime(msg?.createdAt),
                }));

                setMessages(chatMessages);
            } catch (err) {
                console.error('Error fetching chat messages:', err);
            }
        };

        fetchChatMessages();
    }, [userId, targetUserId]);

    // ✅ Send message handler
    const handleSend = () => {
        if (!newMessage.trim() || !socketRef.current) return;

        socketRef.current.emit("sendMessage", {
            firstName,
            userId,
            targetUserId,
            text: newMessage
        });

        setNewMessage('');
    };

    // ✅ Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ✅ Format chat message time
    const getChatTime = (createdAt) => {
        const msgDate = new Date(createdAt);
        if (isToday(msgDate)) return format(msgDate, 'p');
        if (isYesterday(msgDate)) return `Yesterday, ${format(msgDate, 'p')}`;
        return format(msgDate, 'dd MMM, p');
    };

    // ✅ Get online/offline status
    const getUserOnlineStatus = (lastSeen) => {
        const now = new Date();
        const seenTime = new Date(lastSeen);
        const diffMs = now - seenTime;

        if (diffMs < 60 * 1000) return "Online";
        if (isToday(seenTime)) return `Last seen at ${format(seenTime, 'p')}`;
        if (isYesterday(seenTime)) return `Last seen yesterday at ${format(seenTime, 'p')}`;
        return `Last seen on ${format(seenTime, 'dd MMM yyyy, p')}`;
    };

    return (
        <div className="relative h-screen bg-base-200">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center gap-4 shadow-md">
                <div className="avatar">
                    <div className="w-12 rounded-full border-2 border-white">
                        <img src={targetUserInfo?.profilePic} alt="DP" />
                    </div>
                </div>
                <div>
                    <p className="font-semibold text-white">{targetUserInfo?.firstName}</p>
                    <p className="text-sm text-gray-300">
                        {targetUserInfo?.lastSeen ? getUserOnlineStatus(targetUserInfo.lastSeen) : "Offline"}
                    </p>
                </div>
            </div>

            {/* Chat body */}
            <div className="overflow-y-auto px-4 py-6 space-y-4 pb-32 h-[calc(100vh-12rem)]">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat ${msg.sender === 'me' ? 'chat-end' : 'chat-start'}`}
                    >
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <img alt="User Avatar" src={msg.profilePic} />
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
                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
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



// import React, { useEffect, useRef, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { createSocketConnection } from '../utils/socket';
// import { useSelector } from 'react-redux';
// import axios from 'axios';
// import { BASE_URL } from '../utils/constants';
// import { format, isToday, isYesterday } from 'date-fns';

// function Chat() {
//     const { targetUserId } = useParams();

//     const [messages, setMessages] = useState([]);
//     const [targetUserInfo, setTargetUserInfo] = useState(null);

//     const user = useSelector(store => store.user);
//     const userId = user?._id;
//     const firstName = user?.firstName;



//     useEffect(() => {

//         if (!userId) { return }

//         const socket = createSocketConnection();

//         //as soon as the page load, socket connection made , joinChat event made
//         socket.on('connect', () => {

//             socket.emit("joinChat", {
//                 firstName,
//                 userId,
//                 targetUserId
//             });


//             socket.on("messageReceived", ({ senderId, firstName, profilePic, text, createdAt }) => {
//                 const isMe = senderId === userId;

//                 setMessages((messages) => [
//                     ...messages,
//                     {
//                         name: firstName,
//                         profilePic,
//                         text,
//                         sender: isMe ? 'me' : 'you',
//                         sender_id: senderId,
//                         user_id: userId,
//                         time: getChatTime(createdAt)
//                     }
//                 ]);
//             });
//         });

//         return () => {
//             socket.disconnect();
//         }
//     }, [userId, targetUserId])


//     const [newMessage, setNewMessage] = useState("");
//     const messagesEndRef = useRef(null);

//     const getUserOnlineStatus = (lastSeen) => {
//         const now = new Date();
//         const seenTime = new Date(lastSeen);
//         const diffMs = now - seenTime;

//         if (diffMs < 60 * 1000) {
//             return "Online";
//         } else if (isToday(seenTime)) {
//             return `Last seen at ${format(seenTime, 'p')}`; // ex: 3:14 PM
//         } else if (isYesterday(seenTime)) {
//             return `Last seen yesterday at ${format(seenTime, 'p')}`;
//         } else {
//             return `Last seen on ${format(seenTime, 'dd MMM yyyy, p')}`;
//         }
//     };

//     const getChatTime = (createdAt) => {
//         const msgDate = new Date(createdAt);
//         let formattedTime = '';

//         if (isToday(msgDate)) {
//             formattedTime = format(msgDate, 'p'); // e.g. 2:48 PM
//         } else if (isYesterday(msgDate)) {
//             formattedTime = `Yesterday, ${format(msgDate, 'p')}`;
//         } else {
//             formattedTime = format(msgDate, 'dd MMM, p'); // e.g. 04 Jul, 2:48 PM
//         }

//         return formattedTime;
//     }

//     const fetchChatMessages = async (userId) => {
//         try {
//             const res = await axios.get(`${BASE_URL}/chat/messages/${targetUserId}`, {
//                 withCredentials: true,
//             });

//             const messages = res?.data?.data?.messages || [];

//             const chatMessages = messages.map((msg) => ({
//                 name: msg?.senderId?.firstName,
//                 profilePic: msg?.senderId?.profilePic,
//                 text: msg?.text,
//                 sender: msg?.senderId?._id == userId ? 'me' : 'you',
//                 sender_id: msg?.senderId?._id,
//                 user_id: userId,
//                 time: getChatTime(msg?.createdAt)
//             }));

//             console.log('Fetched Chat Messages:', chatMessages);
//             setMessages(chatMessages);
//         } catch (err) {
//             console.error('Error fetching chat messages:', err);
//         }
//     };

//     useEffect(() => {
//         if (!targetUserId) return;

//         const fetchTargetUser = async () => {
//             try {
//                 const res = await axios.get(`${BASE_URL}/auth/user/${targetUserId}`, { withCredentials: true });
//                 setTargetUserInfo(res.data.data);
//                 console.log('targetUserInfo---', targetUserInfo)
//             } catch (error) {
//                 console.error("Failed to fetch target user info:", error);
//             }
//         };

//         fetchTargetUser();
//     }, [targetUserId]);


//     useEffect(() => {
//         if (!userId) return; // Wait until userId is available
//         fetchChatMessages(userId);
//     }, [userId]);

//     const handleSend = () => {
//         const socket = createSocketConnection();

//         if (!newMessage.trim()) return;

//         socket.emit("sendMessage", {
//             firstName,
//             userId,
//             targetUserId,
//             text: newMessage
//         });
//         setNewMessage('');

//         console.log('send msg--', messages)
//     };

//     // 🔽 Auto scroll to bottom
//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     return (
//         <div className="relative h-screen bg-base-200">
//             {/* Header */}
//             {/* <div className="bg-primary text-white p-4 text-xl font-bold">
//                 Chat Screen Of: {firstName}
//             </div> */}
//             <div className="bg-primary text-white p-4 flex items-center gap-4 shadow-md">
//                 <div className="avatar">
//                     <div className="w-12 rounded-full border-2 border-white">
//                         <img src={targetUserInfo?.profilePic} alt="DP" />
//                     </div>
//                 </div>
//                 <div>
//                     <div className="text-lg font-semibold">{targetUserInfo?.firstName || 'User'}</div>
//                     <p className="text-sm text-white-500">
//                         {targetUserInfo?.lastSeen ? getUserOnlineStatus(targetUserInfo.lastSeen) : "Offline"}
//                     </p>
//                 </div>
//             </div>


//             {/* Chat body */}
//             <div className="overflow-y-auto px-4 py-6 space-y-4 pb-32 h-[calc(100vh-25rem)]">
//                 {messages.map((msg, index) => (
//                     <div
//                         key={index}
//                         className={`chat ${msg.sender === 'me' ? 'chat-end' : 'chat-start'}`}
//                     >
//                         <div className="chat-image avatar">
//                             <div className="w-10 rounded-full">
//                                 <img
//                                     alt="User Avatar"
//                                     src={msg.profilePic}
//                                 />
//                             </div>
//                         </div>
//                         <div className="chat-header">
//                             {msg.sender === 'me' ? 'You' : msg.name || 'User'}
//                             <time className="text-xs opacity-50 ml-2">{msg.time || 'Just now'}</time>
//                         </div>
//                         <div className="chat-bubble">{msg.text}</div>
//                         <div className="chat-footer opacity-50">
//                             {msg.sender === 'me' ? 'Seen' : 'Delivered'}
//                         </div>
//                     </div>
//                 ))}

//                 {/* Invisible div to scroll into view */}
//                 <div ref={messagesEndRef} />
//             </div>

//             {/* Fixed input box at bottom */}
//             <div className="left-0 bg-base-100 p-4 border-t flex items-center gap-2">
//                 <input
//                     type="text"
//                     className="input input-bordered flex-1"
//                     placeholder="Type a message..."
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//                 />
//                 <button className="btn btn-primary" onClick={handleSend}>Send</button>
//             </div>
//         </div>
//     );
// }

// export default Chat;