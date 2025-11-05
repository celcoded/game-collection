import back from '../../assets/Playing Cards/back.svg'

const SolitaireCard = ({card, isOpen = true, className}: any) => {
    return (
        <img src={isOpen ? `./${card.img}` : `.${back}` } alt={isOpen ? `${card.value} of ${card.suit}` : 'Back of Card'} width={"100px"} className={className} />
    )
}

export default SolitaireCard;