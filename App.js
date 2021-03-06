import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import * as firebase from 'firebase';
import markerMe from "./img/marker_mypos.png";
import { MarkerMaker } from "./components/marker"
import { findEpicenter } from "./findEpicenter"

var times = 0;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state= {
      database: null,
      markerList: [],
      epicenter: [],
      epicPos: {
        latitude: 0,
        longitude: 0,
      },
      currPos: {
        latitude: 19.203316,
        longitude: -101.265469,
      }
    }
    this.initMarkers =  this.initMarkers.bind(this);
  }

  componentWillMount = async () => {
    this.initFirebase();
    this.initMarkers();
  }

  initFirebase = async () => {
		let config = {
			apiKey: "AIzaSyAW3kLaAOVwMYr0PBd8xgE42LU-IdE4KSw",
      authDomain: "earthquake-sensors.firebaseapp.com",
      databaseURL: "https://earthquake-sensors.firebaseio.com",
      projectId: "earthquake-sensors",
      storageBucket: "earthquake-sensors.appspot.com",
      messagingSenderId: "264814667469"
		};
		firebase.initializeApp(config);
  }
  
  initMarkers = async () => {
    var database = await firebase.database();
    if (database)
      var markers = await database.ref();
    else
      console.log('ERROR---no database');
    markers.on('value', snapshot => {
      var list = [];
      var alertlist = [];
      snapshot.forEach(function(data) {
        let sensor = data.val();
        sensor["key"] = data.key;
        list.push(sensor);
        if (sensor.mag > 3)
          alertlist.push(sensor)
      })
      var center = findEpicenter(alertlist)
      this.setState({
        database: database,
        markerList: list,
        epicPos: {
          latitude: center.lat,
          longitude: center.lon
        },
      })
    })
  }
  
  render() {
    times += 1;
    console.log(times)
    return (
      <View style={{flex: 1}}>
        <MapView
          style={{ flex: 1 }}
          zoomEnabled={true}
          initialRegion={{
            latitude: this.state.currPos.latitude,
            longitude: this.state.currPos.longitude,
            latitudeDelta: 10,
            longitudeDelta: 10,
          }}
        >
        <MapView.Marker
          coordinate={this.state.currPos}
          image={markerMe}
          title={'MyPosition'}
        />
        <MapView.Circle
          center={this.state.epicPos}
          radius = {20000}
          title={'Earthquake'}
          fillColor={'rgba(255,0,0,0.3)'}
          strokeColor={'rgba(255,0,0,0.3)'}
        />
     
   { this.state.markerList.map(function(x, i) {
      return (
        <MapView.Circle
          key = {i}
          center={{
            latitude: x.lat,
            longitude: x.lng,
          }}
          radius = {x.dist * 100}
          strokeWidth={2}
          fillColor={'rgba(240,120,0,0.3)'}
          strokeColor={'rgba(240,120,0,0.3)'}
        />
      );
      })}
      <MarkerMaker 
        markers={this.state.markerList}
      />
    </MapView>
    </View>
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
  },
  text: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  sensorMarker: {
    flex: 1,
    marginLeft: 14,
    marginTop: 8,
  }
});