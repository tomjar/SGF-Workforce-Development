import * as React from 'react';
import { View, StyleSheet, Image, TextInput, KeyboardAvoidingView } from 'react-native';
import TextButton from './TextButton'
import { connect } from 'react-redux'
import { addCard } from '../actions/index'

class AddCard extends React.Component {
  state = {
    question: '',
    answer: '',
    disabled: true
  }
  A
  addQuestionText = (text) => {
    this.setState(() => ({
      question: text,
      disabled: (text.length === 0 && this.state.answer.length === 0)
    }))
  }

  addAnswerText = (text) => {
    this.setState(() => ({
      answer: text,
      disabled: (text.length === 0 && this.state.answer.length === 0)
    }))
  }

  reset = () => {
    this.setState(() => ({
      answer: '',
      question: '',
      disabled: true
    }))
  }

  handleSubmit = (e) => {
    e.preventDefault()

    const { dispatch, navigation } = this.props
    const { question, answer } = this.state
    const deckId = navigation.getParam('deckId')
    const card = {
      id: Math.floor(Math.random() * 1000000),
      question,
      answer
    }


    dispatch(addCard(deckId, card))
    this.reset()
  }


  render() {
    const { question, answer, disabled, cardNo } = this.state
    return (
      <KeyboardAvoidingView style={styles.container}>
        <View>
          <TextInput
            value={question}
            style={{ height: 60 }}
            placeholder="Type your question here"
            onChangeText={this.addQuestionText}
          />
          <TextInput
            value={answer}
            style={{ height: 60 }}
            placeholder="Type your answer here"
            onChangeText={this.addAnswerText}
          />
        </View>
        <TextButton style={{ padding: 5, margin: 5 }} onPress={this.handleSubmit} disabled={disabled}>
          Add Question
        </TextButton>
        <TextButton style={{ padding: 5, margin: 5 }} onPress={this.reset}>
          Reset
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
  }
});

export default connect()(AddCard)