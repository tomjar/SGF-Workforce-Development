import * as React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import { TextInput, KeyboardAvoidingView } from 'react-native';
import TextButton from './TextButton'
import { connect } from 'react-redux'
import IconButton from "react-native-vector-icons/MaterialIcons";
import { setLocalNotification, clearLocalNotification } from '../utils/helpers'

class ShowCard extends React.Component {
  state = {
    cardNo: 0,
    showAnswer: false,
    correctNo: 0,
    totalAsked: 0,
    showResults: false
  }

  showAnswer = () => {
    this.setState(() => ({
      showAnswer: true
    }))
  }

  gotItRight = () => {
    const { cardNo } = this.state
    const { deck } = this.props
    const nextCard = cardNo + 1
    const showResults = nextCard === deck.cards.length
    this.setState((currentState) => ({
      cardNo: showResults ? 0 : nextCard,
      correctNo: currentState.correctNo + 1,
      totalAsked: currentState.totalAsked + 1,
      showResults: showResults
    }))
  }

  gotItWrong = () => {
    const { cardNo } = this.state
    const { deck } = this.props
    const nextCard = cardNo + 1
    const showResults = nextCard === deck.cards.length
    this.setState((currentState) => ({
      cardNo: showResults ? 0 : nextCard,
      totalAsked: currentState.totalAsked + 1,
      showResults: showResults
    }))
  }

  redoQuiz = () => {
    this.setState(() => ({
      cardNo: 0,
      showAnswer: false,
      correctNo: 0,
      totalAsked: 0,
      showResults: false
    }))
  }

  nextQuestion = () => {
    const { deck } = this.props
    const { cardNo } = this.state
    const nextCard = cardNo + 1
    const showResults = nextCard === deck.cards.length
    this.setState(() => ({
      cardNo: showResults ? 0 : nextCard,
      showAnswer: false,
      showResults: showResults
    }))
  }

  returnToDeck = () => {
    const { id } = this.props
    this.props.navigation.navigate(
      'DeckTop', { id: id })
  }

  showResults = () => {
    const { correctNo, totalAsked } = this.state
    clearLocalNotification()
      .then(setLocalNotification())
    return (
      <View>
        <Text> You got {correctNo} correct out of {totalAsked}!</Text>
      </View>
    )
  }

  askQuestions = () => {
    const { deck } = this.props
    const { cardNo, showAnswer } = this.state
    return (
      <View>
        <TextInput
          value={deck.cards[cardNo].question}
          style={{ height: 60 }}
          disabled='true'
          onChangeText={this.addQuestionText}
        />
        <TextInput
          value={showAnswer ? deck.cards[cardNo].answer : ''}
          style={{ height: 60 }}
          disabled='true'
          onChangeText={this.addAnswerText}
        />
        <Text>
          You have {deck.cards.length - cardNo} card{(deck.cards.length !== 1) ? "s" : ""} remaining
          </Text>
      </View>
    )
  }

  showResultButtons = () => {
    return (
      <View>
        <TextButton style={{ padding: 5, margin: 5 }} onPress={this.redoQuiz}>
          Redo Quiz
          </TextButton>
        <TextButton style={{ padding: 5, margin: 5 }} onPress={this.returnToDeck}>
          Return to Deck
          </TextButton>
      </View>
    )
  }

  answerButtons = () => {
    return (
      <View>
        <TextButton style={{ padding: 5, margin: 5 }} onPress={this.nextQuestion}>
          Next Question
        </TextButton>
        <TextButton style={{ padding: 5, margin: 5 }} onPress={this.showAnswer}>
          Show Answer
        </TextButton>
      </View>
    )
  }

  gradeButtons = () => {
    return (
      <View style={styles.bottomContainer}>
        <IconButton
          name="done"
          backgroundColor="green"
          size="40"
          onPress={this.gotItRight}
        />
        <IconButton
          name="clear"
          backgroundColor="red"
          size="40"
          onPress={this.gotItWrong}
        />
      </View>
    )
  }


  render() {
    const { deck } = this.props
    const { cardNo, showAnswer, showResults, correctNo, totalAsked } = this.state

    if (!deck || !deck.cards || deck.cards.length === 0) {
      return (
        <View style={styles.sorry}>
          <Text style={styles.sorryText}>
            Sorry, you cannot take a quiz because there are no cards in the deck.
          </Text>
        </View>
      )
    }

    return (
      <KeyboardAvoidingView style={styles.container}>
        {!showResults && this.askQuestions()}
        {showResults && this.showResults()}
        {showResults && this.showResultButtons()}
        {!showAnswer && !showResults && this.answerButtons()}
        {showAnswer && !showResults && this.gradeButtons()}
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
  bottomContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sorry: {
    flex: 1,
    justifyContent: 'center'
  },
  sorryText: {
    textAlign: 'center',
    fontSize: 24
  }
});

function mapStateToProps({ decks }, { navigation }) {
  const id = navigation.getParam('deckId')
  const deck = decks && decks.find((deck) => { return deck.id === id })
  return {
    deck: deck ? deck : null,
    id
  }
}


export default connect(mapStateToProps)(ShowCard)