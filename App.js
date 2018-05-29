import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import * as firebase from 'firebase';
import markerGreen from "./img/marker_g.png";
import markerRed from "./img/marker_r.png";
import markerOrange from "./img/marker_o.png";
import markerMe from "./img/marker_mypos.png";
import latLon from "./latlon.js";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state= {
      database: null,
      markerList: [],
      epicenter: [],
      epicLatLng: {
        latitude: 0,
        longitude: 0,
      },
      curr_cord: {
        latitude: 19.472,
        longitude: -99.111,
      }
    }
  }

  componentWillMount = async () => {
    this.initFirebase();
    await this.initMarkers();
  }
//TO DO: have to change it so findEpicenter will update state for epicenter
  componentWillReceiveProps(nextProps) {
    console.log('recieved prop');
    if (nextProps.epicenter.length > 2) {
      this.findEpicenter(nextProps.epicenter);
    } else {
      console.log('less then 3 major')
    }
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
    this.setState({ database });
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
      this.setState({
          markerList: list,
          epicenter: alertlist,
      })
    })
  }

  findEpicenter = (x) => {
    console.log('got epicenter!');
    var epicLat = 0;
    var epicLng = 0;
    x.forEach(function(data) {
        epicLat += data.lat;
        epicLng += data.lng;
    })
    console.log(epicLat / 3);
    console.log(epicLng / 3);
    this.setState({
      epicLatLng: {
        latitude: epicLat / 3,
        longitude:epicLng / 3
      }
    })
  }

  render() {
    return (
      <MapView
        style={{ flex: 1 }}
        zoomEnabled={true}
        initialRegion={{
        latitude: 19.203316,
        longitude: -101.265469,
        latitudeDelta: 10,
        longitudeDelta: 10,
        }}
      >
      <MapView.Marker
        coordinate={{
            latitude: 19.203316,
            longitude: -101.265469,
        }}
        image={markerMe}
        title={'MyPosition'}
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
    { this.state.markerList.map(function(x, i) {
      if (!x.mag) {
        x.color = markerGreen;
      }
      else if (x.mag > 0 && x.mag <= 3) {
        x.color = markerOrange;
      }
      else {
        x.color = markerRed;
      }
      return (
        <MapView.Marker
          coordinate={{
            latitude: x.lat,
            longitude: x.lng,
        }}
        key={i}
        image={x.color}
        title={x.key}
        >
          <View style={styles.circle}>
            <Text style={styles.text}>{x.mag? x.mag : undefined}</Text>
          </View>
          <MapView.Circle
            center={{
              latitude: x.lat,
              longitude: x.lng,
            }}
            radius = {x.dist * 10}
            fillColor={'#0f0'}
            strokeColor={'#000'}
          />
        </MapView.Marker>
      );
      })}
    </MapView>
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
  circle: {
    flex: 1,
    marginLeft: 14,
    marginTop: 8,
  }
});
