import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import * as firebase from 'firebase';
import markerGreen from "./img/marker_g.png";
import markerRed from "./img/marker_r.png";
import markerOrange from "./img/marker_o.png";
import markerMe from "./img/marker_mypos.png";
var latLon = require('geodesy').LatLonVectors;
import toVector from "./latlon-vectors";

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
      var center = this.findEpicenter(alertlist)
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

  lineIntersect(p0, p1, p2, p3) {
    var A1 = p1.lon - p0.lon,
			B1 = p0.lat - p1.lat,
			C1 = A1 * p0.lat + B1 * p0.lon,
			A2 = p3.lon - p2.lon,
			B2 = p2.lat - p3.lat,
			C2 = A2 * p2.lat + B2 * p2.lon,
			denominator = A1 * B2 - A2 * B1;
		return {
			lat: (B2 * C1 - B1 * C2) / denominator,
			lon: (A1 * C2 - A2 * C1) / denominator
		}
  }

  findEpicenter = (x) => {
    var data1 = x[0],
        data2 = x[1],
        data3 = x[2];
    var alert1 = new latLon(data1.lat, data1.lng),
        alert2 = new latLon(data2.lat, data2.lng),
        alert3 = new latLon(data3.lat, data3.lng);
    var fraction12 = data1.dist / (data1.dist + data2.dist),
        fraction23 = data2.dist / (data2.dist + data3.dist);
    var p0 = alert1.intermediatePointTo(alert2, fraction12),
        p2 = alert2.intermediatePointTo(alert3, fraction23);
    var slope12 = -1 / ((data1.lng - data2.lng) / (data1.lat - data2.lat)),
        slope23 = -1 / ((data2.lng - data3.lng) / (data2.lat - data3.lat));
    var b12 = p0.lon - (slope12 * p0.lat),
        b23 = p2.lon - (slope23 * p2.lat)
    var p1 = {
          lat: p0.lat + 1,
          lon: (p0.lat + 1) * slope12 + b12
        },
        p3 = {
          lat: p2.lat + 1,
          lon: (p2.lat + 1) * slope23 + b23
        };
    var latlng = this.lineIntersect(p0, p1, p2, p3);
    return latlng
  }
  
  render() {
    times += 1;
    console.log(times)
    return (
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
    { this.state.markerList.map(function(x, i) {
      if (!x.mag)
        x.color = markerGreen;
      else if (x.mag > 0 && x.mag <= 3)
        x.color = markerOrange;
      else
        x.color = markerRed;
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
          <View style={styles.sensorMarker}>
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
  sensorMarker: {
    flex: 1,
    marginLeft: 14,
    marginTop: 8,
  }
});
