interface SpotifyTokenResponse {
        access_token: string;
        token_type: string;
        expires_in: number;
}
export const fetchToken = async (clientId: string, clientSecret: string): Promise<SpotifyTokenResponse> => {

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        const response = await fetch(`https://accounts.spotify.com/api/token`, {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
        });

        if (!response.ok) {
                throw new Error(`${response.status}: Failed to fetch token`)
        } else {
                const data: SpotifyTokenResponse = await response.json();
                return data;
        }
};

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

