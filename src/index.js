import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { Hono } from 'hono';
import { renderer } from './renderer';
import { drizzle } from 'drizzle-orm/d1';
import { playlist } from './db/schema';
import { HTTPException } from 'hono/http-exception';
const app = new Hono();
app.use(renderer);
const fetchPlaylist = async (accessToken, playlistId) => {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    return data;
};
const fetchToken = async (clientId, clientSecret) => {
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
    const data = await response.json();
    return data;
};
const PlaylistCard = ({ playlistExtUrl, imageUrl, name, owner }) => {
    return (_jsx("a", { href: playlistExtUrl, className: "block group", children: _jsxs("div", { className: "rounded-lg bg-gray-100 p-3 transition-transform hover:scale-105", children: [_jsx("div", { className: "relative aspect-square overflow-hidden rounded-md", children: _jsx("img", { src: imageUrl || "/placeholder.svg", alt: name, fill: true, className: "object-cover", sizes: "(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw" }) }), _jsxs("div", { className: "mt-3 space-y-1", children: [_jsx("h3", { className: "font-medium", children: name }), _jsx("p", { className: "text-sm text-muted-foreground", children: owner })] })] }) }));
};
const UrlInput = () => {
    return (_jsxs("form", { action: "/submit", method: "post", className: "flex gap-4", children: [_jsx("input", { type: "text", name: "playlistUrl", className: "grow border rounded-md", placeholder: "https://open.spotify.com/playlist/3cEYpjA9oz9GiPac4AsH4n" }), _jsx("button", { type: "submit", className: "p-4 bg-blue-700 rounded-md text-white", children: "submit" })] }));
};
const getString = (formData) => {
    if (formData instanceof File) {
        throw new HTTPException(400);
    }
    if (typeof formData === null) {
        throw new HTTPException(400);
    }
    return formData;
};
app.get('/', async (c) => {
    const db = drizzle(c.env.DB);
    const results = await db.select().from(playlist).all();
    return c.render(_jsxs("div", { className: "flex flex-col p-4 gap-4", children: [_jsx(UrlInput, {}), _jsx("div", { className: "grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 border rounded-md", children: results.map((result, index) => (_jsx(PlaylistCard, { ...result }, index))) })] }));
}).post('/submit', async (c) => {
    //TODO: read playlist id from db, if exist returns error
    const tokenResp = await fetchToken(c.env.SPOTIFY_CLIENT_ID, c.env.SPOTIFY_CLIENT_SECRET);
    const formData = await c.req.formData();
    const playlistUrl = getString(formData.get('playlistUrl')).split('/');
    const spotifyPlaylist = await fetchPlaylist(tokenResp.access_token, playlistUrl[4]);
    if (spotifyPlaylist.type === 'playlist' && spotifyPlaylist.public === true) {
        const db = drizzle(c.env.DB);
        const insertPlaylist = await db.insert(playlist).values({
            name: spotifyPlaylist.name,
            owner: spotifyPlaylist.owner.display_name,
            playlistExtUrl: spotifyPlaylist.external_urls.spotify,
            imageUrl: spotifyPlaylist.images[0].url,
            collaborative: spotifyPlaylist.collaborative
        }).returning();
        console.log(insertPlaylist);
    }
});
export default app;
