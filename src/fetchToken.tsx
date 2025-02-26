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

        const data: SpotifyTokenResponse = await response.json();
        return data;
};

