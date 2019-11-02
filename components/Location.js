import * as React from 'react';
import { Text, View, StyleSheet, KeyboardAvoidingView, TextInput } from 'react-native';
import TextButton from './TextButton'
import { red } from '../utils/colors.js'
import { connect } from 'react-redux'
import { black, white } from '../utils/colors'
import { handleInitialData } from '../actions/index'

class DeckList extends React.Component {

  render() {
    text=''
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
  
        <Text style={styles.text}>Set Location For Job Search</Text>
        <TextButton onPress={this.handleSubmit}>
          Use My Current Location
        </TextButton>
        <View style={styles.separator}>
        </View>
        <View>
          <TextInput
            value={text}
            style={{ height: 60 }}
            placeholder="Street Address"
            onChangeText={this.handleChange}
          />
          <TextInput
            value={text}
            style={{ height: 60 }}
            placeholder="Line 2"
            onChangeText={this.handleChange}
          />
          <TextInput
            value={text}
            style={{ height: 60 }}
            placeholder="City"
            onChangeText={this.handleChange}
          />
          <TextInput
            value={text}
            style={{ height: 60 }}
            placeholder="State"
            onChangeText={this.handleChange}
          />
          <TextInput
            value={text}
            style={{ height: 60 }}
            placeholder="Zip"
            onChangeText={this.handleChange}
          />
          <TextButton onPress={this.handleSubmit}>
            Use This Address
          </TextButton>
        </View>
   

    </KeyboardAvoidingView>
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
  separator: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    padding: 5
  }
})


function mapStateToProps({ decks }) {
  return {
    decks
  }
}

export default connect(mapStateToProps)(DeckList)