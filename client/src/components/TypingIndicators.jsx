const TypingIndicator = ({ typingUsers }) => {
	if (typingUsers.length === 0) return null;

	return (
		<div className="text-sm text-gray-500 mt-2">
			{typingUsers.join(", ")} typing...
		</div>
	);
};

export default TypingIndicator;
