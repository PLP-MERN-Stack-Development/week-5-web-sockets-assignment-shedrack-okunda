import { useState } from "react";

const MessageInput = ({ onSend, onTyping }) => {
	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (message.trim()) {
			onSend(message);
			setMessage("");
			onTyping(false);
		}
	};

	return (
		<div className="flex gap-2">
			<input
				className="flex-1 border p-2 rounded"
				placeholder="Type a message..."
				value={message}
				onChange={(e) => {
					setMessage(e.target.value);
					onTyping(e.target.value !== "");
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") handleSend();
				}}
			/>
			<button
				onClick={handleSend}
				className="bg-blue-500 text-white px-4 py-2 rounded">
				Send
			</button>
		</div>
	);
};

export default MessageInput;
