import SQLite from 'react-native-sqlite-storage';

// função para criar o banco de dados SQLite
const db = SQLite.openDatabase(
  { name: 'offlineSync.db', location: 'default' },
  () => console.log('Database created with success!'),
  error => console.log('Error to create database:', error),
);

// função para criar tabela no SQLite
export const createTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        question TEXT, 
        answer TEXT, 
        synced INTEGER DEFAULT 0
      );`,
      [],
      () => console.log('"answers" table created!'),
      error => console.log('Error to create table:', error),
    );
  });
};

// função para inserir respostas no SQLite
export const saveAnswer = (question: string, answer: string) => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO answers (question, answer, synced) VALUES (?, ?, 0);`,
      [question, answer],
      (_, result) => console.log(`Answer saved with ID: ${result.insertId}`),
      error => console.log('Error to save answer:', error),
    );
  });
};

// função para pegar as respostas que foram salvas no SQLite, mas ainda não sincronizadas
export const getAnswers = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM answers WHERE synced = 0;`,
          [],
          (_, results) => resolve(results.rows.raw()),
          error => {
            console.log('Error to get answers:', error);
            reject(error);
          },
        );
      });
    });
  };
  

export default db;
