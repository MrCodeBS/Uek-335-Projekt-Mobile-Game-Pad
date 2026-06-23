import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useFocusEffect } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer } from 'expo-sensors';

import { useWebSocket } from '@/hooks/useWebSocket';
import GameButton from '@/components/GameButton';
import Joystick from '@/components/Joystick';

const STORAGE_KEY = 'gamepad_server_ip';

export default function GamepadScreen() {
  useKeepAwake();

  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [useJoystick, setUseJoystick] = useState(false);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });

  const { status, connect, disconnect, sendButton, sendAxis, sendGyro } = useWebSocket(
    wsUrl || 'ws://localhost:8080'
  );

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      return () => {
        disconnect();
      };
    }, [disconnect])
  );

  useEffect(() => {
    if (wsUrl) {
      connect();
    }
  }, [wsUrl, connect]);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { ip, port } = JSON.parse(saved);
        setWsUrl(`ws://${ip}:${port}`);
      } else {
        setWsUrl('ws://192.168.1.XXX:8080');
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let subscription: any;
    if (gyroEnabled) {
      Accelerometer.setUpdateInterval(50); // Faster updates for smoother steering
      subscription = Accelerometer.addListener((data) => {
        setGyroData(data);
        sendGyro(data.x, data.y, data.z);
      });
    } else {
      setGyroData({ x: 0, y: 0, z: 0 });
    }
    return () => {
      if (subscription) subscription.remove();
    };
  }, [gyroEnabled, sendGyro]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.statusText}>Status: {status}</Text>
          <Text style={styles.ipText}>{wsUrl}</Text>
        </View>

        <View style={styles.topCenter}>
          <Text style={styles.switchLabel}>D-Pad</Text>
          <Switch
            value={useJoystick}
            onValueChange={setUseJoystick}
          />
          <Text style={styles.switchLabel}>Joystick</Text>
        </View>

        <View style={styles.topRight}>
          <Link href="/settings" asChild>
            <Button title="Settings" />
          </Link>
        </View>
      </View>

      {/* BEGINNER GYRO HACK UI */}
      <View style={{ backgroundColor: gyroEnabled ? 'green' : 'red', padding: 10, marginBottom: 10, alignItems: 'center' }}>
        <Button 
          title={gyroEnabled ? "[ GYRO IS ON - CLICK TO TURN OFF ]" : "[ GYRO IS OFF - CLICK TO TURN ON ]"} 
          color="#fff" 
          onPress={() => setGyroEnabled(!gyroEnabled)} 
        />
        {gyroEnabled && (
          <Text style={{ color: '#fff', fontSize: 16, marginTop: 5, fontFamily: 'monospace' }}>
            X: {gyroData.x.toFixed(3)} | Y: {gyroData.y.toFixed(3)} | Z: {gyroData.z.toFixed(3)}
          </Text>
        )}
      </View>

      {/* Shoulder Buttons */}
      <View style={styles.shoulderRow}>
        <GameButton label="L2" onPress={() => sendButton('L2', 'press')} onRelease={() => sendButton('L2', 'release')} size={60} />
        <GameButton label="LB" onPress={() => sendButton('LB', 'press')} onRelease={() => sendButton('LB', 'release')} size={60} />
        <View style={{ flex: 1 }} />
        <GameButton label="RB" onPress={() => sendButton('RB', 'press')} onRelease={() => sendButton('RB', 'release')} size={60} />
        <GameButton label="R2" onPress={() => sendButton('R2', 'press')} onRelease={() => sendButton('R2', 'release')} size={60} />
      </View>

      {/* Main Controls Area */}
      <View style={styles.mainArea}>
        {/* Left Side */}
        <View style={styles.leftControl}>
          {!useJoystick ? (
            <View style={styles.dpad}>
              <View style={[styles.dpadRow, { justifyContent: 'center' }]}>
                <GameButton label="UP" size={50} onPress={() => sendButton('UP', 'press')} onRelease={() => sendButton('UP', 'release')} />
              </View>
              <View style={[styles.dpadRow, { justifyContent: 'space-between' }]}>
                <GameButton label="LEFT" size={50} onPress={() => sendButton('LEFT', 'press')} onRelease={() => sendButton('LEFT', 'release')} />
                <View style={{ width: 50, height: 50 }} />
                <GameButton label="RIGHT" size={50} onPress={() => sendButton('RIGHT', 'press')} onRelease={() => sendButton('RIGHT', 'release')} />
              </View>
              <View style={[styles.dpadRow, { justifyContent: 'center' }]}>
                <GameButton label="DOWN" size={50} onPress={() => sendButton('DOWN', 'press')} onRelease={() => sendButton('DOWN', 'release')} />
              </View>
            </View>
          ) : (
            <Joystick size={150} onMove={sendAxis} onRelease={() => sendAxis(0, 0)} />
          )}
        </View>

        {/* Right Side */}
        <View style={styles.rightControl}>
          <View style={[styles.actionRow, { justifyContent: 'center' }]}>
            <GameButton label="Y" size={60} round onPress={() => sendButton('Y', 'press')} onRelease={() => sendButton('Y', 'release')} />
          </View>
          <View style={[styles.actionRow, { justifyContent: 'space-between' }]}>
            <GameButton label="X" size={60} round onPress={() => sendButton('X', 'press')} onRelease={() => sendButton('X', 'release')} />
            <GameButton label="B" size={60} round onPress={() => sendButton('B', 'press')} onRelease={() => sendButton('B', 'release')} />
          </View>
          <View style={[styles.actionRow, { justifyContent: 'center' }]}>
            <GameButton label="A" size={60} round onPress={() => sendButton('A', 'press')} onRelease={() => sendButton('A', 'release')} />
          </View>
        </View>
      </View>
      <StatusBar hidden />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7', // standard iOS light background
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  topLeft: {
    flex: 1,
  },
  topCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  ipText: {
    fontSize: 12,
    color: '#666',
  },
  switchLabel: {
    fontSize: 14,
    marginHorizontal: 8,
    color: '#333',
  },
  shoulderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  leftControl: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightControl: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpad: {
    width: 150,
    height: 150,
    justifyContent: 'space-between',
  },
  dpadRow: {
    flexDirection: 'row',
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    width: 160,
    height: 60,
    marginBottom: -10,
  },
});
