import { useState } from "react";
import { Link } from "react-router";
import { games, palettes } from "../../data/general";
const Home = () => {
	const [selectedId, setSelectedId] = useState<number | null>(null);

	return (
		<>
			{/* arcade-style dark background */}
			<div className="h-screen w-full bg-gradient-to-br from-black via-slate-900 to-zinc-900">
				<div className="flex flex-col mx-auto h-full">
                    <div>
                        <div className="grow-0 m-4 mb-0">
                            <h1 className="text-4xl font-extrabold mb-1 text-white tracking-wider">THE GAME COLLECTION</h1>
                            <p className="text-sm text-slate-300 mb-6">Explore the games I'm still developing and learning from!</p>
                        </div>
                        <div>
                            
                        </div>
                    </div>

                    <div className="grow-1 overflow-auto">
                        {/* grid: 1..4 columns, items fill width */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-4 mt-2 mb-4">
                            {games.map((game, idx) => {
                                const selected = selectedId === game.id;
                                const palette = palettes[game.tag ? palettes.findIndex(p => p.tag === game.tag) : idx % palettes.length] || palettes[idx % palettes.length];
                                return (
                                    <Link
                                        key={game.id}
                                        to={game.url || '#'}
                                        onClick={() => setSelectedId(selectedId === game.id ? null : game.id)}
                                        className={`flex flex-col h-56 group/game-card rounded-lg overflow-hidden transform transition-all duration-200 focus:outline-none ${
                                            selected ? `scale-105 ring-4 ${palette.ring} ${palette.glow}` : "hover:scale-[1.03] hover:shadow-lg"
                                        } bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700`}
                                        aria-pressed={selected}
                                    >
                                        {/* image / preview area */}
                                        <div className="relative flex-1 w-full bg-black/20">
                                            {game.thumbnail ? (
                                                <div className="h-full w-full flex items-center justify-center" style={{'backgroundImage': game.thumbnail ? `url(${game.thumbnail})` : undefined, 'backgroundSize': 'cover', 'backgroundPosition': 'center'}}>
                                                </div>
                                            ) : (
                                                // arcade placeholder for blank slots
                                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-zinc-900">
                                                    <div className="text-center">
                                                        <div className="mx-auto mb-2 w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div className="text-xs uppercase text-slate-400 tracking-widest">No Thumbnail</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* tag */}
                                            <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold uppercase rounded ${palette.badge} opacity-95`}>
                                                {game.tag}
                                            </span>
                                        </div>

                                        {/* footer / title */}
                                        <div className="p-3 bg-gradient-to-tr from-slate-800 to-slate-900 border-t border-slate-700 z-10">
                                            <h2
                                                className="text-sm font-extrabold uppercase tracking-wider group-hover/game-card:bg-clip-text group-hover/game-card:text-transparent group-hover/game-card:bg-gradient-to-r group-hover/game-card:from-[#f472b6] group-hover/game-card:to-[#60a5fa] text-white"
                                            >
                                                {game.title || "Random Game"}
                                            </h2>
                                            <p className="mt-1 text-xs text-slate-400">Press to play</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
				</div>
			</div>
		</>
	);
};

export default Home;