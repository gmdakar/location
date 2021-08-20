import React, { useState, useEffect } from "react";
import {
  Platform,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Button,
  Image,
} from "react-native";
import { Icon } from "react-native-elements";
import Constants from "expo-constants";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import Lightbox from "react-native-lightbox-v2";

/** l*/
function ShowRecordImage() {
  console.log("ShowRecordImage");
  return (
    <View style={styles.container}>
      <Lightbox>
        <Image
          style={{ height: 300, width: 300 }}
          source={{
            uri: "http://knittingisawesome.com/wp-content/uploads/2012/12/cat-wearing-a-reindeer-hat1.jpg",
          }}
        />
        <Image
          style={{ height: 300, width: 300 }}
          source={{
            uri: "http://knittingisawesome.com/wp-content/uploads/2012/12/cat-wearing-a-reindeer-hat1.jpg",
          }}
        />
      </Lightbox>
    </View>
  );
}

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
function MarkersViewMark() {
  //remove the last element in the global markers list because it will be later displayed separately fisrt

  return (
    listMarkers
      //.slice(0, -1)
      .map((mk) => (
        <MapView.Marker
          key={Math.floor(Math.random() * 1000000)}
          coordinate={mk.latlng}
          title={mk.title}
          pinColor="#0000ff"
        >
          {/* <Image source={require('./marker.png')} style={{height: 35, width:35 }} /> */}
          <Icon
            reverse
            size={1}
            name="plug"
            type="font-awesome"
            color="#3434ee"
          />
        </MapView.Marker>
      ))
  );
}

/** Display all record markers*/
function MarkersViewRec() {
  //remove the last element in the global markers list because it will be later displayed separately fisrt
  return (
    listRecords
      //.slice(0, -1)
      .map((mk) => (
        <MapView.Marker
          key={Math.floor(Math.random() * 1000000)}
          coordinate={mk.latlng}
          title={mk.title}
          pinColor="#00ff00"
          // icon={require("./record.png")}
        >
          {/* <Image source={require('./record.png')} style={{height: 35, width:35 }} /> */}
          <Icon
            reverse
            size={9}
            name="clipboard"
            type="font-awesome"
            color="#123456"
          />
        </MapView.Marker>
      ))
  );
}

//record current location as a future marker with specific color
function recordLocation() {
  recordFlag = true;
}

var recordFlag = false;
var listMarkers = [];
var listRecords = [];
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

  const [showPhoto, setShowPhoto] = useState(false);

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

        /** my current location */
        if (location) {
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });

          if (recordFlag == true) {
            //if specifical record asked by user (onPress)
            //add the location as a new marker for future recorded marker
            let newval = {
              latlng: {
                latitude: region.latitude,
                longitude: region.longitude,
              },
              title: "testrecord",
            };

            //check if we should add the same values in the array
            let notsameprevious = true;
            if (
              listRecords.length > 0 &&
              JSON.stringify(newval) ===
                JSON.stringify(listRecords[listRecords.length - 1])
            ) {
              notsameprevious = false;
            }

            if (notsameprevious) {
              listRecord.push(newval);

              //update the global list of all existing listRecord
              setListRecord(listRecord);
              listRecords = listRecord;
              console.log(
                "record => " +
                  location.coords.latitude +
                  ":" +
                  location.coords.longitude
              );
              console.log("recordFlag => " + recordFlag);

              //reset flag record
              recordFlag = false;
            }
          } else {
            let newval = {
              latlng: {
                latitude: region.latitude,
                longitude: region.longitude,
              },
              title: "testmarker",
            };

            //check if we should add the same values in the array
            let notsameprevious = true;
            if (
              listMarkers.length > 0 &&
              JSON.stringify(newval) ===
                JSON.stringify(listMarkers[listMarkers.length - 1])
            ) {
              notsameprevious = false;
              console.log("why");
            } else console.log("why2");
            console.log("ooo:" + newval.latlng.latitude);
            if (notsameprevious) {
              //add the previous location as a new marker for future path way markers
              markers.push(newval);

              //update the global list of all existing markers
              setMarkers(markers);
              listMarkers = markers;
              console.log(
                "marker => " +
                  location.coords.latitude +
                  ":" +
                  location.coords.longitude
              );

              console.log("recordFlag => " + recordFlag);
            }
          }
        }
      }, 30000); //@Todo: create a new var for the delay
    })();
  }, [location]);

  let text = "Wait..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    //text = JSON.stringify(location);
    text = location.coords.latitude + ":" + location.coords.longitude;
  }

  return (
    <View style={styles.container}>
      {!showPhoto && (
        <MapView region={region} mapType="satellite" style={styles.map}>
          {/* <MarkersView /> */}
          <MarkersViewMark />
          <MarkersViewRec />
          <MapView.Marker coordinate={region} title={"Je suis ici.."}>
            <Icon
              reverse
              size={9}
              name="child"
              type="font-awesome"
              color="#dd0000"
            />
          </MapView.Marker>
        </MapView>
      )}
      {!showPhoto && (
        <Button
          title="Record position"
          style={styles.button}
          onPress={() => recordLocation()}
        />
      )}
      {!showPhoto && (
        <Button
          title="Show Record Image"
          style={styles.button}
          onPress={() => setShowPhoto(true)}
        />
      )}
      {!showPhoto && <Text style={styles.paragraph}>{text}</Text>}

      {showPhoto && ShowRecordImage()}

      {/* <TouchableOpacity onPress={() => this._onPress(item)}>
         <Text>{item.title}</Text>
        <TouchableOpacity/> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    fontSize: 10,
    textAlign: "center",
  },
  paragraph: {
    fontSize: 10,
    marginVertical: 20,
    textAlign: "center",
  },
  map: {
    marginVertical: 10,
    width: Dimensions.get("window").width - 5,
    height: Dimensions.get("window").height - 65,
  },
});
