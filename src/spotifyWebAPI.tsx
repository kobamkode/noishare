type TokenSuccess = {
        access_token: string;
        token_type: string;
        expires_in: number;
}

type TokenFail = {
        error: string
        error_description: string
}

type SpotifyTokenResponse = TokenSuccess | TokenFail

export const fetchToken = async (clientId: string, clientSecret: string): Promise<any> => {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        try {
                const response = await fetch(`https://accounts.spotify.com/api/token`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: params
                });
                const data: SpotifyTokenResponse = await response.json();

                if ('error' in data) {
                        throw new Error(`${data.error}: ${data.error_description}`)
                }

                return data

        } catch (error) {
                throw error
        }

};

type PlaylistSuccess = {
        collaborative: boolean;
        description: string;
        external_urls: {
                spotify: string;
        };
        images: [{
                url: string;
        }];
        name: string;
        owner: {
                display_name: string;
        };
        public: boolean;
        type: string;
        id: string
}

type PlaylistFail = {
        error: {
                status: number
                message: string
        }
}

type SpotifyPlaylistResponse = PlaylistSuccess | PlaylistFail

export const fetchPlaylist = async (accessToken: string, playlistId: string): Promise<any> => {
        try {
                const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                        headers: {
                                Authorization: `Bearer ${accessToken}`
                        }
                });
                const data: SpotifyPlaylistResponse = await response.json();
                if ('error' in data) {
                        throw new Error(`${data.error.status}: ${data.error.message}`)
                }
                return data
        } catch (error) {
                throw error
        }
};

