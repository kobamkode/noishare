import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { UrlInput } from './components/UrlInput'
import { playlist } from './db/schema'
import { fetchPlaylist } from './fetchPlaylist'
import { fetchToken } from './fetchToken'
import { getString } from './getString'
import { renderer } from './renderer'
import { HTTPException } from 'hono/http-exception'
import { PlaylistWrapper } from './components/PlaylistWrapper'

export interface Env {
        DB: D1Database,
        SPOTIFY_CLIENT_ID: string,
        SPOTIFY_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()
app.use(renderer)
app.get('/', async (c) => {
        const db = drizzle(c.env.DB)
        const results = await db.select().from(playlist).all()

        return c.render(
                <div className="flex flex-col gap-4">
                        <UrlInput />
                        <PlaylistWrapper results={results} />
                </div>
        )
}).post('/submit', async (c) => {
        try {
                const tokenResp = await fetchToken(c.env.SPOTIFY_CLIENT_ID, c.env.SPOTIFY_CLIENT_SECRET)
                if (tokenResp) {
                        const formData = await c.req.formData()
                        const playlistId = getString(formData.get('playlistUrl'))!.split('/').at(4)
                        const spotifyPlaylist = await getPlaylistInfo(tokenResp.access_token, playlistId!)
                        if (spotifyPlaylist) {
                                const db = drizzle(c.env.DB)
                                const findPlaylist = await db.$count(playlist, eq(playlist.playlistId, spotifyPlaylist.id))

                                if (findPlaylist === 0) {
                                        const submitPlaylist = {
                                                name: spotifyPlaylist.name,
                                                owner: spotifyPlaylist.owner.display_name,
                                                playlistId: spotifyPlaylist.id,
                                                playlistExtUrl: spotifyPlaylist.external_urls.spotify,
                                                imageUrl: spotifyPlaylist.images[0].url,
                                                collaborative: spotifyPlaylist.collaborative
                                        }

                                        if (spotifyPlaylist.type === 'playlist' && spotifyPlaylist.public === true) {
                                                const db = drizzle(c.env.DB)
                                                const insertPlaylist = await db.insert(playlist).values(submitPlaylist).returning()
                                        }
                                } else {
                                        throw new HTTPException(400)
                                }

                        }
                }
        } catch (error) {
                throw new HTTPException(400)
        }

        async function getPlaylistInfo(access_token: string, playlistId: string) {
                const spotifyPlaylist = await fetchPlaylist(access_token, playlistId)
                return spotifyPlaylist
        }
})

export default app
