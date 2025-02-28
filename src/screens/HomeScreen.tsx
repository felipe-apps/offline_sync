import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { saveAnswer, getAnswers } from '../database/database';
import { sendAnswersToAPI } from '../sync/sync';

const HomeScreen = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);

  // busca as respostas salvas no SQLite ao carregar a tela
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

  const handleSaveAnswer = () => {
    if (!question || !answer) {
      Alert.alert('Erro', 'Preencha a pergunta e a resposta!');
      return;
    }

    saveAnswer(question, answer);
    setQuestion('');
    setAnswer('');
    loadAnswers();
  };

  // envia as respostas para a API e as mostra na tela
  const handleSync = async () => {
    await sendAnswersToAPI();
    loadAnswers();
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

      <Button title="Salvar Resposta" onPress={handleSaveAnswer} />

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

      <Button title="Sincronizar" onPress={handleSync} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginTop: 20, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  answerItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
});

export default HomeScreen;
