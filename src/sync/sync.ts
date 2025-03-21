import { getAnswers } from '../database/database';
import db from '../database/database';
import NetInfo from '@react-native-community/netinfo';

// função que envia respostas para a API
const sendAnswersToAPI = async () => {
  try {
    const answers = await getAnswers();
    const pendingAnswers = answers.filter(answer => !answer.synced); 

    if (pendingAnswers.length === 0) {
      console.log('Nenhuma resposta pendente para envio.');
      return;
    }

    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Respostas da prova', body: JSON.stringify(pendingAnswers), userId: 1 }),
    });

    if (response.ok) {
      console.log('Respostas enviadas com sucesso!');

      const responseData = await response.json(); // garante que a API respondeu corretamente
      console.log('Resposta da API:', responseData);

      // atualiza apenas as respostas que foram enviadas com sucesso
      pendingAnswers.forEach(answer => updateSyncedStatus(answer.id));
    } else {
      console.log('Erro ao enviar respostas para API.');
    }
  } catch (error) {
    console.log('Erro de rede ao enviar respostas:', error);
  }
};

// função para atualizar o status de sincronização das respostas no SQLite
const updateSyncedStatus = (id: number) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE answers SET synced = 1 WHERE id = ?`,
      [id],
      () => console.log(`Resposta com ID ${id} sincronizada com o banco de dados`),
      error => console.log('Erro ao sincronizar com o banco de dados:', error),
    );
  });
};

let unsubscribe: any = null;

// função para monitorar a conexão com rede antes de enviar respostas para a API
const monitorNetworkAndSync = () => {
  if (unsubscribe) {
    // evita repetição do sync
    unsubscribe(); 
  }

  unsubscribe = NetInfo.addEventListener(async state => {
    if (state.isConnected) {
      console.log('Conexão encontrada! Tentando sincronizar...');

      const answers = await getAnswers();
      // filtra as respostas que ainda não foram sincronizadas
      const pendingAnswers = answers.filter(answer => !answer.synced);

      if (pendingAnswers.length > 0) {
        await sendAnswersToAPI();
      } else {
        console.log('Não há respostas pendentes para sincronizar.');
      }
    } else {
      console.log('Sem conexão. Aguardando reconexão...');
    }
  });
};

export { sendAnswersToAPI, monitorNetworkAndSync };