type PlaylistCardProps = {
        name: string
        owner: string
        imageUrl: string
        playlistExtUrl: string
}

export const PlaylistCard = ({ playlistExtUrl, imageUrl, name, owner }: PlaylistCardProps) => {
        return (
                <a href={playlistExtUrl} className="block group">
                        <div className="p-3">
                                <div className="relative aspect-square overflow-hidden rounded-md">
                                        <img
                                                src={imageUrl}
                                                alt={name}
                                                fill
                                                className="object-cover"
                                                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw" />
                                </div>
                                <div className="mt-3 space-y-1">
                                        <h3 className="text-[#1ed760] font-medium">{name}</h3>
                                        <p className="text-sm text-[#a0a0a0]">{owner}</p>
                                </div>
                        </div>
                </a>
        );
};

