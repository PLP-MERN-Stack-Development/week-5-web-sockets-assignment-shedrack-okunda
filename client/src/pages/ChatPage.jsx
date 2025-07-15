import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import UserList from "../components/UserList";
import { useSocket } from "../socket/socket";
import TypingIndicator from "../components/TypingIndicators";
import NotificationBell from "../components/NotificationBell";
import SearchBar from "../components/SearchBar";

const ChatPage = () => {
	const username = localStorage.getItem("chat_username");
	const navigate = useNavigate();

	const {
		connect,
		disconnect,
		sendMessage,
		// sendRoomMessage,
		sendPrivateMessage,
		setTyping,
		joinRoom,
		setUnread,
		unread,
		messages,
		typingUsers,
		users,
	} = useSocket();

	const [selectedUser, setSelectedUser] = useState(null); // for private messages
	const [room, setRoom] = useState("general");
	const [query, setQuery] = useState("");

	useEffect(() => {
		if (!username) {
			navigate("/");
		} else {
			connect(username);
			joinRoom(room);
		}
		return () => disconnect();
	}, [username, room]);

	useEffect(() => {
		const onFocus = () => setUnread(0);
		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, []);

	useEffect(() => {
		if ("Notification" in window && Notification.permission !== "granted") {
			Notification.requestPermission();
		}
	}, []);

	const handleSend = (message) => {
		if (selectedUser) {
			sendPrivateMessage(selectedUser.id, message);
		} else {
			sendMessage(message);
			// sendRoomMessage(room, message);
		}
	};

	return (
		<div className="flex flex-col md:flex-row h-screen">
			{/* Sidebar with users */}
			<aside className="md:w-64 w-full bg-gray-100 p-4 border-b md:border-r md:border-b-0">
				<h2 className="text-xl font-bold mb-2">Online Users</h2>
				<UserList
					users={users}
					onSelectUser={(user) => setSelectedUser(user)}
				/>
				{selectedUser && (
					<p className="text-sm mt-2 text-blue-600">
						DMing: <strong>{selectedUser.username}</strong>
					</p>
				)}
			</aside>

			<div className="p-2 bg-gray-200">
				<select
					value={room}
					onChange={(e) => setRoom(e.target.value)}
					className="p-2 rounded">
					<option value="general"># General</option>
					<option value="tech"># Tech</option>
					<option value="random"># Random</option>
				</select>
			</div>

			{/* Main chat area */}
			<main className="flex-1 flex flex-col">
				<header className="bg-blue-600 text-white p-4 text-lg font-semibold">
					<div className="flex items-center justify-between bg-blue-600 text-white px-4 py-2">
						<h1 className="text-lg font-semibold">
							{selectedUser
								? `DM: ${selectedUser.username}`
								: `Room: ${room}`}
						</h1>
						<NotificationBell count={unread} />
					</div>
				</header>

				<div className="flex-1 p-4 overflow-y-auto">
					<SearchBar query={query} setQuery={setQuery} />
					<ChatWindow
						messages={messages}
						currentUser={username}
						query={query}
					/>
					<TypingIndicator typingUsers={typingUsers} />
				</div>

				<footer className="p-4 border-t">
					<MessageInput onSend={handleSend} onTyping={setTyping} />
				</footer>
			</main>
		</div>
	);
};

export default ChatPage;
