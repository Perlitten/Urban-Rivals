# Детализация интеграции с браузером Chrome

## Обзор интеграции

Интеграция ML-консультанта с браузером Chrome и игрой Urban Rivals является критически важным аспектом. Она обеспечивает сбор данных из игры, отображение рекомендаций и взаимодействие с пользователем. Интеграция будет реализована с использованием стандартных API Chrome для расширений.

## Структура расширения Chrome

Расширение будет состоять из следующих основных компонентов:

1.  **Манифест (manifest.json)**: Определяет структуру, разрешения и точки входа расширения.
2.  **Фоновый скрипт (background.js)**: Управляет состоянием, координирует работу других компонентов, обрабатывает долгосрочные задачи (например, обновление базы данных карт).
3.  **Контентные скрипты (content_scripts)**: Внедряются в страницы игры Urban Rivals для взаимодействия с DOM, сбора данных и внедрения UI.
4.  **UI-компоненты (React)**: Отображают интерфейс консультанта, визуализируют данные и рекомендации.
5.  **Web Workers**: Используются для выполнения ресурсоемких ML-вычислений в фоновом режиме без блокировки основного потока.

## Манифест (manifest.json)

```json
{
  "manifest_version": 3,
  "name": "Urban Rivals ML Consultant",
  "version": "1.0.0",
  "description": "AI-powered assistant for Urban Rivals gameplay, deck building, and market analysis.",
  "permissions": [
    "storage",        // Для IndexedDB и LocalStorage
    "activeTab",      // Доступ к активной вкладке (основной способ взаимодействия)
    "scripting",      // Для выполнения скриптов на странице
    "webNavigation",  // Для отслеживания навигации на страницах Urban Rivals
    "alarms"          // Для периодических задач (обновление рынка)
  ],
  "host_permissions": [
    "*://*.urban-rivals.com/*" // Доступ только к доменам Urban Rivals
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["*://*.urban-rivals.com/*"],
      "js": ["content_script.js"],
      "css": ["content_styles.css"],
      "run_at": "document_idle" // Запуск после загрузки основного контента
    }
  ],
  "action": {
    "default_popup": "popup.html", // Всплывающее окно для настроек и основной информации
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "web_accessible_resources": [
    {
      "resources": ["ui/*", "models/*", "images/*"], // Ресурсы, доступные контентным скриптам
      "matches": ["*://*.urban-rivals.com/*"]
    }
  ]
}
```

## Контентные скрипты (Content Scripts)

### 1. Внедрение и инициализация
- Контентный скрипт (`content_script.js`) будет автоматически внедряться на все страницы `*.urban-rivals.com/*` после загрузки DOM (`document_idle`).
- При инициализации скрипт определяет текущую страницу (бой, коллекция, рынок) и активирует соответствующие модули.

### 2. Взаимодействие с DOM
- **Сбор данных**: Использует `document.querySelector`, `document.querySelectorAll` и `MutationObserver` для поиска и отслеживания изменений в элементах игры (карты, жизни, пилюли, цены).
- **Распознавание элементов**: Применяет селекторы CSS и, при необходимости, методы компьютерного зрения (OpenCV.js) или OCR (Tesseract.js) для идентификации карт и текста, если DOM-структура не предоставляет достаточной информации.
- **Инъекция UI**: Создает корневой элемент для React-приложения и монтирует UI-компоненты консультанта в определенные области страницы (например, сбоку от игрового поля).

### 3. Коммуникация
- Отправляет собранные данные в фоновый скрипт для обработки и анализа (`chrome.runtime.sendMessage`).
- Получает команды и данные для отображения от фонового скрипта (`chrome.runtime.onMessage`).
- Управляет отображением и обновлением UI-компонентов на основе полученных данных.

## Фоновый скрипт (Background Service Worker)

### 1. Управление состоянием
- Хранит глобальное состояние приложения (например, настройки пользователя, статус ML-моделей).
- Использует `chrome.storage.local` (обертка Dexie.js) для персистентного хранения данных.

### 2. Координация
- Выступает в роли центрального узла для обмена сообщениями между контентными скриптами, UI (popup) и Web Workers.
- Обрабатывает запросы от контентных скриптов на анализ данных.
- Запускает ML-задачи в Web Workers.

### 3. Долгосрочные задачи
- Использует `chrome.alarms` API для периодического выполнения задач, таких как:
  - Обновление базы данных карт.
  - Мониторинг рыночных цен.
  - Проверка обновлений расширения.

### 4. Управление ML-моделями
- Загружает и инициализирует ML-модели (TensorFlow.js/ONNX.js) при старте.
- Передает задачи на инференс в Web Workers.
- Управляет процессом локального дообучения и обновления моделей.

## UI-компоненты и их интеграция

### 1. Рендеринг на странице
- Контентный скрипт создает `div`-контейнер на странице Urban Rivals.
- React-приложение монтируется в этот контейнер с использованием `ReactDOM.createRoot`.
- Стили CSS (`content_styles.css`) обеспечивают корректное отображение и позиционирование UI без конфликтов со стилями игры.

