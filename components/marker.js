import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import markerGreen from "../img/marker_g.png";
import markerRed from "../img/marker_r.png";
import markerOrange from "../img/marker_o.png";

export class MarkerMaker extends React.Component {
    render () {
        return (
            this.props.markers.map(function(x, i) {
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
        })
    )};
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