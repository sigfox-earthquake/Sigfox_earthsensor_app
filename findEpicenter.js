import React from 'react';
var latLon = require('geodesy').LatLonVectors;

const lineIntersect = (p0, p1, p2, p3) => {
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

export const findEpicenter = (x) => {
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
    var latlng = lineIntersect(p0, p1, p2, p3);
    return latlng
  }