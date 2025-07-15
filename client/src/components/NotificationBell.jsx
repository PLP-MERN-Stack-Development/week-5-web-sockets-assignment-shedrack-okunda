const NotificationBell = ({ count }) => {
	return (
		<div className="relative inline-block">
			<span className="text-2xl">🔔</span>
			{count > 0 && (
				<span className="absolute top-0 right-0 text-xs bg-red-600 text-white rounded-full px-1">
					{count}
				</span>
			)}
		</div>
	);
};

export default NotificationBell;
