import back from '../../assets/Playing Cards/back.svg'

const SolitaireCard = ({card, isOpen = true, className, style = {}}: any) => {
    return (
        <img src={isOpen ? `./${card.img}` : `.${back}` } alt={isOpen ? `${card.value} of ${card.suit}` : 'Back of Card'} className={'w-fluid-100 ' + className} style={style} />
    )
}

export default SolitaireCard;