import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import * as firebase from 'firebase';
import markerGreen from "./img/marker_g.png";
import markerRed from "./img/marker_r.png";
import markerOrange from "./img/marker_o.png";
import markerMe from "./img/marker_mypos.png";
import latLon from "./latlon.js";

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

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state= {
      database: null,
      markerList: [],
      latList: [],
      lngList: [],
      magList: [],
      curr_cord: {
        latitude: 19.472,
        longitude: -99.111,
      }
    }
  }

  componentWillMount() {
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
    this.setState({ database });
    if (database) {
      var markers = await database.ref();
      var count = 0;
    }
    else {
      console.log('ERROR---no database');
    }
    markers.on('value', snapshot => {
      var list =[];
      snapshot.forEach(function(data){
          let sen = data.val();
          sen["key"] = data.key;
          list.push(sen);
      })
      this.setState({
          markerList: list
      })
  })  
  }

  render() {
    return (
      <MapView
      style={{ flex: 1 }}
      zoomEnabled={true}
      initialRegion={{
        latitude: 19.472,
        longitude: -99.111,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
    <MapView.Marker
        coordinate={{
            latitude: 19.472,
            longitude: -99.111,
        }}
        image={markerMe}
        title={'MyPosition'}
        />

    { this.state.markerList.map(function(x, i) {
      if (x.mag===0) {
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
        <View>
        <Text style={styles.text}>{x.mag}</Text>
        </View>
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
    fontSize: 15,
    marginLeft: 20,
    marginTop: 5,
    textAlign: 'center',
  }
});
