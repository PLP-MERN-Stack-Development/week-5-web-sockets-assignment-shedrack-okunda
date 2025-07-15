const ChatWindow = ({
	messages,
	loadMore,
	currentUser,
	currentRoom,
	query,
}) => {
	return (
		<div className="space-y-2 overflow-y-auto">
			<button
				onClick={loadMore}
				className="text-blue-500 text-sm underline mb-2">
				Load older messages
			</button>

			{messages
				.filter((msg) =>
					msg.message?.toLowerCase().includes(query.toLowerCase())
				)
				.filter((msg) => !msg.room || msg.room === currentRoom)
				.map((msg) => (
					<div key={msg.id} className="text-sm">
						<span className="font-semibold text-blue-600">
							{msg.sender === currentUser ? "You" : msg.sender}
						</span>
						{msg.isPrivate && (
							<span className="ml-1 text-red-500">(private)</span>
						)}
						: <span>{msg.message}</span>
						<span className="text-gray-500 ml-2 text-xs">
							{new Date(msg.timestamp).toLocaleTimeString()}
						</span>
					</div>
				))}
		</div>
	);
};

export default ChatWindow;
