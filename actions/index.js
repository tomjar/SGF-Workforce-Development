import { showLoading, hideLoading } from 'react-redux-loading'
import { getInitialData } from '../utils/api'

export const RECEIVE_DECKS = 'RECEIVE_DECKS'
export const ADD_DECK = 'ADD_DECK'
export const ADD_CARD = 'ADD_CARD'
export const DELETE_DECK = 'DELETE_DECK'

export function receiveDecks(decks) {
  return {
    type: RECEIVE_DECKS,
    decks,
  }
}

export function addDeck(deck) {
  return {
    type: ADD_DECK,
    deck,
  }
}

export function deleteDeck(deckId) {
  return {
    type: DELETE_DECK,
    deckId,
  }
}

export function addCard(deckId, card) {
  return {
    type: ADD_CARD,
    deckId,
    card
  }
}

export function handleInitialData() {
  return (dispatch) => {
    dispatch(showLoading())
    return getInitialData()
      .then(({ decks }) => {
        dispatch(receiveDecks(decks));
        dispatch(hideLoading())
      })
  }
}