import React, { useState, useEffect } from "react";
import { Platform, Text, View, StyleSheet, Dimensions } from "react-native";
import Constants from "expo-constants";
import * as Location from "expo-location";
import MapView from "react-native-maps";

/** list of others markers (path taken) */
function MarkersView() {
  return (
    <MapView.Marker
      coordinate={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      title={"Là bas2.."}
    />
  );
}

/** Display all markers except the last position (supposed to be the current position (or nearly..)*/
function MarkersViewDyn() {
  //remove the last element in the global markers list because it will be later displayed separately fisrt
  // markers.unshift(); //???
  // unset(markers[markers.length - 1]); //or maybe?

  return markers.map((mk) => (
    <MapView.Marker coordinate={mk.latlng} title={mk.title} />
  ));
}

/** Display all record markers*/
function MarkersViewRec() {
  //remove the last element in the global markers list because it will be later displayed separately fisrt
  // listRecord.unshift(); //???
  // unset(listRecord[listRecord.length - 1]); //or maybe?

  return listRecord.map((mk) => (
    <MapView.Marker coordinate={mk.latlng} title={mk.title} />
  ));
}

//record current location as a future marker with specific color
function recordLocation() {
  setRecord(true);
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [record, setRecord] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }); //default value to avoid default coordinate Marker error null

  //list of all locations caught (future markers)
  const [markers, setMarkers] = useState([]);

  //list of all specifical records locations caught (future markers)
  const [listRecord, setListRecord] = useState([]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android" && !Constants.isDevice) {
        setErrorMsg(
          "Oops, this will not work on Snack in an Android emulator. Try it on your device!"
        );
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      setTimeout(() => {
        setLocation(location);
        console.log(location.coords.latitude + ":" + location.coords.longitude);

        /** my current location */
        if (location) {
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });

          if (record === true) {
            //if specifical record asked by user (onPress)
            //add the location as a new marker for future recorded marker
            listRecord.push({
              latlng: {
                latitude: region.latitude,
                longitude: region.longitude,
              },
              title: "testrecord",
            });

            //update the global list of all existing listRecord
            setlistRecord(listRecord);

            //reset flag record
            setRecord(null);
          } else {
            //add the previous location as a new marker for future path way markers
            markers.push({
              latlng: {
                latitude: region.latitude,
                longitude: region.longitude,
              },
              title: "test",
            });

            //update the global list of all existing markers
            setMarkers(markers);
          }
        }
      }, 30000); //@Todo: create a new var for the delay
    })();
  }, [location]);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    //text = JSON.stringify(location);
    text = location.coords.latitude + ":" + location.coords.longitude;
  }

  return (
    <View style={styles.container}>
      {/* <MapView region={region} mapType="satellite" style={styles.map}> */}
      <MapView region={region} style={styles.map}>
        <MapView.Marker coordinate={region} title={"Là bas.."} />
        {/* <MarkersView /> */}
        {/* <MarkersViewDyn /> */}
        {/* <MarkersViewRec /> */}
      </MapView>
      {/* <Button
        title="Record position"
        style={styles.button}
        onPress={recordLocation()}
      /> */}
      <Text style={styles.paragraph}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  button: {
    fontSize: 10,
    textAlign: "center",
  },
  paragraph: {
    fontSize: 10,
    textAlign: "center",
  },
  map: {
    width: Dimensions.get("window").width - 5,
    height: Dimensions.get("window").height - 45,
  },
});
