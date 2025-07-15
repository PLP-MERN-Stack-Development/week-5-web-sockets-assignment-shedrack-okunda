const UserList = ({ users, onSelectUser }) => {
	return (
		<ul className="space-y-1">
			{users.map((user) => (
				<li
					key={user.id}
					className="cursor-pointer hover:bg-gray-200 p-2 rounded"
					onClick={() => onSelectUser(user)}>
					🟢 {user.username}
				</li>
			))}
		</ul>
	);
};

export default UserList;
