import * as React from 'react';
import {  View, StyleSheet, Text } from 'react-native';
import TextButton from './TextButton'
import Deck from './Deck.js'
import { connect } from 'react-redux'

class Jobs extends React.Component {
  render() {
    const { deck, id } = this.props
    return (
      <View style={styles.container}>
        <Text>Jobs View</Text>
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
  return {  }
}

export default connect(mapStateToProps)(Jobs)