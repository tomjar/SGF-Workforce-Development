import React, { Component } from 'react'
import { Text, View, StyleSheet, TextInput, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

const styles = StyleSheet.create({
    map: {
        height: 200,
        marginTop: 30
    }
})

class GoogleMap extends Component {
    render() {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Hello, world!</Text>
                <MapView
                    style={styles.map}
                    showsUserLocation={false}
                    followUserLocation={false}
                    zoomEnabled={true}
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                      }}

                />
                <Text>Hello, world!</Text>
            </View>

        );
    }
}

export default connect()(GoogleMap)