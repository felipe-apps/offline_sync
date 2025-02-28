import { getAnswers } from '../database/database';
import db from '../database/database';
import NetInfo from '@react-native-community/netinfo';

// função que envia respostas para a API
const sendAnswersToAPI = async () => {
    try {
      const answers = await getAnswers();
  
      if (answers.length === 0) {
        console.log('No answer available!');
        return;
      }
  
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Respostas da prova', body: JSON.stringify(answers), userId: 1 }),
      });
  
      if (response.ok) {
        console.log('Successfully sent answers!');
        answers.forEach(answer => updateSyncedStatus(answer.id));
      } else {
        console.log('Error sending answers to API');
      }
    } catch (error) {
      console.log('Network error:', error);
    }
  };  

// função para atualizar o status de sincronização das respostas no SQLite
const updateSyncedStatus = (id: number) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE answers SET synced = 1 WHERE id = ?`,
      [id],
      () => console.log(`Answer with ID ${id} was synced with the database`),
      error => console.log('Error syncing with the database:', error),
    );
  });
};

// função para monitorar a conexão com rede antes de enviar respostas para a API
const monitorNetworkAndSync = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      console.log('Connection found! Trying to sync...');
      sendAnswersToAPI();
    } else {
      console.log('No network connection, try reconnecting!');
    }
  });
};

export { sendAnswersToAPI, monitorNetworkAndSync };
