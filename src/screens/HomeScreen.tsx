import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { saveAnswer, getAnswers } from '../database/database';
import { sendAnswersToAPI } from '../sync/sync';

const HomeScreen = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    loadAnswers();
  }, []);

  const loadAnswers = async () => {
    try {
      const data = await getAnswers();
      setAnswers(data);
    } catch (error) {
      console.log('Error to get answers:', error);
    }
  };

  const startTimer = () => {
    startTimeRef.current = performance.now();
  };

  const stopTimer = () => {
    if (startTimeRef.current !== null) {
      const elapsed = ((performance.now() - startTimeRef.current) / 1000).toFixed(2);
      setTimeout(() => {
        setToastMessage(`Tempo de carregamento: ${elapsed} segundos`);
        setTimeout(() => setToastMessage(null), 3000);
      }, 300);
    }
  };

  const handleSaveAnswer = async () => {
    if (!question || !answer) {
      Alert.alert('Erro', 'Preencha a pergunta e a resposta!');
      return;
    }
  
    setSaving(true);
    startTimer();
  
    try {
      console.time('Batch Insert');
  
      const promises = Array.from({ length: 500 }, (_, i) => 
        saveAnswer(question, answer)
      );
  
      await Promise.all(promises);
  
      console.timeEnd('Batch Insert');
      await loadAnswers();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar respostas.");
    } finally {
      setSaving(false);
      stopTimer();
    }
  };
  
  const handleSync = async () => {
    setLoading(true);
    startTimer();
    try {
      await sendAnswersToAPI();
      await loadAnswers();
    } catch (error) {
      Alert.alert("Erro", "Falha ao sincronizar as respostas.");
    } finally {
      setLoading(false);
      stopTimer();
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Respostas da Prova</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite a pergunta"
        value={question}
        onChangeText={setQuestion}
      />
      <TextInput
        style={styles.input}
        placeholder="Digite a resposta"
        value={answer}
        onChangeText={setAnswer}
      />

      <Button title="Salvar Resposta" onPress={handleSaveAnswer} disabled={saving} />

      <Text style={styles.subtitle}>Respostas Salvas</Text>

      <FlatList
        data={answers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.answerItem}>
            <Text>{item.question}: {item.answer}</Text>
            <Text style={{ color: item.synced ? 'green' : 'red' }}>
              {item.synced ? '✅ Sincronizado' : '⏳ Pendente'}
            </Text>
          </View>
        )}
      />

      <Button title="Sincronizar" onPress={handleSync} disabled={loading} />

      {(loading || saving) && (
        <View style={styles.overlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        </View>
      )}

      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginTop: 20, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  answerItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  loaderBox: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  toast: {
    position: 'absolute',
    bottom: 50,
    left: '10%',
    right: '10%',
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastText: {
    color: 'white',
    fontSize: 16,
  }
});

export default HomeScreen;
