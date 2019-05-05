import * as React from 'react';
import {  View, StyleSheet } from 'react-native';
import TextButton from './TextButton'
import Deck from './Deck.js'
import { connect } from 'react-redux'

class DeckTop extends React.Component {
  render() {
    console.log("In DeckTop!")
    const { deck, id } = this.props
    if (null === deck) {
      return (<View></View>)
    }

    return (
      <View style={styles.container}>
        <View style={styles.topView}>
          <Deck deck={deck} />
        </View>
        <View style={styles.bottomView}>
          <TextButton style={styles.addCard} disable="false" onPress={() => this.props.navigation.navigate(
            'AddCard', { deckId: deck.id }
          )}>
            Add Card
        </TextButton>
          <TextButton
            style={styles.addCard}
            onPress={() => this.props.navigation.navigate(
              'ShowCards', { deckId: deck.id })}
          >
            Take Quiz
        </TextButton>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    padding: 24
  },
  bottomView: {
    flex: 4,
    justifyContent: 'flex-end'
  },
  topView: {
    flex: 6,
    justifyContent: 'flex-start'
  },
  addCard: {
    padding: 5,
    margin: 5,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  }
});

function mapStateToProps({ decks }, { navigation }) {
  console.log("decks are : " + JSON.stringify(decks))

  const id = navigation.getParam('id')
  console.log("id is " + id)
  const deck = decks && decks.find((deck) => { return deck.id === id })
  return {
    deck: deck ? deck : null
  }
}

export default connect(mapStateToProps)(DeckTop)