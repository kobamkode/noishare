import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { UrlInput } from './components/UrlInput'
import { playlist } from './db/schema'
import { fetchToken, fetchPlaylist } from './spotifyWebAPI'
import { renderer } from './renderer'
import { HTTPException } from 'hono/http-exception'
import { PlaylistWrapper } from './components/PlaylistWrapper'
import { secureHeaders } from 'hono/secure-headers'

export interface Env {
        DB: D1Database,
        SPOTIFY_CLIENT_ID: string,
        SPOTIFY_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()
app.use(secureHeaders())
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
        const getPlaylistId = (inputPlaylistUrl: string | File | null) => {
                let playlistUrl: string = typeof inputPlaylistUrl === 'string' ? inputPlaylistUrl : (() => { throw new HTTPException() })()
                if (playlistUrl.includes('?')) {
                        playlistUrl = playlistUrl.split('?').at(0) ?? (() => { throw new HTTPException() })()
                }
                return playlistUrl.split('/').at(4) ?? (() => { throw new HTTPException() })()
        }

        async function getPlaylistInfo(access_token: string, playlistId: string) {
                return await fetchPlaylist(access_token, playlistId)
        }

        try {
                const formData = await c.req.formData()
                const inputPlaylistUrl = formData.get('playlistUrl')
                let playlistId: string = getPlaylistId(inputPlaylistUrl)

                const tokenResp = await fetchToken(c.env.SPOTIFY_CLIENT_ID, c.env.SPOTIFY_CLIENT_SECRET)
                if (tokenResp) {
                        const spotifyPlaylist = await getPlaylistInfo(tokenResp.access_token, playlistId)
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
                                        console.log(submitPlaylist)

                                        if (spotifyPlaylist.type === 'playlist' && spotifyPlaylist.public === true) {
                                                const db = drizzle(c.env.DB)
                                                await db.insert(playlist).values(submitPlaylist)


                                        }
                                } else {
                                        throw new HTTPException()
                                }

                        }
                }
                return c.redirect('/')
        } catch (error) {
                throw new HTTPException()
        }

})

export default app
