import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Modal, Text, View, SafeAreaView, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

export default function Popup({ modalVisible, chiudiPopup }) {
  const navigation= useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const verificaCredenziali = async () => {
    try {
      const db = await dbPromise;
      const results = await db.executeSql('SELECT * FROM utente WHERE email = ? AND password = ?', [email, password]);
      if (results[0].rows.length > 0) {
        // Credenziali corrette
        chiudiPopup();
        navigation.navigate('Account',{ isAuthenticated: true });
      } else {
        // Credenziali errate
        setError('Email o password non corrette');
      }
    } catch (error) {
      console.error('Errore nella verifica delle credenziali', error);
      setError('Errore nella verifica delle credenziali');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={chiudiPopup}
      >
        <TouchableWithoutFeedback onPress={chiudiPopup}>
          <View style={styles.view1}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.popup}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                 {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.button} onPress={verificaCredenziali}>
                    <Text style={styles.buttonText}>Accedi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      chiudiPopup();
                      navigation.navigate('Registrazione');
                    }}
                  >
                    <Text style={styles.buttonText}>Registrati</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4a3358',
  },
  view1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#f5ebcf',
    padding: 20,
    borderRadius: 10,
    width: 350,
    height: 250,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: '#050d25',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#D9D9D9',
    fontSize: 15,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#050d25',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
  },
  buttonText: {
    color: '#D9D9D9',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
