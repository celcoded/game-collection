import React, { useEffect, useReducer, useState } from "react";
import { cards, gameActions, historyActions, suits, type ICard } from "../../data/solitaire";
import SolitaireCard from "./Solitaire-card";
import { gameReducer, historyReducer, initialGameState } from "./Solitaire.reducer";

const Solitaire = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const [state, dispatch] = useReducer(historyReducer(gameReducer), {past: [], present: initialGameState, future: []});

    const { foundation, tableau, stock, score } = state.present;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", e.currentTarget.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const lastCardId = e.currentTarget.id;
        const [lastCardSource, lastCardColIndex, lastCardIndex] = lastCardId.split("-");
        const cardId = e.dataTransfer.getData("text/plain");
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
        if (isInitialized) return; // prevent double init
        dispatch({
            type: gameActions.initialize
        });
        setIsInitialized(() => true)
    
      return () => {}
    }, [isInitialized])
    
    useEffect(() => {
        // win
        if ((foundation.every((pile: ICard[]) => pile.length === 13)) ||
            (stock.length && stock.every((card: ICard) => card.isOpen) && tableau.every((pile: ICard[]) => pile.every((card: any) => card.isOpen)))) {
            setIsFinished(true);
        }
    }, [foundation, tableau, stock])

    return (
        <>
            <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-green-800 via-green-900 to-black p-5 gap-4 overflow-auto relative">
                <div className="flex justify-between items-center">
                    <p className="text-white font-bold">Score: {score}</p>
                    <div className="flex *:text-3xl *:cursor-pointer *:hover:grayscale-0 *:grayscale-100 *:hue-rotate-190 gap-3">
                        <div onClick={() => historyButton(historyActions.undo)}>⏪</div>
                        <div onClick={() => historyButton(historyActions.redo)}>⏩</div>
                        <div onClick={() => historyButton(historyActions.reset)}>🔄️</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 w-full gap-[2%]">
                    {/* Stock */}
                    <div className="flex flex-row gap-[2%]">
                        <div className="" onClick={() => showStock(3)}>
                            <SolitaireCard isOpen={false} className={(stock.length && stock[stock.length-1].isOpen) || !stock.length ? 'opacity-75 grayscale-100 pointer-events-none select-none' : ''}></SolitaireCard>
                        </div>
                        <div className="flex flex-row relative flex-1 h-full w-full">
                            {
                                (stock && stock.filter((s: ICard)=>s.isOpen).length > 0) && stock.filter((s: ICard)=>s.isOpen).slice(-3).map((card: ICard, index: number) => (
                                    <div id={`stock-0-${stock.findIndex((card1: ICard) => card1 == card)}`}
                                        key={`stock-0-${stock.findIndex((card1: ICard) => card1 == card)}`}
                                        className='absolute h-full not-last:pointer-events-none not-last:select-none'
                                        style={{'zIndex': index, 'left': index*20}}
                                        draggable="true" onDragStart={(e) => handleDragStart(e)}>
                                        <SolitaireCard card={card} className="h-full active:opacity-50"></SolitaireCard>
                                    </div>
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
                                        <div id={`foundation-${suitIndex}-empty`}
                                            key={`foundation-${suitIndex}-empty`} className="absolute right-0"
                                            onDragOver={handleDragOver} onDrop={(e) => handleDrop(e)}
                                        >
                                            <SolitaireCard card={ace} className="opacity-50 grayscale-50 pointer-events-none select-none" />
                                        </div>
                                    ))
                                :
                                /* get last card from foundation */
                                <div id={`foundation-${suitIndex}-${foundation[suitIndex].length-1}`}
                                    key={`foundation-${suitIndex}-${foundation[suitIndex].length-1}`}
                                    draggable="true" onDragStart={(e) => handleDragStart(e)}
                                    onDragOver={handleDragOver} onDrop={(e) => handleDrop(e)}
                                    className="absolute right-0 active:opacity-50"
                                >
                                    <SolitaireCard
                                        card={foundation[suitIndex][foundation[suitIndex].length - 1]}/>
                                </div>}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Tableau */}
                <div className="flex-1 grid grid-cols-7 overflow-auto">
                    {tableau.length && tableau.map((col: ICard[], colIndex: number) => (
                        <div className="relative flex justify-center group/tableau" key={`col-${colIndex}`}>
                            {col.length ? (
                                col.map((card: any, cardIndex: number) => (
                                    card.isOpen ? (
                                        <div id={`tableau-${colIndex}-${cardIndex}`}
                                            key={`tableau-${colIndex}-${cardIndex}`}
                                            draggable="true" onDragStart={(e) => handleDragStart(e)}
                                            onDragOver={handleDragOver} onDrop={(e) => handleDrop(e)}
                                            className={`absolute group-active/tableau:opacity-50`}
                                            style={{'zIndex': cardIndex, 'top': cardIndex*35}}
                                        >
                                            <SolitaireCard
                                                card={card}/>
                                        </div>
                                    ) : (
                                        <div id={`tableau-${colIndex}-${cardIndex}`}
                                            key={`tableau-${colIndex}-${cardIndex}`}
                                            className={`absolute pointer-events-none select-none`}
                                            style={{'zIndex': cardIndex, 'top': cardIndex*35}}
                                        >
                                            <SolitaireCard
                                                isOpen={false}/>
                                        </div>
                                    )
                                ))
                            ) : (
                                <div id={`tableau-${colIndex}-empty`}
                                    key={`tableau-${colIndex}-empty`}
                                    className="h-full w-full"
                                    onDragOver={handleDragOver} onDrop={(e) => handleDrop(e)}
                                >
                                </div>
                            )
                            }
                        </div>
                    ))}
                </div>
            </div>
            {
                isFinished &&
                <div onClick={() => historyButton(historyActions.reset)} className="absolute h-screen w-screen top-0 overflow-hidden" style={{'zIndex': 999}}>
                    <div className="bg-black/70 flex flex-col items-center justify-center h-full w-full">
                        <p className="text-white font-bold text-2xl">Congrats! Your score is {score}! 🎉</p>
                        <img className="h-3/4 select-none pointer-events-none" src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2M4ZTd1M3k4OXJ6bXFlZDNrenoxd2JkcTRyY3g5aXh6N29uczU0MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/yoJC2GnSClbPOkV0eA/giphy.gif"></img>
                    </div>
                </div>
            }
        </>
    );
};

export default Solitaire;