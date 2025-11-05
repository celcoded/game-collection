type Card = { value: string; img: string };
type SuitGroup = { suit: string; cards: Card[] };

export interface ICard {
	suit: string
	value: string
	img: string
	isOpen: boolean
}

export const Sources = {
	stock: "stock",
	foundation: "foundation",
	tableau: "tableau",
}

export const historyButtons = {
	undo: "undo",
	redo: "redo",
	reset: "reset",
}

export const Difficulties = {
	difficult: "difficult",
	easy: "easy",
}

export const suits = ["hearts", "diamonds", "clubs", "spades"];
export const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const nameFor = (value: string) => {
	// map face values to filenames
	if (value === "A") return "ace";
	if (value === "J") return "jack";
	if (value === "Q") return "queen";
	if (value === "K") return "king";
	return value; // numbers (2..10)
};

export const solitaireCards: SuitGroup[] = suits.map((suit) => ({
	suit,
	cards: ranks.map((value) => ({
		value,
		img: `src/assets/Playing Cards/${nameFor(value)}_of_${suit}.svg`,
	})),
}));

// convenience flattened list (suit included per card)
export const solitaireCardsFlat = solitaireCards.flatMap((g) =>
	g.cards.map((c) => ({ suit: g.suit, value: c.value, img: c.img }))
);

export const solitaireSuits = suits;

export const getCardsBySuit = (suit: string) => solitaireCards.find((g) => g.suit === suit)?.cards || [];