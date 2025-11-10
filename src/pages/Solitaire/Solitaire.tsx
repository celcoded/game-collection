import { useEffect, useReducer, useState } from "react";
import { cards, Difficulties, gameActions, historyActions, lowScoreMessages, Sources, suits, type ICard } from "../../data/solitaire";
import SolitaireCard from "./Solitaire-card";
import { gameReducer, historyReducer, initialGameState } from "./Solitaire.reducer";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Draggable } from "./Draggrable";
import { Droppable } from "./Droppable";
import { CardDragDrop } from "./CardDragDrop";

const Solitaire = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [difficulty, setDifficulty] = useState<string|null>(null);
    const [activeCards, setActiveCards] = useState<ICard[]>([]);

    const [state, dispatch] = useReducer(historyReducer(gameReducer), {past: [], present: initialGameState, future: []});

    const { foundation, tableau, stock, score } = state.present;

    const handleDragStart = (e: any) => {
        const [source, colIndex, cardIndex] = e.active.id.split("-");
        let activeCardsArray: ICard[] = [];
        switch (source) { //get source of card
            case Sources.stock:
                activeCardsArray = [stock[+cardIndex]];
                break;
            case Sources.foundation:
                activeCardsArray = [foundation[+colIndex][+cardIndex]];
                break;
            case Sources.tableau:
                activeCardsArray = tableau[+colIndex].slice(+cardIndex);
                break;
            default:
                break;
        }

        setActiveCards(activeCardsArray || null);
    };

    const handleDragEnd = (e: any) => {
        setActiveCards([]);
        if (e.over) handleDrop(e.active.id, e.over.id);
    };

    const handleDrop = (cardId: string, lastCardId: string) => {
        const [lastCardSource, lastCardColIndex, lastCardIndex] = lastCardId.split("-");
        const [source, colIndex, cardIndex] = cardId.split("-");

        dispatch({
            type: gameActions.move,
            payload: {
                source,
                colIndex,
                cardIndex,
                lastCardSource,
                lastCardColIndex,
                lastCardIndex
            }
        })
    };

    const showStock = (showNo: number = 1) => {
        dispatch({
            type: gameActions.show,
            payload: {
                showNo
            }
        })
    }

    const historyButton = (action: string) => {
        switch (action) {
            case historyActions.undo:
                dispatch({
                    type: historyActions.undo
                });
                break;
            case historyActions.redo:
                dispatch({
                    type: historyActions.redo
                });
                break;
            case historyActions.reset:
                setDifficulty(null);
                setIsFinished(false);
                dispatch({
                    type: historyActions.reset
                });
                break;
            default:
                break;

        }
    } 

    useEffect(() => {
        if (isInitialized || !difficulty) return; // prevent double init
        dispatch({
            type: gameActions.initialize
        });
        setIsInitialized(() => true)
      return () => {}
    }, [difficulty])
    
    useEffect(() => {
        // win
        if ((foundation.every((pile: ICard[]) => pile.length === 13)) ||
            (stock.length && stock.every((card: ICard) => card.isOpen) && tableau.every((pile: ICard[]) => pile.every((card: any) => card.isOpen)))) {
            setIsFinished(true);
        }
    }, [foundation, tableau, stock])

    return (
        <>
            {
                !difficulty &&
                <div className="absolute h-screen w-screen top-0 overflow-hidden" style={{'zIndex': 999}}>
                    <div className="bg-black/70 flex flex-col items-center justify-center h-full w-full">
                        <div className="flex flex-col bg-gradient-to-br from-green-800 via-green-900 to-green-900 p-fluid-20 gap-fluid-16 overflow-auto relative rounded-2xl">
                            <p className="text-white text-fluid-16 font-bold">Choose level of difficulty</p>
                            <button
                                onClick={() => setDifficulty(Difficulties.easy)}
                                type="button"
                                className="px-fluid-16 py-fluid-8 rounded-xl cursor-pointer bg-green-600 text-white text-fluid-16 font-semibold hover:bg-green-500 active:bg-green-700 transition-all shadow-md">
                                Easy
                            </button>
                            <button
                                onClick={() => setDifficulty(Difficulties.hard)}
                                type="button"
                                className="px-fluid-16 py-fluid-8 rounded-xl cursor-pointer bg-red-600 text-white text-fluid-16 font-semibold hover:bg-red-500 active:bg-red-700 transition-all shadow-md">
                                Hard
                            </button>
                        </div>
                    </div>
                </div>
            }
            <DndContext
                onDragStart={(e) => handleDragStart(e)}
                onDragEnd={(e) => handleDragEnd(e)}>
                <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-green-800 via-green-900 to-black p-fluid-20 gap-fluid-16 overflow-auto relative *:touch-none *:select-none">
                    <div className="flex justify-between items-center">
                        <p className="text-white text-fluid-16 font-bold">Score: {score}</p>
                        <div className="flex *:text-fluid-30 *:cursor-pointer *:hover:grayscale-0 *:grayscale-100 *:hue-rotate-190 gap-fluid-12">
                            <div onClick={() => historyButton(historyActions.undo)}>⏪</div>
                            <div onClick={() => historyButton(historyActions.redo)}>⏩</div>
                            <div onClick={() => historyButton(historyActions.reset)}>🔄️</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 w-full gap-[2%]">
                        {/* Stock */}
                        <div className="flex flex-row gap-[2%]">
                            <div onClick={() => showStock(difficulty === Difficulties.easy ? 1 : 3)}>
                                <SolitaireCard isOpen={false} className={`pointer-events-none select-none ${(stock.length && stock[stock.length-1].isOpen) || !stock.length ? 'opacity-75 grayscale-100' : ''}`}></SolitaireCard>
                            </div>
                            <div className="flex flex-row relative flex-1 h-full w-full">
                                {
                                    (stock && stock.filter((s: ICard)=>s.isOpen).length > 0) && stock.filter((s: ICard)=>s.isOpen).slice(-3).map((card: ICard, index: number) => (
                                        <Draggable id={`stock-0-${stock.findIndex((card1: ICard) => card1 == card)}`}
                                            key={`stock-0-${stock.findIndex((card1: ICard) => card1 == card)}`}
                                            className='absolute h-full not-last:pointer-events-none not-last:select-none'
                                            style={{'zIndex': index, 'left': index*20}}>
                                            <SolitaireCard card={card} className={`h-full ${activeCards.includes(card) && 'opacity-0'}`}></SolitaireCard>
                                        </Draggable>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Foundation */}
                        <div className="grid grid-cols-4 gap-[2%] min-w-1/2 justify-items-end h-full">
                            {suits.map((suit, suitIndex: number) => (
                                <div key={`foundation-${suitIndex}`} className="relative w-full">
                                    {!(foundation[suitIndex] && foundation[suitIndex].length > 0) ? 
                                        cards.filter((c) => c.value === "A" && c.suit === suit).map((ace) => (
                                            <Droppable id={`foundation-${suitIndex}-empty`}
                                                key={`foundation-${suitIndex}-empty`} className="absolute right-0">
                                                <SolitaireCard card={ace} className="opacity-50 grayscale-50 pointer-events-none select-none" />
                                            </Droppable>
                                        ))
                                    :
                                    <CardDragDrop id={`foundation-${suitIndex}-${foundation[suitIndex].length-1}`}
                                        key={`foundation-${suitIndex}-${foundation[suitIndex].length-1}`}
                                        className={`absolute right-0 ${activeCards.includes(foundation[suitIndex][foundation[suitIndex].length - 1]) && 'opacity-50'}`}
                                    >
                                        <SolitaireCard
                                            card={
                                                activeCards.includes(foundation[suitIndex][foundation[suitIndex].length - 1]) ?
                                                    foundation[suitIndex].length > 1 ?
                                                        foundation[suitIndex][foundation[suitIndex].length - 2] :
                                                        foundation[suitIndex][foundation[suitIndex].length - 1]
                                                : foundation[suitIndex][foundation[suitIndex].length - 1]
                                                }/>
                                    </CardDragDrop>}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Tableau */}
                    <div className="flex-1 grid grid-cols-7 overflow-auto gap-fluid-4">
                        {tableau.length && tableau.map((col: ICard[], colIndex: number) => (
                            <div className="relative flex justify-center group/tableau" key={`col-${colIndex}`}>
                                {col.length ? (
                                    col.map((card: any, cardIndex: number) => (
                                        card && card.isOpen ? (
                                            <CardDragDrop id={`tableau-${colIndex}-${cardIndex}`}
                                                key={`tableau-${colIndex}-${cardIndex}`}
                                                className={`absolute ${activeCards.includes(card) && 'opacity-0'}`}
                                                style={{
                                                    top: `${cardIndex * 5}%`,
                                                    zIndex: cardIndex,
                                                }}
                                                isDropDisabled={!(cardIndex+1 === col.length)}
                                            >
                                                <SolitaireCard
                                                    card={card}/>
                                            </CardDragDrop>
                                        ) : (
                                            <div id={`tableau-${colIndex}-${cardIndex}`}
                                                key={`tableau-${colIndex}-${cardIndex}`}
                                                className={`absolute pointer-events-none select-none`}
                                                style={{
                                                    top: `${cardIndex * 5}%`,
                                                    zIndex: cardIndex,
                                                }}
                                            >
                                                <SolitaireCard
                                                    isOpen={false}/>
                                            </div>
                                        )
                                    ))
                                ) : (
                                    <Droppable id={`tableau-${colIndex}-empty`}
                                        key={`tableau-${colIndex}-empty`}
                                        className="h-full w-full"
                                    >
                                    </Droppable>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                <DragOverlay style={{'pointerEvents': 'none'}}>
                    <div className="relative pointer-events-none overflow-visible">
                    {
                        activeCards.length > 0 && 
                            activeCards.map((card: ICard, index: number) => (
                                <SolitaireCard
                                    key={`dragoverlay-${index}`}
                                    className={`${index > 0 ? 'absolute' : ''}`}
                                    style={{
                                        top: `${index * 20}%`,
                                        zIndex: index,
                                    }}
                                    card={card}/>
                                ))
                    }
                    </div>
                </DragOverlay>
            </DndContext>
            {
                isFinished &&
                <div onClick={() => historyButton(historyActions.reset)} className="absolute h-screen w-screen top-0 overflow-hidden" style={{'zIndex': 999}}>
                    <div className="bg-black/70 flex flex-col items-center justify-center h-full w-full">
                        <p className="text-white font-bold text-fluid-24">{
                            score <= 10 ?
                            lowScoreMessages[Math.floor(Math.random() * lowScoreMessages.length)]
                            : `Congrats! Your score is ${score}! 🎉`
                        }</p>
                        <img className="h-3/4 select-none pointer-events-none" src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2M4ZTd1M3k4OXJ6bXFlZDNrenoxd2JkcTRyY3g5aXh6N29uczU0MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yoJC2GnSClbPOkV0eA/giphy.gif"></img>
                    </div>
                </div>
            }
        </>
    );
};

export default Solitaire;