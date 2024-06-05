import React, { useEffect, useState } from 'react';
import { StyleSheet, Modal, Text, View, SafeAreaView, Keyboard, TouchableWithoutFeedback, TextInput, TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-date-picker';
import SQLite from 'react-native-sqlite-storage';
import SuccessPopup from './SuccessScreen';

SQLite.enablePromise(true);
const dbPromise = SQLite.openDatabase({ name: 'nyx.db', location: 'default' });

//Definizione props per il PartecipantAdderPopup.
interface PartecipantAdderPopupProps {
  modalVisible: boolean; //Check di visibilità.
  chiudiPopup: () => void; //Medoto intrinseco per la chiusura.
  eventoId: number; //id evento.
}

//Definizione del componente.
const PartecipantAdderPopup: React.FC<PartecipantAdderPopupProps> = ({ modalVisible, chiudiPopup, eventoId }) => {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [date, setDate] = useState(new Date());
  const [data_nascita, setDataNascita] = useState('');
  const [result, setResult] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [affirmativeOrnegative, setAffirmativeOrNegative] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  //Metodo utile all'aggiunta di un partecipante nella tabella 'partecipazione'.
  const aggiungiPartecipazione = async () => {
    try {
      //Si controlla il formato del nome, cognome e della data
      const today = new Date();
      const fourteenYearsAgo = new Date(
        today.getFullYear() - 14,
        today.getMonth(),
        today.getDate()
      );//Se si vuole aggiungere un minore avente meno di 14 anni, viene bloccata l'aggiunta.
      if (!nome || !cognome || !date || !/^[A-Za-z\s\-]+$/.test(nome) || !/^[A-Za-z\s\-]+$/.test(cognome) ) {
        setAffirmativeOrNegative(false);
        setShowPopup(true);
        return;
      }

      const db = await dbPromise;
      await db.executeSql(
        'INSERT INTO partecipazione (nome, cognome, data_nascita, evento_id) VALUES (?, ?, ?, ?)',
        [nome, cognome, date.toISOString().split('T')[0], eventoId]
      );
      setAffirmativeOrNegative(true);
      setShowPopup(true);
      setNome('');
      setCognome('');
    } catch (error) {
      setAffirmativeOrNegative(false);
      setShowPopup(true);
      console.error("Error inserting into database: ", error);
    }
  };


  //Viene costruito il componente.
  return (
    <SafeAreaView>
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
                <Text style={styles.PopupTitle}>Inserisci i dati del partecipante</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome"
                  value={nome}
                  onChangeText={setNome}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Cognome"
                  value={cognome}
                  onChangeText={setCognome}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Data di nascita"
                  value={data_nascita}
                  onPress={() => setDatePickerVisibility(true)}
                />
                {isDatePickerVisible && (
                <DatePicker
                  modal
                  locale='it'
                  open={isDatePickerVisible}
                  date={date}
                  onConfirm={(date) => {
                    setDataNascita(date.toISOString().split('T')[0]);
                  }}
                  onCancel={() => setDatePickerVisibility(false)}
                  mode="date"
                  theme="dark"
                  maximumDate={new Date()}
                />
                )}
                <TouchableOpacity style={styles.button2} onPress={() => {
                  aggiungiPartecipazione();
                }}>
                  <Text style={styles.buttonText}>Conferma</Text>
                </TouchableOpacity>
                {result && <Text style={styles.resultText} onPress={() => {chiudiPopup;}}>{result}</Text>}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <SuccessPopup visible={showPopup} chiudiPopup={() => setShowPopup(false)} success={affirmativeOrnegative} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  view1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#F5EBCF',
    padding: 20,
    borderRadius: 20,
    width: 350,
    alignContent: 'center',
    maxHeight: 500,
  },
  input: {
    height: 40,
    borderColor: '#050D25',
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#D9D9D9',
    fontSize: 15,
    color: '#050D25',
  },
  PopupTitle: {
    fontFamily: 'Arial',
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 15,
    color: '#050d25'
  },
  button2: {
    backgroundColor: '#050D25',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: 100,
  },
  buttonText: {
    color: '#D9D9D9',
    fontSize: 16,
  },
  resultText: {
    marginTop: 10,
    color: 'white',
    textAlign: 'center',
  }
});

export default PartecipantAdderPopup;
