function createStorage(key: string) {
	function set(value: string) {
		localStorage.setItem(key, value);
	}

	function get() {
		return localStorage.getItem(key);
	}

	function remove() {
		localStorage.removeItem(key);
	}

	return { set, get, remove };
}

export const storage = {
	accessToken: createStorage("accessToken"),
	clear: () => localStorage.clear(),
};
