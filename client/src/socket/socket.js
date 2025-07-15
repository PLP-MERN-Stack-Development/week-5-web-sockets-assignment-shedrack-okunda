// socket.js - Socket.io client setup

import { io } from "socket.io-client";
import { useEffect, useState } from "react";

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const ding = new Audio("/client/src/assets/ding.mp3");

// Create socket instance
export const socket = io(SOCKET_URL, {
	autoConnect: false,
	reconnection: true,
	reconnectionAttempts: 5,
	reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [lastMessage, setLastMessage] = useState(null);
	const [messages, setMessages] = useState([]);
	const [users, setUsers] = useState([]);
	const [typingUsers, setTypingUsers] = useState([]);
	const [unread, setUnread] = useState(0);

	// Connect to socket server
	const connect = (username) => {
		socket.connect();
		if (username) {
			socket.emit("user_join", username);
		}
	};

	// Disconnect from socket server
	const disconnect = () => {
		socket.disconnect();
	};

	// Send a message
	const sendMessage = (message) => {
		socket.emit("send_message", { message }, (response) => {
			console.log("Message status:", response);
		});
	};

	// Send a private message
	const sendPrivateMessage = (to, message) => {
		socket.emit("private_message", { to, message });
	};

	// Set typing status
	const setTyping = (isTyping) => {
		socket.emit("typing", isTyping);
	};

	const joinRoom = (room) => {
		socket.emit("join_room", room);
	};

	const sendRoomMessage = (room, message) => {
		socket.emit("send_room_message", { room, message });
	};

	const loadOlderMessages = async (page) => {
		try {
			const res = await fetch(`/api/messages?page=${page}&limit=20`);
			const older = await res.json();
			setMessages((prev) => [...older, ...prev]);
		} catch (err) {
			console.error("Failed to load messages:", err);
		}
	};

	// Socket event listeners
	useEffect(() => {
		// Connection events
		const onConnect = () => {
			setIsConnected(true);
		};

		const onDisconnect = () => {
			setIsConnected(false);
		};

		// Message events
		const onReceiveMessage = (msg, username) => {
			setLastMessage(msg);
			setMessages((prev) => [...prev, msg]);

			if (msg.sender !== username) {
				ding.play();
				showBrowserNotification(`${msg.sender}: ${msg.message}`);
				setUnread((prev) => prev + 1);
			}
		};

		const onPrivateMessage = (msg, username) => {
			setLastMessage(msg);
			setMessages((prev) => [...prev, msg]);

			if (msg.sender !== username) {
				ding.play();
				showBrowserNotification(`${msg.sender} (DM): ${msg.message}`);
				setUnread((prev) => prev + 1);
			}
		};

		// User events
		const onUserList = (userList) => {
			setUsers(userList);
		};

		const showBrowserNotification = (text) => {
			if (document.visibilityState === "visible") return;

			if (
				"Notification" in window &&
				Notification.permission === "granted"
			) {
				new Notification("Chat App", { body: text });
			}
		};

		const onUserJoined = (user) => {
			const message = `${user.username} joined the chat`;
			setMessages((prev) => [
				...prev,
				{
					id: Date.now(),
					system: true,
					message,
					timestamp: new Date().toISOString(),
				},
			]);
			showBrowserNotification(message);
		};

		const onUserLeft = (user) => {
			const message = `${user.username} left the chat`;
			setMessages((prev) => [
				...prev,
				{
					id: Date.now(),
					system: true,
					message,
					timestamp: new Date().toISOString(),
				},
			]);
			showBrowserNotification(message);
		};

		// Typing events
		const onTypingUsers = (users) => {
			setTypingUsers(users);
		};

		// Register event listeners
		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("receive_message", onReceiveMessage);
		socket.on("private_message", onPrivateMessage);
		socket.on("user_list", onUserList);
		socket.on("user_joined", onUserJoined);
		socket.on("user_left", onUserLeft);
		socket.on("typing_users", onTypingUsers);

		// Clean up event listeners
		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("receive_message", onReceiveMessage);
			socket.off("private_message", onPrivateMessage);
			socket.off("user_list", onUserList);
			socket.off("user_joined", onUserJoined);
			socket.off("user_left", onUserLeft);
			socket.off("typing_users", onTypingUsers);
		};
	}, []);

	return {
		socket,
		isConnected,
		lastMessage,
		messages,
		users,
		typingUsers,
		connect,
		disconnect,
		sendMessage,
		sendPrivateMessage,
		setTyping,
		joinRoom,
		sendRoomMessage,
		unread,
		setUnread,
		loadOlderMessages,
	};
};

export default socket;
