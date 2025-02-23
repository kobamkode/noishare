import { Hono } from 'hono'
import { renderer } from './renderer'
import { drizzle } from 'drizzle-orm/d1'
import { playlist } from './db/schema'

export interface Env {
  DB: D1Database,
  SPOTIFY_CLIENT_ID: string,
  SPOTIFY_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

app.use(renderer)

type PlaylistCardProps = {
  playlistUrl: string,
  imageUrl: string,
  title: string,
  username: string,
}

const fetchPlaylist = async (accessToken: string, playlistId: string) => {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  console.log(data)
  return data
}

interface SpotifyResponse {
  access_token: string,
  token_type: string,
  expires_in: number
}

const fetchToken = async (clientId: string, clientSecret: string): Promise<SpotifyResponse> => {

  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('client_id', clientId)
  params.append('client_secret', clientSecret)

  const response = await fetch(`https://accounts.spotify.com/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  const data: SpotifyResponse = await response.json();
  return data
}

const PlaylistCard = ({ playlistUrl, imageUrl, title, username }: PlaylistCardProps) => {
  return (
    <a href={playlistUrl} className="block group">
      <div className="rounded-lg bg-gray-100 p-3 transition-transform hover:scale-105">
        <div className="relative aspect-square overflow-hidden rounded-md">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{username}</p>
        </div>
      </div>
    </a>
  )
}

const UrlInput = () => {
  return (
    <form action="/submit" method="post" className="flex gap-4">
      <input type="text" name="playlistUrl" className="grow border rounded-md" placeholder="https://open.spotify.com/playlist/3cEYpjA9oz9GiPac4AsH4n" />
      <button type="submit" className="p-4 bg-blue-700 rounded-md text-white">submit</button>
    </form>
  )
}

app.get('/', async (c) => {
  const db = drizzle(c.env.DB)
  const results = await db.select().from(playlist).all()

  return c.render(
    <>
      <UrlInput />
      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
        {results.map((result, index) => (
          <PlaylistCard key={index} {...result} />
        ))}
      </div>
    </>
  )

}).post('/submit', async (c) => {
  const tokenResp = await fetchToken(c.env.SPOTIFY_CLIENT_ID, c.env.SPOTIFY_CLIENT_SECRET)
  const formData = await c.req.formData()
  const playlistUrl = String(formData.get('playlistUrl'))
  const playlist = playlistUrl.split('/')
  const spotifyResp = await fetchPlaylist(tokenResp.access_token, playlist[4])
  //TODO
})

export default app
