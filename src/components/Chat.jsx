import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { createSocketConnection } from '../utils/socket';
import { format, isToday, isYesterday } from 'date-fns';

function Chat() {
    const { targetUserId } = useParams();
    const user = useSelector((store) => store.user);
    const userId = user?._id;
    const firstName = user?.firstName;
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [targetUserInfo, setTargetUserInfo] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [hasMore, setHasMore] = useState(true);

    const messagesEndRef = useRef(null);
    const chatBodyRef = useRef(null);
    const socketRef = useRef(null);
    const scrollMeta = useRef({ prevScrollHeight: 0, adjustScroll: false });

    // Fetch target user info
    useEffect(() => {
        if (!targetUserId) return;

        const fetchTargetUser = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/auth/user/${targetUserId}`, { withCredentials: true });
                setTargetUserInfo(res.data.data);
            } catch (err) {
                if (err.status === 401)
                    navigate("/login");
                console.error("Error fetching user info", err);
            }
        };

        fetchTargetUser();
    }, [targetUserId]);

    // Fetch messages with pagination
    const fetchChatMessages = async (pg = 1) => {
        try {
            const res = await axios.get(`${BASE_URL}/chat/messages/${targetUserId}?page=${pg}&limit=${limit}`, { withCredentials: true });
            const newMsgs = res?.data?.data?.messages || [];

            const formatted = newMsgs.map((msg) => ({
                name: msg?.senderId?.firstName,
                profilePic: msg?.senderId?.profilePic,
                text: msg?.text,
                sender: msg?.senderId?._id === userId ? 'me' : 'you',
                sender_id: msg?.senderId?._id,
                user_id: userId,
                time: getChatTime(msg?.createdAt)
            }));

            setMessages((prev) => [...formatted.reverse(), ...prev]);
            setHasMore(newMsgs.length >= limit);
        } catch (err) {
            console.error("Error fetching messages", err);
        }
    };

    useEffect(() => {
        if (!userId || !targetUserId) return;
        fetchChatMessages(page);
    }, [userId, targetUserId, page]);

    // Socket connection
    useEffect(() => {
        if (!userId || !targetUserId) return;

        socketRef.current = createSocketConnection();
        socketRef.current.on("connect", () => {
            socketRef.current.emit("joinChat", { firstName, userId, targetUserId });
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

        return () => socketRef.current.disconnect();
    }, [userId, targetUserId]);

    const handleSend = () => {
        if (!newMessage.trim() || !socketRef.current) return;

        socketRef.current.emit("sendMessage", { firstName, userId, targetUserId, text: newMessage });
        setNewMessage("");
    };

    // Scroll to bottom on new message only if not loading old ones
    useEffect(() => {
        if (scrollMeta.current.adjustScroll && chatBodyRef.current) {
            const newScrollHeight = chatBodyRef.current.scrollHeight;
            const diff = newScrollHeight - scrollMeta.current.prevScrollHeight;
            chatBodyRef.current.scrollTop = diff;
            scrollMeta.current.adjustScroll = false;
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleScroll = () => {
        const el = chatBodyRef.current;
        if (el.scrollTop === 0 && hasMore) {
            scrollMeta.current.prevScrollHeight = el.scrollHeight;
            scrollMeta.current.adjustScroll = true;
            setPage((prev) => prev + 1);
        }
    };

    const getChatTime = (createdAt) => {
        const msgDate = new Date(createdAt);
        if (isToday(msgDate)) return format(msgDate, 'p');
        if (isYesterday(msgDate)) return `Yesterday, ${format(msgDate, 'p')}`;
        return format(msgDate, 'dd MMM, p');
    };

    const getUserOnlineStatus = (lastSeen) => {
        const now = new Date();
        const seenTime = new Date(lastSeen);
        const diff = now - seenTime;

        if (diff < 60 * 1000) return "Online";
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
            <div
                ref={chatBodyRef}
                onScroll={handleScroll}
                className="overflow-y-auto px-4 py-6 space-y-4 pb-32 h-[calc(100vh-12rem)]"
            >
                {messages.map((msg, index) => (
                    <div key={index} className={`chat ${msg.sender === 'me' ? 'chat-end' : 'chat-start'}`}>
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <img src={msg.profilePic} alt="avatar" />
                            </div>
                        </div>
                        <div className="chat-header">
                            {msg.sender === 'me' ? 'You' : msg.name || 'User'}
                            <time className="text-xs opacity-50 ml-2">{msg.time}</time>
                        </div>
                        <div className="chat-bubble">{msg.text}</div>
                        <div className="chat-footer opacity-50">{msg.sender === 'me' ? 'Seen' : 'Delivered'}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
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
//     const user = useSelector((store) => store.user);
//     const userId = user?._id;
//     const firstName = user?.firstName;

//     const [messages, setMessages] = useState([]);
//     const [targetUserInfo, setTargetUserInfo] = useState(null);
//     const [newMessage, setNewMessage] = useState("");
//     const [page, setPage] = useState(1);
//     const [hasMore, setHasMore] = useState(true);
//     const [isPaginating, setIsPaginating] = useState(false);

//     const messagesEndRef = useRef(null);
//     const chatContainerRef = useRef(null);
//     const socketRef = useRef(null);

//     // ✅ Get target user info
//     useEffect(() => {
//         if (!targetUserId) return;

//         const fetchTargetUser = async () => {
//             try {
//                 const res = await axios.get(`${BASE_URL}/auth/user/${targetUserId}`, {
//                     withCredentials: true,
//                 });
//                 setTargetUserInfo(res.data.data);
//             } catch (error) {
//                 console.error("Failed to fetch target user info:", error);
//             }
//         };

//         fetchTargetUser();
//     }, [targetUserId]);

//     // ✅ Establish socket connection
//     useEffect(() => {
//         if (!userId || !targetUserId) return;

//         socketRef.current = createSocketConnection();

//         socketRef.current.on('connect', () => {
//             socketRef.current.emit("joinChat", { firstName, userId, targetUserId });

//             socketRef.current.on("messageReceived", ({ senderId, firstName, profilePic, text, createdAt }) => {
//                 const isMe = senderId === userId;
//                 setMessages(prev => [
//                     ...prev,
//                     {
//                         name: firstName,
//                         profilePic,
//                         text,
//                         sender: isMe ? 'me' : 'you',
//                         sender_id: senderId,
//                         user_id: userId,
//                         time: getChatTime(createdAt),
//                     }
//                 ]);
//             });
//         });

//         return () => {
//             socketRef.current?.disconnect();
//         };
//     }, [userId, targetUserId]);

//     // ✅ Fetch chat messages
//     const fetchChatMessages = async (pageNum = 1) => {
//         try {
//             const res = await axios.get(`${BASE_URL}/chat/messages/${targetUserId}?page=${pageNum}&limit=15`, {
//                 withCredentials: true,
//             });

//             const messages = res?.data?.data?.messages || [];

//             const chatMessages = messages.map((msg) => ({
//                 name: msg?.senderId?.firstName,
//                 profilePic: msg?.senderId?.profilePic,
//                 text: msg?.text,
//                 sender: msg?.senderId?._id === userId ? 'me' : 'you',
//                 sender_id: msg?.senderId?._id,
//                 user_id: userId,
//                 time: getChatTime(msg?.createdAt),
//             }));

//             return chatMessages;
//         } catch (err) {
//             console.error('Error fetching chat messages:', err);
//             return [];
//         }
//     };

//     // ✅ Initial load
//     useEffect(() => {
//         if (!userId || !targetUserId) return;

//         const loadInitialMessages = async () => {
//             const chatMessages = await fetchChatMessages(1);
//             setMessages(chatMessages.reverse()); // oldest on top
//             setPage(2);
//         };

//         loadInitialMessages();
//     }, [userId, targetUserId]);

//     // ✅ Handle scroll to top for pagination
//     const handleScroll = async () => {
//         if (!chatContainerRef.current || isPaginating || !hasMore) return;

//         const { scrollTop, scrollHeight } = chatContainerRef.current;
//         if (scrollTop === 0) {
//             setIsPaginating(true);
//             const prevHeight = scrollHeight;

//             const olderMessages = await fetchChatMessages(page);

//             if (olderMessages.length === 0) {
//                 setHasMore(false);
//                 setIsPaginating(false);
//                 return;
//             }

//             setMessages((prev) => [...olderMessages.reverse(), ...prev]);
//             setPage(prev => prev + 1);

//             setTimeout(() => {
//                 const newHeight = chatContainerRef.current.scrollHeight;
//                 chatContainerRef.current.scrollTop = newHeight - prevHeight;
//                 setIsPaginating(false);
//             }, 0);
//         }
//     };

//     // ✅ Scroll to bottom on new message (but not on pagination)
//     useEffect(() => {
//         if (!isPaginating) {
//             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//         }
//     }, [messages]);

//     // ✅ Send message
//     const handleSend = () => {
//         if (!newMessage.trim() || !socketRef.current) return;

//         socketRef.current.emit("sendMessage", {
//             firstName,
//             userId,
//             targetUserId,
//             text: newMessage
//         });

//         setNewMessage('');
//     };

//     // ✅ Format chat time
//     const getChatTime = (createdAt) => {
//         const msgDate = new Date(createdAt);
//         if (isToday(msgDate)) return format(msgDate, 'p');
//         if (isYesterday(msgDate)) return `Yesterday, ${format(msgDate, 'p')}`;
//         return format(msgDate, 'dd MMM, p');
//     };

//     // ✅ User online status
//     const getUserOnlineStatus = (lastSeen) => {
//         const now = new Date();
//         const seenTime = new Date(lastSeen);
//         const diffMs = now - seenTime;

//         if (diffMs < 60 * 1000) return "Online";
//         if (isToday(seenTime)) return `Last seen at ${format(seenTime, 'p')}`;
//         if (isYesterday(seenTime)) return `Last seen yesterday at ${format(seenTime, 'p')}`;
//         return `Last seen on ${format(seenTime, 'dd MMM yyyy, p')}`;
//     };

//     return (
//         <div className="relative h-screen bg-base-200">
//             {/* Header */}
//             <div className="bg-primary text-white p-4 flex items-center gap-4 shadow-md">
//                 <div className="avatar">
//                     <div className="w-12 rounded-full border-2 border-white">
//                         <img src={targetUserInfo?.profilePic} alt="DP" />
//                     </div>
//                 </div>
//                 <div>
//                     <p className="font-semibold text-white">{targetUserInfo?.firstName}</p>
//                     <p className="text-sm text-gray-300">
//                         {targetUserInfo?.lastSeen ? getUserOnlineStatus(targetUserInfo.lastSeen) : "Offline"}
//                     </p>
//                 </div>
//             </div>

//             {/* Chat Body */}
//             <div
//                 ref={chatContainerRef}
//                 onScroll={handleScroll}
//                 className="overflow-y-auto px-4 py-6 space-y-4 pb-32 h-[calc(100vh-12rem)]"
//             >
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`chat ${msg.sender === 'me' ? 'chat-end' : 'chat-start'}`}>
//                         <div className="chat-image avatar">
//                             <div className="w-10 rounded-full">
//                                 <img alt="User Avatar" src={msg.profilePic} />
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
//                 <div ref={messagesEndRef} />
//             </div>

//             {/* Input */}
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



// import React, { useEffect, useRef, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { createSocketConnection } from '../utils/socket';
// import { useSelector } from 'react-redux';
// import axios from 'axios';
// import { BASE_URL } from '../utils/constants';
// import { format, isToday, isYesterday } from 'date-fns';

// function Chat() {
//     const { targetUserId } = useParams();
//     const user = useSelector((store) => store.user);
//     const userId = user?._id;
//     const firstName = user?.firstName;

//     const [messages, setMessages] = useState([]);
//     const [targetUserInfo, setTargetUserInfo] = useState(null);
//     const [newMessage, setNewMessage] = useState("");
//     const [page, setPage] = useState(1);
//     const [limit, setLimit] = useState(10);
//     const [hasMore, setHasMore] = useState(true);
//     const messagesEndRef = useRef(null);
//     const chatContainerRef = useRef(null);
//     const socketRef = useRef(null);
//     const [isPaginating, setIsPaginating] = useState(false);

//     useEffect(() => {
//         if (!isPaginating) {
//             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//         }
//     }, [messages]);

//     useEffect(() => {
//         if (!targetUserId) return;

//         const fetchTargetUser = async () => {
//             try {
//                 const res = await axios.get(`${BASE_URL}/auth/user/${targetUserId}`, {
//                     withCredentials: true,
//                 });
//                 setTargetUserInfo(res.data.data);
//             } catch (error) {
//                 console.error("Failed to fetch target user info:", error);
//             }
//         };

//         fetchTargetUser();
//     }, [targetUserId]);

//     useEffect(() => {
//         if (!userId || !targetUserId) return;

//         socketRef.current = createSocketConnection();

//         socketRef.current.on('connect', () => {
//             socketRef.current.emit("joinChat", {
//                 firstName,
//                 userId,
//                 targetUserId
//             });

//             socketRef.current.on("messageReceived", ({ senderId, firstName, profilePic, text, createdAt }) => {
//                 const isMe = senderId === userId;
//                 setMessages((prev) => [
//                     ...prev,
//                     {
//                         name: firstName,
//                         profilePic,
//                         text,
//                         sender: isMe ? 'me' : 'you',
//                         sender_id: senderId,
//                         user_id: userId,
//                         time: getChatTime(createdAt),
//                     }
//                 ]);
//             });
//         });

//         return () => {
//             socketRef.current.disconnect();
//         };
//     }, [userId, targetUserId]);

//     const fetchChatMessages = async (pageNum = 1) => {
//         try {
//             const container = chatContainerRef.current;
//             const previousHeight = container?.scrollHeight;

//             console.log('container---', container)
//             console.log('previousHeight---', previousHeight)

//             const res = await axios.get(`${BASE_URL}/chat/messages/${targetUserId}?page=${pageNum}&limit=${limit}`, {
//                 withCredentials: true,
//             });

//             const fetchedMessages = res?.data?.data?.messages || [];

//             const formatted = fetchedMessages.map((msg) => ({
//                 name: msg?.senderId?.firstName,
//                 profilePic: msg?.senderId?.profilePic,
//                 text: msg?.text,
//                 sender: msg?.senderId?._id === userId ? 'me' : 'you',
//                 sender_id: msg?.senderId?._id,
//                 user_id: userId,
//                 time: getChatTime(msg?.createdAt),
//             }));

//             setMessages((prev) => [...formatted, ...prev]);

//             if (fetchedMessages.length < limit) setHasMore(false);

//             requestAnimationFrame(() => {
//                 if (container) {
//                     container.scrollTop = container.scrollHeight - previousHeight;
//                 }
//             });
//         } catch (err) {
//             console.error('Error fetching chat messages:', err);
//         }
//     };

//     useEffect(() => {
//         if (userId && targetUserId) {
//             setPage(1);
//             setMessages([]);
//             setHasMore(true);
//             fetchChatMessages(1);
//         }
//     }, [userId, targetUserId]);

//     useEffect(() => {
//         const container = chatContainerRef.current;
//         if (!container) return;

//         const handleScroll = async() => {
//             if (container.scrollTop === 0 && hasMore) {
//                 const nextPage = page + 1;
//                 setPage(nextPage);
//                 fetchChatMessages(nextPage);
//             }
//         };

//         container.addEventListener("scroll", handleScroll);
//         return () => container.removeEventListener("scroll", handleScroll);
//     }, [page, hasMore]);

//     const handleSend = () => {
//         if (!newMessage.trim() || !socketRef.current) return;

//         socketRef.current.emit("sendMessage", {
//             firstName,
//             userId,
//             targetUserId,
//             text: newMessage
//         });

//         setNewMessage('');
//     };

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     const getChatTime = (createdAt) => {
//         const msgDate = new Date(createdAt);
//         if (isToday(msgDate)) return format(msgDate, 'p');
//         if (isYesterday(msgDate)) return `Yesterday, ${format(msgDate, 'p')}`;
//         return format(msgDate, 'dd MMM, p');
//     };

//     const getUserOnlineStatus = (lastSeen) => {
//         const now = new Date();
//         const seenTime = new Date(lastSeen);
//         const diffMs = now - seenTime;

//         if (diffMs < 60 * 1000) return "Online";
//         if (isToday(seenTime)) return `Last seen at ${format(seenTime, 'p')}`;
//         if (isYesterday(seenTime)) return `Last seen yesterday at ${format(seenTime, 'p')}`;
//         return `Last seen on ${format(seenTime, 'dd MMM yyyy, p')}`;
//     };

//     return (
//         <div className="relative h-screen bg-base-200">
//             <div className="bg-primary text-white p-4 flex items-center gap-4 shadow-md">
//                 <div className="avatar">
//                     <div className="w-12 rounded-full border-2 border-white">
//                         <img src={targetUserInfo?.profilePic} alt="DP" />
//                     </div>
//                 </div>
//                 <div>
//                     <p className="font-semibold text-white">{targetUserInfo?.firstName}</p>
//                     <p className="text-sm text-gray-300">
//                         {targetUserInfo?.lastSeen ? getUserOnlineStatus(targetUserInfo.lastSeen) : "Offline"}
//                     </p>
//                 </div>
//             </div>

//             <div ref={chatContainerRef} className="overflow-y-auto px-4 py-6 space-y-4 pb-32 h-[calc(100vh-12rem)]">
//                 {messages.map((msg, index) => (
//                     <div
//                         key={index}
//                         className={`chat ${msg.sender === 'me' ? 'chat-end' : 'chat-start'}`}
//                     >
//                         <div className="chat-image avatar">
//                             <div className="w-10 rounded-full">
//                                 <img alt="User Avatar" src={msg.profilePic} />
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
//                 <div ref={messagesEndRef} />
//             </div>

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

