import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const defaultLogs = [
  { date: "07/05/2025", entrance: "11:00", exit: "20:20" },
  { date: "08/05/2025", entrance: "10:00", exit: "22:30" },
  { date: "11/05/2025", entrance: "10:30", exit: "18:30" },
  { date: "12/05/2025", entrance: "11:30", exit: "20:16" },
  { date: "13/05/2025", entrance: "10:50", exit: "20:00" },
  { date: "14/05/2025", entrance: "11:15", exit: "20:10" },
];

export default function App() {
  const [log, setLog] = useState([]);

  const resetLogs = async () => {
    await AsyncStorage.clear();
    setLog([]);
  };

  const getDateKey = (date = new Date()) => {
    return date.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleAction = async (type) => {
    const today = getDateKey();
    const time = getCurrentTime();
    try {
      const storedLogs = await AsyncStorage.getItem("workLogs");
      const parsedLogs = storedLogs ? JSON.parse(storedLogs) : [];
      let updatedLogs = [];
      const index = parsedLogs.findIndex((entry) => entry.date === today);
      if (index !== -1) {
        updatedLogs = [...parsedLogs];
        updatedLogs[index][type.toLowerCase()] = time;
      } else {
        const newDate = {
          date: today,
          entrance: type === "Entrance" ? time : "",
          exit: type === "Exit" ? time : "",
        };
        updatedLogs = [...parsedLogs, newDate];
      }
      await AsyncStorage.setItem("workLogs", JSON.stringify(updatedLogs));
      setLog(updatedLogs);
    } catch (error) {
      console.error("Error saving logs", error);
    }
  };

  const handleEntrance = () => handleAction("Entrance");
  const handleExit = () => handleAction("Exit");

  const calculateWorkedHours = (entrance, exit) => {
    if (!entrance || !exit) return "--";

    const [eh, em] = entrance.split(":").map(Number);
    const [xh, xm] = exit.split(":").map(Number);
    const start = new Date(0, 0, 0, eh, em);
    const end = new Date(0, 0, 0, xh, xm);

    let diff = (end - start) / 60000; // difference in minutes
    if (diff < 0) diff += 24 * 60; // cross midnight

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours} h ${minutes} min`;
  };

  useEffect(() => {
    const initLogs = async () => {
      const stored = await AsyncStorage.getItem("workLogs");
      if (stored === null) {
        
        await AsyncStorage.setItem("workLogs", JSON.stringify(defaultLogs));
        setLog(defaultLogs);
      } else {
        
        setLog(JSON.parse(stored));
      }
    };

    initLogs();
  }, []);
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Time Tracker 
        {/* <Button title="X" onPress={resetLogs} /> */}
      </Text>

      <ScrollView style={styles.logContainer}>
        {log.map((entry, index) => (
          <View key={index} style={styles.logEntry}>
            <Text style={styles.logText}>{entry.date}</Text>

            <Text style={styles.logText}>
              <Text style={styles.entrance}>
                Entrance: {entry.entrance || "--"}
              </Text>
              {"  |  "}
              <Text style={styles.exit}>Exit: {entry.exit || "--"}</Text>
            </Text>

            <Text style={styles.duration}>
              Worked: {calculateWorkedHours(entry.entrance, entry.exit)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button title="Entrance" onPress={handleEntrance} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Exit" color="red" onPress={handleExit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  logContainer: {
    flex: 1,
    marginBottom: 20,
  },
  logEntry: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  logText: {
    fontSize: 16,
    fontWeight: "500",
  },
  entrance: {
    color: "green",
    fontWeight: "bold",
  },
  exit: {
    color: "red",
    fontWeight: "bold",
  },
  duration: {
    color: "#555",
    fontWeight: "bold",
  },
  buttonReset: {
    margin: 2,
  },
  buttonContainer: {
    marginBottom: 15,
  },
});
