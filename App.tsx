import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import { monitorNetworkAndSync } from './src/sync/sync';
import { createTable } from './src/database/database';

const Stack = createStackNavigator();

// cria tabela e sincroniza com o SQLite ao abrir o App
const App = () => {
  useEffect(() => {
    createTable();
    monitorNetworkAndSync(); 
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Respostas' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
