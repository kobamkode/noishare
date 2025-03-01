export const UrlInput = () => {
        return (
                <div className="bg-[#000000]">
                        <div className="p-4">
                                <form action="/submit" method="post" className="flex p-4 gap-4">
                                        <input type="text" name="playlistUrl" className="grow p-4 border rounded-full bg-[#1f1f1f] text-[#1ed760]" placeholder="https://open.spotify.com/playlist/..." />
                                </form>
                        </div>
                </div>
        );
};

