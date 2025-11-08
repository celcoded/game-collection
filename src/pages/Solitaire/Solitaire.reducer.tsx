import { cards, gameActions, historyActions, ranks, Sources, suits, type IHistoryState, type ISolitaireState } from "../../data/solitaire";

export const initialGameState: ISolitaireState = {
    foundation: [[],[],[],[]],
    tableau: [[],[],[],[],[],[],[]],
    stock: [],
    lastStockIndex: null,
    score: 0
}

export function gameReducer(state: ISolitaireState, action: {type: string, payload: any}): ISolitaireState {
    const {stock, foundation, tableau, lastStockIndex, score} = state;
    switch (action.type) {
        case gameActions.initialize: {
            let shuffledCards = cards.map(c => ({...c})).sort(() => Math.random() - 0.5);

            const tableauArray: any = [[],[],[],[],[],[],[]];
            for (let i = 0; i < 7; i++) {
                for (let j = 0; j <= i; j++) {
                    let card = shuffledCards[i];
                    if (card) {
                        if (i == j) {
                            card.isOpen = true;
                        }
                        tableauArray[i].push(card);
                        shuffledCards.splice(i, 1);
                    }
                }
            }

            return {
                ...initialGameState,
                stock: shuffledCards,
                tableau: tableauArray
            }
        }
        case gameActions.move: {
            const {
                source,
                colIndex,
                cardIndex,
                lastCardSource,
                lastCardColIndex,
                lastCardIndex,
            } = action.payload

            let newFoundation = foundation.map(col => [...col]);
            let newTableau = tableau.map(col => [...col]);
            let newStock = [...stock];
            let newLastStockIndex = lastStockIndex;
            let newScore = score;

            let lastCard = null;
            let droppedCard = null;

            switch (source) { //get source of card
                case Sources.stock:
                    droppedCard = stock[+cardIndex] ?? null;
                    break;
                case Sources.foundation:
                    droppedCard = foundation[+colIndex][+cardIndex] ?? null;
                    break;
                case Sources.tableau:
                    droppedCard = tableau[+colIndex][+cardIndex] ?? null;
                    break;
                default:
                    break;
            }

            if (!droppedCard || !droppedCard.isOpen) return state;

            switch (lastCardSource) { //get destination of card
                case Sources.foundation:
                    lastCard = foundation[+lastCardColIndex][+lastCardIndex] ?? null;
                    
                    if (suits[+lastCardColIndex] !== droppedCard.suit) return state;
                    if (lastCard && (ranks.indexOf(droppedCard.value) - ranks.indexOf(lastCard.value) !== 1)) return state;

                    newFoundation[+lastCardColIndex] = [...newFoundation[+lastCardColIndex], droppedCard];

                    ({newStock, newFoundation, newTableau, newLastStockIndex} = removeDroppedCard(source, {colIndex, cardIndex}, {
                        stock: newStock,
                        foundation: newFoundation,
                        tableau: newTableau,
                        lastStockIndex: newLastStockIndex
                    }));

                    newScore = score + getPoints(source, lastCardSource);
                    newScore = newScore < 0 ? 0 : newScore;
                    return {stock: newStock, foundation: newFoundation, tableau: newTableau, lastStockIndex: newLastStockIndex, score: newScore};

                case Sources.tableau:
                    if (source === Sources.tableau && colIndex == lastCardColIndex) return state;
                    lastCard = tableau[+lastCardColIndex][+lastCardIndex] ?? null;

                    if (lastCardIndex === 'empty') {
                        if (droppedCard.value !== "K") return state;
                    } else {
                        const isBlack = (suit: string) => (suit === 'clubs' || suit === 'spades');
                        if (isBlack(droppedCard.suit) == isBlack(lastCard.suit)) return state;
                        if (lastCard && (ranks.indexOf(lastCard.value) - ranks.indexOf(droppedCard.value) !== 1)) return state;
                    }

                    let droppedCards = [droppedCard];
                    if (source === Sources.tableau) {
                        droppedCards = tableau[+colIndex].slice(+cardIndex);
                    }

                    newTableau[+lastCardColIndex] = [...newTableau[+lastCardColIndex], ...droppedCards];

                    ({newStock, newFoundation, newTableau, newLastStockIndex} = removeDroppedCard(source, {colIndex, cardIndex}, {
                        stock: newStock,
                        foundation: newFoundation,
                        tableau: newTableau,
                        lastStockIndex: newLastStockIndex
                    }));

                    newScore = score + getPoints(source, lastCardSource);
                    newScore = newScore < 0 ? 0 : newScore;
                    return {stock: newStock, foundation: newFoundation, tableau: newTableau, lastStockIndex: newLastStockIndex, score: newScore};

                default:
                    return state;
            }
        }
        case gameActions.show: {
            const {showNo} = action.payload
            let openCards = stock.filter(card => card.isOpen);
            let currentIndex: number = stock.findIndex((card) => card == openCards[openCards.length-1]);
            let isReset: boolean = false;
            if (currentIndex < 0) {
                currentIndex = openCards.length === 0 && lastStockIndex ? +lastStockIndex : 0;
            } else {
                currentIndex = currentIndex + 1;
                if (currentIndex >= stock.length) {
                    isReset = true;
                }
            }

            let newStock = stock.map((card, index) => {
                const isOpen = index < currentIndex + showNo && !isReset;
                return {...card, isOpen};
            });

            const newLastStockIndex = newStock.some(card => card.isOpen) ? lastStockIndex : null;

            return {...state, stock: newStock, lastStockIndex: newLastStockIndex};
        }
        default:
            return state;
    }
}

