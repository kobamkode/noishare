import { PlaylistCard } from './PlaylistCard';

interface PlaylistItem {
        id: number;
        name: string;
        owner: string;
        imageUrl: string;
        playlistId: string;
        playlistExtUrl: string;
        collaborative: boolean;
        created: string;
}

export interface PlaylistItems {
        results: PlaylistItem[]
}

export const PlaylistWrapper = ({ results }: PlaylistItems) => {
        return (
                <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
                        {results.map((result, index) => (
                                <PlaylistCard key={index} {...result} />
                        ))}
                </div>
        );
};

