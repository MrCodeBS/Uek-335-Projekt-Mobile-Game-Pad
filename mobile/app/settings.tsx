import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'gamepad_server_ip';
const DEFAULT_IP = '192.168.1.XXX';
const DEFAULT_PORT = '8080';

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ currentIp?: string; currentPort?: string }>();
  const [ip, setIp] = useState(params.currentIp || DEFAULT_IP);
  const [port, setPort] = useState(params.currentPort || DEFAULT_PORT);

  useEffect(() => {
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setIp(parsed.ip || DEFAULT_IP);
        setPort(parsed.port || DEFAULT_PORT);
      }
    } catch {
      // ignore
    }
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ip, port }));
    } catch {
      // ignore
    }
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f7' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Server Connection</Text>
        <Text style={styles.subtitle}>
          Enter your PC's local IP address.
        </Text>

        <Text style={styles.label}>IP Address</Text>
        <TextInput
          style={styles.input}
          value={ip}
          onChangeText={setIp}
          placeholder="192.168.1.100"
          keyboardType="numeric"
          autoCorrect={false}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Port</Text>
        <TextInput
          style={styles.input}
          value={port}
          onChangeText={setPort}
          placeholder="8080"
          keyboardType="number-pad"
        />

        <Text style={styles.infoText}>
          Both your phone and PC must be on the same Wi-Fi network.
          The server must be running before you connect.
        </Text>

        <View style={styles.buttonContainer}>
          <Button title="Save & Connect" onPress={handleSave} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f2f2f7', // Standard light gray background
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
});
