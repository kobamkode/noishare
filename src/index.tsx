import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'
import { playlist } from './db/schema'
import { fetchPlaylist } from './fetchPlaylist'
import { fetchToken } from './fetchToken'
import { getString } from './getString'
import { PlaylistCard } from './components/PlaylistCard'
import { renderer } from './renderer'
import { UrlInput } from './components/UrlInput'
import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'

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
                <div className="flex flex-col p-4 gap-4">
                        <UrlInput />
                        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 border rounded-md">
                                {results.map((result, index) => (
                                        <PlaylistCard key={index} {...result} />
                                ))}
                        </div>
                </div>
        )
}).post('/submit', async (c) => {
        try {
                const tokenResp = await fetchToken(c.env.SPOTIFY_CLIENT_ID, c.env.SPOTIFY_CLIENT_SECRET)
                //TODO: check error response
                const formData = await c.req.formData()

                const playlistUrl = getString(formData.get('playlistUrl'))!.split('/')
                const spotifyPlaylist = await fetchPlaylist(tokenResp.access_token, playlistUrl[4])
                //TODO: check error response


                //const db = drizzle(c.env.DB)
                //const findPlaylist = await db.$count(playlist, eq(playlist.playlistId, spotifyPlaylist.id))
                //console.log(findPlaylist)
                //
                //if (findPlaylist > 0) {
                //        throw new HTTPException(403)
                //}

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
                        const insertPlaylist = await db.insert(playlist).values(submitPlaylist).returning()
                        console.log(insertPlaylist)
                }

        } catch (error) {
                console.error(error)
        }
})

export default app
