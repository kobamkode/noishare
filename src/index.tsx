import { Hono } from 'hono'
import { renderer } from './renderer'
import { drizzle } from 'drizzle-orm/d1'
import { playlist } from './db/schema'

export interface Env {
  DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

app.use(renderer)

type PlaylistCardProps = {
  imageUrl: string,
  title: string,
  username: string
}

const PlaylistCard = ({ imageUrl, title, username }: PlaylistCardProps) => {
  return (
    <a href="#" className="block group">
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

app.get('/', async (c) => {
  const db = drizzle(c.env.DB)
  const results = await db.select().from(playlist).all()

  return c.render(
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
      {results.map((result, index) => (
        <PlaylistCard key={index} {...result} />
      ))}
    </div>
  )
})

export default app
