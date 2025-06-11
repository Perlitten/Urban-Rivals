# 🛠️ Urban Rivals ML Consultant - Troubleshooting Guide

## 📋 Пошаговая диагностика расширения

### 1. 🔍 Проверка сборки

```bash
# Убедитесь что проект собран
npm run build

# Проверьте что файлы создались в папке dist/
ls dist/
```

**Должны быть файлы:**
- `background.js` (~13KB)
- `content.js` (~35KB) 
- `ml-worker-battle.js` (~12KB)
- `ml-worker-deck.js` (~2KB)
- `ml-worker-market.js` (~2KB)
- `manifest.json`
- `popup.html`
- `popup.js`
- папка `icons/`

### 2. 🚀 Установка расширения в Chrome

1. **Откройте Chrome**
2. **Перейдите в `chrome://extensions/`**
3. **Включите "Режим разработчика" (Developer mode)** в правом верхнем углу
4. **Нажмите "Загрузить распакованное расширение" (Load unpacked)**
5. **Выберите папку `dist/`** (не корневую папку проекта!)
6. **Убедитесь что расширение появилось в списке**

### 3. 🔍 Проверка ошибок расширения

#### A. Откройте Developer Tools для расширения:
1. В `chrome://extensions/` найдите "Urban Rivals ML Consultant"
2. Нажмите **"Детали"** (Details)
3. Нажмите **"Проверить представления: Service Worker"** (Inspect views: Service Worker)
4. Откроется DevTools для background script

#### B. Проверьте консоль на ошибки:
```javascript
// Должны быть логи вида:
// 📋 [timestamp] [INFO] [BACKGROUND::INIT] Service Worker script starting evaluation
// 📋 [timestamp] [INFO] [BACKGROUND::ML_WORKERS] Starting ML Workers initialization process
```

### 4. ⚠️ Частые проблемы и решения

#### Проблема: "Service Worker registration failed"
**Решение:**
- Убедитесь что `background.js` существует в папке `dist/`
- Проверьте консоль браузера на синтаксические ошибки
- Перезагрузите расширение

#### Проблема: "ML Workers не загружаются"
**Решение:**
```javascript
// В DevTools background script выполните:
console.log('ML Workers status:', mlWorkers);
console.log('Workers loaded:', mlWorkers.isLoaded);
```

#### Проблема: "Content Script не работает"
**Решение:**
1. Перейдите на `https://www.urban-rivals.com/`
2. Откройте DevTools страницы (F12)
3. Проверьте консоль на ошибки
4. Должны быть логи: `📋 [timestamp] [INFO] [CONTENT::MAIN] Starting Urban Rivals ML Consultant initialization`

#### Проблема: "Popup не открывается"
**Решение:**
- Убедитесь что `popup.html` и `popup.js` существуют
- Проверьте `popup.js` на ошибки
- Кликните правой кнопкой на иконку расширения → "Проверить popup"

### 5. 🧪 Тестирование функциональности

#### A. Тест через demo.html:
1. Откройте `demo.html` в браузере
2. Нажмите **"🔍 Найти расширение"**
3. Если найдено - нажмите **"🧪 Тест ML Workers"**
4. Должны пройти все 4 теста успешно

#### B. Ручной тест background script:
```javascript
// В DevTools background script:
chrome.runtime.sendMessage({type: 'PING'}, response => {
  console.log('PING response:', response);
});

// Должен вернуть:
// {pong: true, timestamp: ..., initialized: true, mlLoaded: true}
```

#### C. Тест ML Workers:
```javascript
// В DevTools background script:
chrome.runtime.sendMessage({
  type: 'ANALYZE_BATTLE',
  data: {
    battleState: {
      playerCards: [{id: '1', name: 'Test', power: 7, damage: 5, clan: 'Bangers'}],
      opponentCards: [{id: '2', name: 'Enemy', power: 6, damage: 4, clan: 'All Stars'}],
      playerLife: 14, opponentLife: 14,
      playerPills: 12, opponentPills: 12,
      history: []
    }
  }
}, response => {
  console.log('Battle analysis:', response);
});
```

### 6. 📊 Диагностические команды

#### Проверка состояния расширения:
```javascript
// В любой консоли браузера:
chrome.runtime.sendMessage('EXTENSION_ID_HERE', {type: 'PING'}, response => {
  console.log('Extension status:', response);
});
```

#### Проверка ML системы:
```javascript
chrome.runtime.sendMessage('EXTENSION_ID_HERE', {type: 'GET_ML_STATUS'}, response => {
  console.log('ML status:', response);
});
```

### 7. 🔧 Отладка по шагам

#### Шаг 1: Базовая инициализация
- [ ] Расширение установлено без ошибок
- [ ] Service Worker запускается
- [ ] Background script логирует инициализацию

#### Шаг 2: ML Workers
- [ ] Battle Worker создан
- [ ] Deck Worker создан  
- [ ] Market Worker создан
- [ ] Все модели загружены

#### Шаг 3: Content Script
- [ ] Скрипт загружается на urban-rivals.com
- [ ] Определяется тип страницы
- [ ] UI компоненты инициализируются

#### Шаг 4: Коммуникация
- [ ] PING сообщения работают
- [ ] ML анализ отвечает
- [ ] External messages принимаются

### 8. 🆘 Если ничего не помогает

#### Полная переустановка:
1. Удалите расширение из Chrome
2. Очистите кэш браузера *(обычно не требуется, так как расширение делает это автоматически при установке и запуске)*
3. Пересоберите проект: `npm run build`
4. Установите заново из папки `dist/`

#### Проверка совместимости:
- **Chrome версия:** минимум 88+
- **Manifest V3:** поддерживается
- **Permissions:** все необходимые разрешения даны

#### Сбор диагностической информации:
```javascript
// Выполните в DevTools background script:
const diagnostics = {
  timestamp: Date.now(),
  isInitialized: isInitialized,
  mlWorkers: {
    isLoaded: mlWorkers.isLoaded,
    battleWorker: !!mlWorkers.battleWorker,
    deckWorker: !!mlWorkers.deckWorker,
    marketWorker: !!mlWorkers.marketWorker
  },
  chrome: {
    version: navigator.userAgent,
    permissions: await chrome.permissions.getAll(),
    storage: await chrome.storage.local.get()
  }
};

console.log('🔍 Диагностика расширения:', JSON.stringify(diagnostics, null, 2));
```

### 9. 📝 Логи для отладки

Включите детальное логирование в консоли:
```javascript
// В background script DevTools:
logger.setLogLevel(0); // DEBUG level - все логи
```

### 10. 🎯 Контрольные точки успеха

✅ **Установка успешна если:**
- Расширение видно в `chrome://extensions/`
- Service Worker показывает "активен"
- Нет ошибок в консоли расширения

✅ **ML система работает если:**
- `mlWorkers.isLoaded === true`
- Все 3 worker'a созданы
- Тест анализа боя возвращает рекомендацию

✅ **Интеграция работает если:**
- Content script активен на urban-rivals.com
- External messages принимаются от demo.html
- Popup открывается без ошибок

---

## 🆘 Нужна помощь?

Если проблема не решается, предоставьте:
1. **Скриншот** страницы расширений
2. **Логи из консоли** background script
3. **Результат** диагностической команды
4. **Версию Chrome** и операционной системы 