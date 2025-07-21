const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_URL,
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

// Socket.io connection handler
io.on("connection", (socket) => {
	console.log(`User connected: ${socket.id}`);

	// Handle user joining
	socket.on("user_join", (username) => {
		users[socket.id] = { username, id: socket.id };
		io.emit("user_list", Object.values(users));
		io.emit("user_joined", { username, id: socket.id });
		console.log(`${username} joined the chat`);
	});

	// Handle chat messages
	socket.on("send_message", (messageData) => {
		const message = {
			...messageData,
			id: Date.now(),
			sender: users[socket.id]?.username || "Anonymous",
			senderId: socket.id,
			timestamp: new Date().toISOString(),
		};

		messages.push(message);

		// Limit stored messages to prevent memory issues
		if (messages.length > 100) {
			messages.shift();
		}

		// if (callback) callback({ status: "delivered", messageId: message });

		io.emit("receive_message", message);
	});

	// Handle typing indicator
	socket.on("typing", (isTyping) => {
		if (users[socket.id]) {
			const username = users[socket.id].username;

			if (isTyping) {
				typingUsers[socket.id] = username;
			} else {
				delete typingUsers[socket.id];
			}

			io.emit("typing_users", Object.values(typingUsers));
		}
	});

	// Handle private messages
	socket.on("private_message", ({ to, message }) => {
		const messageData = {
			id: Date.now(),
			sender: users[socket.id]?.username || "Anonymous",
			senderId: socket.id,
			message,
			timestamp: new Date().toISOString(),
			isPrivate: true,
		};

		socket.to(to).emit("private_message", messageData);
		socket.emit("private_message", messageData);
	});

	// Join room
	socket.on("join_room", (room) => {
		socket.join(room);
		io.to(room).emit("room_joined", {
			username: users[socket.id]?.username || "Anonymous",
			room,
		});
	});

	// Send message to a specific room
	socket.on("send_room_message", ({ room, message }) => {
		const msg = {
			...message,
			id: Date.now(),
			sender: users[socket.id]?.username || "Anonymous",
			senderId: socket.id,
			timestamp: new Date().toISOString(),
			room,
		};

		messages.push(msg);

		io.to(room).emit("receive_room_message", msg);
	});

	// Handle disconnection
	socket.on("disconnect", () => {
		if (users[socket.id]) {
			const { username } = users[socket.id];
			io.emit("user_left", { username, id: socket.id });
			console.log(`${username} left the chat`);
		}

		delete users[socket.id];
		delete typingUsers[socket.id];

		io.emit("user_list", Object.values(users));
		io.emit("typing_users", Object.values(typingUsers));
	});
});

// API routes
app.get("/api/messages", (req, res) => {
	const { page = 1, limit = 20 } = req.query;
	const start = (page - 1) * limit;
	const paginated = messages
		.slice()
		.reverse()
		.slice(start, start + Number(limit));
	res.json(paginated.reverse()); // Keep oldest-to-newest order
});

app.get("/api/users", (req, res) => {
	res.json(Object.values(users));
});

// Root route
app.get("/", (req, res) => {
	res.send("Socket.io Chat Server is running");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
