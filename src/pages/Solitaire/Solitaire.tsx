import React, { useEffect, useState } from "react";
import { ranks, solitaireCards, Sources, suits, type ICard } from "../../data/solitaire";
import SolitaireCard from "./Solitaire-card";

const Solitaire = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [foundation, setFoundation] = useState<Array<Array<ICard>>>([
        [],[],[],[]
    ]);
    const [tableau, setTableau] = useState<Array<Array<ICard>>>([
        [],[],[],[],[],[],[]
    ]);
    const [stock, setStock] = useState<Array<ICard>>([]);
    const [lastStockIndex, setLastStockIndex] = useState<number|null>(null);

    const cards = solitaireCards.flatMap((g) =>
        g.cards.map((c) => ({ suit: g.suit, value: c.value, img: c.img, isOpen: false }))
    );

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

        if (!droppedCard) return;
        if (!droppedCard.isOpen) return;
        
        switch (lastCardSource) { //get destination of card
            case Sources.foundation:
                lastCard = foundation[+lastCardColIndex][+lastCardIndex] ?? null;
                
                if (suits[+lastCardColIndex] !== droppedCard.suit) return;
                if (lastCard && (ranks.indexOf(droppedCard.value) - ranks.indexOf(lastCard.value) !== 1)) return;

                setFoundation((prev: any) => {
                    const newFoundation = [...prev];
                    newFoundation[+lastCardColIndex] = [...prev[+lastCardColIndex], droppedCard];

                    return newFoundation;
                });
                removeDroppedCard(source, {colIndex, cardIndex});

                break;

            case Sources.tableau:
                if (source === Sources.tableau && colIndex == lastCardColIndex) return;
                lastCard = tableau[+lastCardColIndex][+lastCardIndex] ?? null;

                if (lastCardIndex === 'empty') {
                    if (droppedCard.value !== "K") return;
                } else {
                    const isBlack = (suit: string) => (suit === 'clubs' || suit === 'spades');
                    if (isBlack(droppedCard.suit) == isBlack(lastCard.suit)) return;
                    if (lastCard && (ranks.indexOf(lastCard.value) - ranks.indexOf(droppedCard.value) !== 1)) return;
                }

                let droppedCards = [droppedCard];
                if (source === Sources.tableau) {
                    droppedCards = tableau[+colIndex].slice(+cardIndex);
                }

                setTableau((prev: any) => {
                    const newTableau = [...prev];
                    newTableau[+lastCardColIndex] = [...newTableau[+lastCardColIndex], ...droppedCards];
                    return newTableau;
                });

                removeDroppedCard(source, {colIndex, cardIndex});
                break;

            default:
                break;
        }
    };

    const removeDroppedCard = (source: string, cardPosition: {colIndex: string|number, cardIndex: string|number}) => {
        switch (source) {
            case Sources.stock:
                setLastStockIndex(() => +cardPosition.cardIndex);
                setStock((prevStock: any) => {
                    const newStock = [...prevStock];
                    newStock.splice(+cardPosition.cardIndex, 1);
                    return newStock;
                })
                break;
            case Sources.foundation:
                setFoundation((prevFoundation: any) => {
                    const newFoundation = [...prevFoundation]
                    newFoundation[+cardPosition.colIndex].splice(cardPosition.cardIndex, 1);
                    return newFoundation;
                })
                break;
            case Sources.tableau:
                setTableau((prevTableau: any) => {
                    const newTableau = [...prevTableau];
                    newTableau[+cardPosition.colIndex].splice(cardPosition.cardIndex);
                    if (+cardPosition.cardIndex - 1 >= 0) {
                        newTableau[+cardPosition.colIndex][+cardPosition.cardIndex-1].isOpen = true;
                    }
                    return newTableau;
                })
                break;
        }
    }

    const showStock = (showNo: number = 1) => {
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
        setStock((prevStock) => {
            const newStock = [...prevStock]
            newStock.map((card, index) => (index < currentIndex + showNo && !isReset) ? card.isOpen = true : card.isOpen = false);

            if (!newStock.filter(card => card.isOpen).length) {
                setLastStockIndex(() => null);
            }

            return newStock;
        });
    }

    useEffect(() => {
        let shuffledCards = [...cards].sort(() => Math.random() - 0.5);

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

        setStock(() => {
            return shuffledCards;
        })

        setTableau(() => {
            return tableauArray;
        })

        setIsInitialized(() => true)
    
      return () => {}
    }, [isInitialized])
    
    useEffect(() => {
        // win
        if (foundation.every(pile => pile.length === 13)) {
            console.log("foundation winner")
        }

        if (stock.length && stock.every(card => card.isOpen) && tableau.every(pile => pile.every((card: any) => card.isOpen))) {
            console.log("stock winner")
        }
    }, [foundation, tableau, stock])

    return (
        <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-green-800 via-green-900 to-black p-5 gap-4 overflow-auto">
            <div className="flex justify-between items-center">
                <p className="text-white font-bold">Score: 0</p>
                <div className="flex *:text-3xl *:cursor-pointer *:hover:grayscale-0 *:grayscale-100 *:hue-rotate-190 gap-3">
                    <div>⏪</div>
                    <div>⏩</div>
                    <div>🔄️</div>
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
                            stock && stock.filter((s)=>s.isOpen).length ? stock.filter((s)=>s.isOpen).slice(-3).map((card, index) => (
                                <div id={`stock-0-${stock.findIndex(card1 => card1 == card)}`}
                                    key={`stock-0-${stock.findIndex(card1 => card1 == card)}`}
                                    className='absolute h-full not-last:pointer-events-none not-last:select-none'
                                    style={{'zIndex': index, 'left': index*20}}
                                    draggable="true" onDragStart={(e) => handleDragStart(e)}>
                                    <SolitaireCard card={card} className="h-full active:opacity-50"></SolitaireCard>
                                </div>
                            )) : <></>
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
                {tableau.length && tableau.map((col, colIndex) => (
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
    );
};

export default Solitaire;