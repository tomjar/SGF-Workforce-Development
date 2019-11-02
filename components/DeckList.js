import * as React from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import TextButton from './TextButton'
import { red } from '../utils/colors.js'
import { connect } from 'react-redux'
import { black, white } from '../utils/colors'
import { handleInitialData } from '../actions/index'

class DeckList extends React.Component {

  showDeck = (id, e) => {
    this.props.navigation.navigate(
      'DeckTop', { id: id })
  }

  componentDidMount() {
    this.props.dispatch(handleInitialData())
  }

  render() {
    const { decks } = this.props
    if (!decks) {
      return (
        <View style={styles.container} >
          <Text style={styles.name}>You have no decks yet!</Text>
        </View>
      )
    }
    return (
      <View style={styles.container} >
        <FlatList
          data={decks}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            <View style={styles.flatview}>
              <TextButton style={styles.deckTop}
                onPress={this.showDeck.bind(this, item.id)}>{item.name}
              </TextButton>
              <Text style={styles.card}>
                {item.cards.length} card{(item.cards.length !== 1) ? "s" : ""}
              </Text>
            </View>
          }
          keyExtractor={item => item.id}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  flatview: {
    justifyContent: 'center',
    paddingTop: 30,
    borderRadius: 2,
  },
  name: {
    fontSize: 28,
    textAlign: 'center',
  },
  card: {
    color: red,
    textAlign: 'center',
  },
  deckTop: {
    padding: 5,
    margin: 5,
    backgroundColor: white,
    color: black,
    fontSize: 28
  }
})


function mapStateToProps({ decks }) {
  return {
    decks
  }
}

export default connect(mapStateToProps)(DeckList)