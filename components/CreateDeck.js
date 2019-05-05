import * as React from 'react';
import { Text, View, StyleSheet, TextInput, KeyboardAvoidingView } from 'react-native';
import TextButton from './TextButton'
import { addDeck } from '../actions/index'
import { connect } from 'react-redux'

class CreateDeck extends React.Component {

  state = {
    text: '',
  }

  handleChange = (text) => {
    this.setState(() => ({
      text
    }))

  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { dispatch, navigation } = this.props
    const { text } = this.state
    const deck = {
      id: Math.floor(Math.random() * 1000000),
      name: text,
      cards: []
    }

    dispatch(addDeck(deck))
    this.setState(() => ({
      text: ''
    }))
    navigation.navigate('DeckTop', { id: deck.id })

  }

  render() {
    const { text } = this.state
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View>
          <Text style={styles.text}>What is the title of your new deck?</Text>
          <TextInput
            value={text}
            style={{ height: 60 }}
            placeholder="Enter Title"
            onChangeText={this.handleChange}
          />

        </View>
        <TextButton style={{ padding: 5, margin: 5 }} onPress={this.handleSubmit}>
          Create Deck
        </TextButton>
      </KeyboardAvoidingView>
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
  text: {
    fontSize: 24,
    textAlign: 'center',
  }
});



export default connect()(CreateDeck)
