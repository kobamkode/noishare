import { Hono } from 'hono'
import { renderer } from './renderer'
import { drizzle } from 'drizzle-orm/d1'
import { playlist } from './db/schema'
import { HTTPException } from 'hono/http-exception'

export interface Env {
  DB: D1Database,
  SPOTIFY_CLIENT_ID: string,
  SPOTIFY_CLIENT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

app.use(renderer)

interface SpotifyPlaylistRootResponse {
  collaborative: boolean
  description: string
  external_urls: ExternalUrls
  images: Image[]
  name: string
  owner: Owner
  public: boolean
  type: string
}

interface ExternalUrls {
  spotify: string
}

interface Image {
  url: string
}

interface Owner {
  display_name: string
}

const fetchPlaylist = async (accessToken: string, playlistId: string): Promise<SpotifyPlaylistRootResponse> => {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data: SpotifyPlaylistRootResponse = await response.json();
  return data
}

interface SpotifyTokenResponse {
  access_token: string,
  token_type: string,
  expires_in: number
}

const fetchToken = async (clientId: string, clientSecret: string): Promise<SpotifyTokenResponse> => {

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

  const data: SpotifyTokenResponse = await response.json();
  return data
}

interface PlaylistCardProps {
  playlistExtUrl: string,
  imageUrl: string,
  name: string,
  owner: string,
  collaborative: boolean,
}

const PlaylistCard = ({ playlistExtUrl, imageUrl, name, owner }: PlaylistCardProps) => {
  return (
    <a href={playlistExtUrl} className="block group">
      <div className="rounded-lg bg-gray-100 p-3 transition-transform hover:scale-105">
        <div className="relative aspect-square overflow-hidden rounded-md">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">{owner}</p>
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

const getString = (formData: File | string | null) => {
  if (formData instanceof File) {
    throw new HTTPException(400)
  }

  if (typeof formData === null) {
    throw new HTTPException(400)
  }

  return formData
}

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
  //TODO: read playlist id from db, if exist returns error

  const tokenResp = await fetchToken(c.env.SPOTIFY_CLIENT_ID, c.env.SPOTIFY_CLIENT_SECRET)
  const formData = await c.req.formData()
  const playlistUrl = getString(formData.get('playlistUrl'))!.split('/')
  const spotifyPlaylist = await fetchPlaylist(tokenResp.access_token, playlistUrl[4])

  if (spotifyPlaylist.type === 'playlist' && spotifyPlaylist.public === true) {
    const db = drizzle(c.env.DB)
    const insertPlaylist = await db.insert(playlist).values({
      name: spotifyPlaylist.name,
      owner: spotifyPlaylist.owner.display_name,
      playlistExtUrl: spotifyPlaylist.external_urls.spotify,
      imageUrl: spotifyPlaylist.images[0].url,
      collaborative: spotifyPlaylist.collaborative
    }).returning()
    console.log(insertPlaylist)
  }
})

export default app
