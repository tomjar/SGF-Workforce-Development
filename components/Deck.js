import React from 'react'
import { Text, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux'

class Deck extends React.Component {

  render() {
    const { deck } = this.props
    const plural = (deck.cards.length !== 1) ? "s" : ""
    return (
      <View>
        <Text style={styles.deckName}>{deck.name}</Text>
        <Text style={styles.cardNo}>{deck.cards.length} card{plural}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  deckName: {
    fontSize: 28,
    textAlign: 'center'
  },
  cardNo: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default connect()(Deck)