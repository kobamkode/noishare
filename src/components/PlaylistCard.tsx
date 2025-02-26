interface PlaylistCardProps {
        playlistExtUrl: string;
        imageUrl: string;
        name: string;
        owner: string;
        collaborative: boolean;
}
export const PlaylistCard = ({ playlistExtUrl, imageUrl, name, owner }: PlaylistCardProps) => {
        return (
                <a href={playlistExtUrl} className="block group">
                        <div className="rounded-lg bg-gray-100 p-3 transition-transform hover:scale-105">
                                <div className="relative aspect-square overflow-hidden rounded-md">
                                        <img
                                                src={imageUrl || "/placeholder.svg"}
                                                alt={name}
                                                fill
                                                className="object-cover"
                                                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw" />
                                </div>
                                <div className="mt-3 space-y-1">
                                        <h3 className="font-medium">{name}</h3>
                                        <p className="text-sm text-muted-foreground">{owner}</p>
                                </div>
                        </div>
                </a>
        );
};

