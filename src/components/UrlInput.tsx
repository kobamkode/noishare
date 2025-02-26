export const UrlInput = () => {
        return (
                <form action="/submit" method="post" className="flex gap-4">
                        <input type="text" name="playlistUrl" className="grow border rounded-md" placeholder="https://open.spotify.com/playlist/3cEYpjA9oz9GiPac4AsH4n" />
                        <button type="submit" className="p-4 bg-blue-700 rounded-md text-white">submit</button>
                </form>
        );
};

