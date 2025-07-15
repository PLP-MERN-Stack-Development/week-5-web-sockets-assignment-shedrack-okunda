const SearchBar = ({ query, setQuery }) => {
	return (
		<input
			type="text"
			className="p-2 border rounded w-full mb-2"
			placeholder="Search messages..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
		/>
	);
};
export default SearchBar;
