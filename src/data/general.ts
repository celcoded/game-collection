import Solitaire from '../assets/Thumbnails/Solitaire.png';

export const games = [
	{
		id: 1,
		title: "Solitaire",
		thumbnail: Solitaire,
        url: "/solitaire",
        tag: "casual"
	},
	{
		id: 2,
		title: "Sample",
		thumbnail: "",
        tag: "arcade"
	},
	{
		id: 3,
		title: "Sample",
		thumbnail: "",
        tag: "casual"
	}
];

export const palettes = [
	{ tag: "arcade", ring: "ring-[#7c3aed]/50", glow: "shadow-[0_0_18px_rgba(124,58,237,0.45)]", badge: "bg-[#7c3aed] text-white", grad: "from-[#7c3aed] to-[#ec4899]" },
	{ tag: "action", ring: "ring-[#ef4444]/50", glow: "shadow-[0_0_18px_rgba(239,68,68,0.45)]", badge: "bg-[#ef4444] text-white", grad: "from-[#ef4444] to-[#f97316]" },
	{ tag: "adventure", ring: "ring-[#10b981]/50", glow: "shadow-[0_0_18px_rgba(16,185,129,0.45)]", badge: "bg-[#10b981] text-white", grad: "from-[#10b981] to-[#06b6d4]" },
	{ tag: "casual", ring: "ring-[#f59e0b]/50", glow: "shadow-[0_0_18px_rgba(245,158,11,0.45)]", badge: "bg-[#f59e0b] text-black", grad: "from-[#f59e0b] to-[#f97316]" },
];