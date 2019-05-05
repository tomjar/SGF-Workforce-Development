import { RECEIVE_DECKS, ADD_DECK, ADD_CARD, DELETE_DECK } from '../actions'

function decks(state = {}, action) {
  switch (action.type) {
    case RECEIVE_DECKS:
      return {
        ...state,
        ...action.decks,
      }
    case DELETE_DECK: {
      const currentDecks = state.decks
      const updatedDecks = currentDecks.filter((deck) => {
        return (deck.id !== action.deckId)
      })
      return {
        ...state,
        "decks": updatedDecks
      }
    }

    case ADD_DECK: {
      const decks = state.decks ? state.decks : []
      return {
        ...state,
        "decks": decks.concat(action.deck)
      }
    }

    case ADD_CARD: {
      const newDecks = state.decks.map((deck) => {
        const cards = deck.cards
        return (deck.id === action.deckId) ?
          {
            ...deck,
            "cards": cards.concat(action.card)
          } :
          deck
      })
      return {
        ...state,
        "decks": newDecks

      }
    }
    default:
      return state
  }
}

export default decks