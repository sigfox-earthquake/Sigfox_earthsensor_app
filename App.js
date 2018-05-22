import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView from 'react-native-maps'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export default class App extends React.Component {
  render() {
    return (
      <MapView
      style={{ flex: 1 }}
      zoomEnabled={true}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
    width,
    height,
  }
});