const removeDroppedCard = (source: string, cardPosition: {colIndex: string|number, cardIndex: string|number}, state: Omit<ISolitaireState, 'score'>) => {
    let {stock, foundation, tableau, lastStockIndex} = state;
    let newFoundation = foundation.map(col => [...col]);
    let newTableau = tableau.map(col => [...col]);
    let newStock = [...stock];
    let newLastStockIndex = lastStockIndex;

    switch (source) {
        case Sources.stock:
            newLastStockIndex = +cardPosition.cardIndex;
            newStock.splice(+cardPosition.cardIndex, 1);
            break;
        case Sources.foundation:
            newFoundation[+cardPosition.colIndex].splice(+cardPosition.cardIndex, 1);
            break;
        case Sources.tableau:
            const col = +cardPosition.colIndex;
            const idx = +cardPosition.cardIndex;

            const newColumn = [...newTableau[col]];
            newColumn.splice(idx);
            
            if (idx - 1 >= 0) {
                const prevCard = newColumn[idx-1];
                newColumn[idx - 1] =  { ...prevCard, isOpen: true};
            }
            
            newTableau[col] = newColumn;

            break;
    }

    return { newStock, newFoundation, newTableau, newLastStockIndex };
}

const getPoints = (from: string, to: string): number => {
    let points = 0;
    switch (from) {
        case Sources.stock:
            if (to === Sources.tableau) points = 5;
            if (to === Sources.foundation) points = 10;
            break;
        case Sources.foundation:
            if (to === Sources.tableau) points = -15;
            break;
        case Sources.tableau:
            if (to === Sources.foundation) points = 10;
            break;
        default:
            break;
    }
    return points;
}

export function historyReducer<T>(innerReducer: (state: T, action: any) => T) {
    return (state: IHistoryState<T>, action: any) => {
        const {past, present, future} = state;

        switch (action.type) {
            case historyActions.undo:
                if (past.length === 0) return state;
                return {
                    past: past.slice(0, -1),
                    present: past[past.length - 1],
                    future: [present, ...future],
                };
            case historyActions.redo:
                if (future.length === 0) return state;
                return {
                    past: [...past, present],
                    present: future[0],
                    future: future.slice(1),
                };
            case historyActions.reset:
                const resetPresent = innerReducer(present, {type: gameActions.initialize});
                return {
                    past: [],
                    present: resetPresent,
                    future: [],
                };
            default:
                const newPresent = innerReducer(present, action);
                if (newPresent === present) return state;
                if (present === initialGameState) {
                    return {
                        past: [...past],
                        present: newPresent,
                        future: [],
                    };
                }
                return {
                    past: [...past, present],
                    present: newPresent,
                    future: [],
                };
        }
    };
}