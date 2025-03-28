import MAXBridge from '@maxru/bridge';

const bridge = new MAXBridge();

// Инициализация соединения
bridge.init()
  .then(() => {
    console.log('MAX Bridge инициализирован');
    // Установка обработчиков событий
    bridge.on('message', handleMessage);
  })
  .catch((error) => {
    console.error('Ошибка инициализации MAX Bridge:', error);
  });

// Обработка сообщений от бота
function handleMessage(message) {
  // Обработка сообщений от бота
  console.log('Сообщение от бота:', message);
}

export default bridge;