### 2. Адаптивность
- Используются `ResizeObserver` и медиа-запросы CSS для адаптации UI под разные размеры окна браузера.
- Компоненты React спроектированы с учетом адаптивности (например, использование Flexbox, Grid).

### 3. Всплывающее окно (Popup)
- `popup.html` содержит React-приложение для отображения настроек, общей статистики и статуса расширения.
- Взаимодействует с фоновым скриптом для получения и сохранения настроек.

## Web Workers для ML

### 1. Изоляция вычислений
- Ресурсоемкие задачи (инференс ML-моделей) выполняются в отдельных Web Workers.
- Это предотвращает блокировку основного потока контентного скрипта и интерфейса игры.

### 2. Коммуникация
- Фоновый скрипт передает данные для анализа в Worker (`worker.postMessage`).
- Worker выполняет вычисления и возвращает результаты в фоновый скрипт (`self.postMessage`).

### 3. Загрузка моделей
- Модели TensorFlow.js/ONNX.js загружаются непосредственно в Worker для максимальной изоляции.

## Коммуникация между компонентами

- **Content Script -> Background**: `chrome.runtime.sendMessage({ type: 'GAME_STATE_UPDATE', payload: gameState });`
- **Background -> Content Script**: `chrome.tabs.sendMessage(tabId, { type: 'DISPLAY_RECOMMENDATION', payload: recommendation });`
- **Popup -> Background**: `chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });`
- **Background -> Popup**: Ответ через колбэк `sendResponse` или `chrome.runtime.sendMessage` (если popup слушает).
- **Background <-> Worker**: `worker.postMessage` и `self.onmessage`.

## Извлечение данных из игры

### 1. Стратегии извлечения
- **Приоритет**: Анализ DOM-структуры. Это наиболее надежный и производительный способ.
- **Резерв**: Если DOM не содержит нужной информации (например, карты отображаются через Canvas), использовать:
  - **OCR (Tesseract.js)**: Для распознавания текста на изображениях карт.
  - **Computer Vision (OpenCV.js)**: Для распознавания изображений карт и элементов интерфейса.
- **Отслеживание изменений**: `MutationObserver` для динамического обновления состояния без постоянного опроса DOM.

### 2. Пример извлечения (псевдокод)
```javascript
// content_script.js

function extractGameState() {
  const playerLife = parseInt(document.querySelector('.player-life-selector')?.textContent || '0');
  const opponentLife = parseInt(document.querySelector('.opponent-life-selector')?.textContent || '0');
  const playerCards = Array.from(document.querySelectorAll('.player-card-selector')).map(extractCardData);
  // ... другие данные
  return { playerLife, opponentLife, playerCards, /*...*/ };
}

function extractCardData(cardElement) {
  const cardName = cardElement.querySelector('.card-name-selector')?.textContent;
  // ... извлечение силы, урона, способностей
  // Если нужно CV/OCR:
  // const cardImage = cardElement.querySelector('img');
  // const recognizedData = await runRecognition(cardImage);
  return { name: cardName, /*...*/ };
}

// Наблюдение за изменениями
const observer = new MutationObserver(mutations => {
  const gameState = extractGameState();
  chrome.runtime.sendMessage({ type: 'GAME_STATE_UPDATE', payload: gameState });
});

observer.observe(document.getElementById('game-container'), { childList: true, subtree: true, characterData: true });
```

## Безопасность и разрешения

- Используется `manifest_version: 3`, который повышает безопасность (Service Workers вместо постоянных фоновых страниц, ограничения на выполнение строк кода).
- Разрешения запрашиваются минимально необходимые (`activeTab`, `storage`, `scripting`).
- `host_permissions` ограничены только доменом `urban-rivals.com`.
- Контентные скрипты выполняются в изолированной среде, но имеют доступ к DOM страницы.
- Взаимодействие с DOM должно быть осторожным, чтобы не нарушить работу игры и не создать уязвимостей.

## Развертывание и установка на Windows (локально)

1.  **Сборка расширения**: Использовать Webpack для сборки всех скриптов и ресурсов в папку `dist`.
2.  **Включение режима разработчика**: В Chrome перейти по адресу `chrome://extensions/` и включить "Режим разработчика" (Developer mode).
3.  **Загрузка распакованного расширения**: Нажать кнопку "Загрузить распакованное расширение" (Load unpacked) и выбрать папку `dist`.
4.  **Тестирование**: Расширение будет активно на страницах Urban Rivals. Отладка производится через Chrome DevTools (правый клик на странице -> Inspect, или F12; для Service Worker - на странице `chrome://extensions/` нажать на ссылку Service Worker).
5.  **Обновления**: При внесении изменений в код необходимо пересобрать проект (Webpack) и нажать кнопку обновления (круговая стрелка) для расширения на странице `chrome://extensions/`.
