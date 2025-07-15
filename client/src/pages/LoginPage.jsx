import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
	const [username, setUsername] = useState("");
	const navigate = useNavigate();

	const handleJoin = () => {
		if (username.trim()) {
			localStorage.setItem("chat_username", username);
			navigate("/chat");
		}
	};

	return (
		<div className="flex items-center justify-center h-screen bg-gray-200">
			<div className="bg-white p-6 rounded-xl shadow-md w-96">
				<h1 className="text-2xl font-bold text-center mb-4">
					Join Chat
				</h1>
				<input
					className="w-full p-3 border rounded mb-4"
					placeholder="Enter username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<button
					onClick={handleJoin}
					className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
					Join
				</button>
			</div>
		</div>
	);
};

export default LoginPage;
