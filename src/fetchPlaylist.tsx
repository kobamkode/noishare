interface SpotifyPlaylistRootResponse {
        collaborative: boolean;
        description: string;
        external_urls: ExternalUrls;
        images: Image[];
        name: string;
        owner: Owner;
        public: boolean;
        type: string;
        id: string
}
interface ExternalUrls {
        spotify: string;
}
interface Image {
        url: string;
}
interface Owner {
        display_name: string;
}
export const fetchPlaylist = async (accessToken: string, playlistId: string): Promise<SpotifyPlaylistRootResponse> => {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                        Authorization: `Bearer ${accessToken}`
                }
        });
        if (!response.ok) {
                throw new Error(`${response.status}: Failed to fetch playlist`)
        } else {
                const data: SpotifyPlaylistRootResponse = await response.json();
                return data;
        }

};

