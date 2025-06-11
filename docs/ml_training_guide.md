# Руководство по предобучению ML моделей Urban Rivals

## 🎯 Обзор процесса предобучения

Данное руководство описывает полный цикл создания и обучения ML моделей для расширения Urban Rivals ML Consultant.

## 📋 Требования

### Системные требования
- **Python 3.8+** с pip
- **Node.js 20+** с npm
- **4+ ГБ RAM** для обучения моделей
- **2+ ГБ свободного места** на диске

### Python библиотеки
```
tensorflow==2.15.0
tensorflowjs==4.15.0
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0
joblib==1.3.2
requests==2.31.0
matplotlib==3.7.2
seaborn==0.12.2
jupyter==1.0.0
```

## 🚀 Быстрый старт

### Быстрый запуск
```bash
npm run train:ml
```

## 📊 Детальный процесс обучения

### Этап 1: Сбор и подготовка данных

#### 1.1 Источники данных Urban Rivals
- **Официальный сайт**: https://www.urban-rivals.com/
- **База карт**: ~2000+ карт с характеристиками
- **История боёв**: Пользовательские данные
- **Рыночные данные**: Цены и транзакции

#### 1.2 Структура данных

```python
# Карты
{
    "card_id": "string",
    "name": "string", 
    "clan": "string",
    "rarity": "Common|Uncommon|Rare|Legendary",
    "power_level_5": "number",
    "damage_level_5": "number",
    "ability": "string|null"
}

# Бои
{
    "battle_id": "string",
    "player_deck": ["card_id_1", ...],
    "opponent_deck": ["card_id_1", ...], 
    "winner": "player|opponent|draw",
    "rounds_data": [...]
}
```

#### 1.3 Запуск сбора данных
```bash
python src/ml/training/dataset.py
```

**Результат**: 
- `datasets/cards_database.csv` - База карт
- `datasets/battles_database.csv` - История боёв  
- `datasets/market_data.csv` - Рыночные данные
- `datasets/training_data.json` - Обработанные признаки

### Этап 2: Обучение моделей

#### 2.1 Модель предсказания боёв
**Архитектура**: Dense Neural Network
**Входные данные**: 
- Сила атаки игрока/противника
- Разность атак
- Количество пилюль

**Выходные данные**: Вероятности [игрок, противник, ничья]

```python
model = tf.keras.Sequential([
    tf.layers.dense(64, activation='relu'),
    tf.layers.dropout(0.2),
    tf.layers.dense(32, activation='relu'), 
    tf.layers.dense(3, activation='softmax')
])
```

#### 2.2 Модель рекомендации карт
**Архитектура**: Deep Neural Network
**Входные данные**:
- Кодированный клан
- Кодированная редкость
- Сила, урон, способности

**Выходные данные**: Рейтинг полезности (0-1)

```python
model = tf.keras.Sequential([
    tf.layers.dense(128, activation='relu'),
    tf.layers.dropout(0.3),
    tf.layers.dense(64, activation='relu'),
    tf.layers.dense(1, activation='sigmoid')
])
```

#### 2.3 Классификатор стратегий
**Архитектура**: Dense Neural Network
**Входные данные**:
- Средняя сила/урон колоды
- Разнообразие кланов
- Количество способностей

**Выходные данные**: Тип стратегии [power_focused, damage_focused, mono_clan, ability_focused, balanced]

#### 2.4 Запуск обучения
```bash
python src/ml/training/train_models.py
```

**Результат**:
- `trained_models/tensorflow/` - H5 модели
- `trained_models/sklearn/` - Scalers и encoders
- `trained_models/tensorflowjs/` - Модели для браузера

### Этап 3: Конвертация в TensorFlow.js

Модели автоматически конвертируются в формат TensorFlow.js:

```python
import tensorflowjs as tfjs

tfjs.converters.save_keras_model(
    model, 
    "trained_models/tensorflowjs/model_name"
)
```

**Результат**:
- `model.json` - Архитектура модели
- `group1-shard1of1.bin` - Веса модели

### Этап 4: Интеграция в расширение

#### 4.1 Загрузка моделей в браузере

```typescript
import * as tf from '@tensorflow/tfjs';

// Загрузка модели
const model = await tf.loadLayersModel('/assets/models/battle_predictor/model.json');

// Предсказание
const prediction = model.predict(inputTensor) as tf.Tensor;
const result = await prediction.data();
```

#### 4.2 Предобработка данных

```typescript
// Нормализация признаков
function normalizeFeatures(features: number[], modelName: string): number[] {
    const scalerInfo = this.scalerData[modelName];
    return features.map((feature, index) => {
        const mean = scalerInfo.mean[index];
        const std = scalerInfo.std[index];
        return (feature - mean) / std;
    });
}
```

## 🔧 Настройка и оптимизация

### Гиперпараметры моделей

```python
# Battle Predictor
BATTLE_EPOCHS = 50
BATTLE_BATCH_SIZE = 32
BATTLE_LEARNING_RATE = 0.001

# Card Recommender  
CARD_EPOCHS = 100
CARD_BATCH_SIZE = 32
CARD_LEARNING_RATE = 0.0005

# Strategy Classifier
STRATEGY_EPOCHS = 50
STRATEGY_BATCH_SIZE = 32
STRATEGY_LEARNING_RATE = 0.001
```

### Метрики качества

- **Battle Predictor**: Accuracy > 0.80
- **Card Recommender**: MSE < 0.05
- **Strategy Classifier**: Accuracy > 0.75

### Оптимизация размера моделей

```python
# Квантизация для уменьшения размера
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
quantized_model = converter.convert()
```

## 📈 Мониторинг и валидация

### Кросс-валидация
```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5)
print(f"CV Accuracy: {scores.mean():.3f} (+/- {scores.std() * 2:.3f})")
```

### A/B тестирование
- Сравнение алгоритмических vs ML предсказаний
- Метрики: точность, время отклика, удовлетворённость пользователей

### Логирование производительности
```typescript
// Замер времени инференса
const startTime = performance.now();
const prediction = await model.predict(input);
const inferenceTime = performance.now() - startTime;

console.log(`Inference time: ${inferenceTime.toFixed(2)}ms`);
```

## 🔄 Переобучение и обновление

### Инкрементальное обучение
1. Сбор новых данных боёв
2. Валидация качества данных
3. Переобучение моделей на расширенном датасете
4. A/B тест новых vs старых моделей
5. Постепенное развёртывание

### Автоматизация обновлений
```python
# Скрипт автоматического переобучения
def retrain_models():
    # Проверка наличия новых данных
    if check_new_data():
        # Загрузка и валидация данных
        data = load_and_validate_data()
        
        # Переобучение
        new_models = train_models(data)
        
        # Валидация качества
        if validate_model_quality(new_models):
            deploy_models(new_models)
```

## 🚨 Troubleshooting

### Частые проблемы

#### Низкая точность модели
- **Причина**: Недостаточно обучающих данных
- **Решение**: Увеличить размер датасета, data augmentation

#### Переобучение (overfitting)
- **Причина**: Слишком сложная модель
- **Решение**: Добавить dropout, уменьшить количество параметров

#### Медленная инференция
- **Причина**: Большой размер модели
- **Решение**: Квантизация, pruning, distillation

#### Ошибки загрузки в браузере
- **Причина**: CORS, неправильные пути
- **Решение**: Настройка веб-сервера, проверка путей к моделям

### Отладка

```typescript
// Включение отладки TensorFlow.js
tf.env().set('DEBUG', true);

// Проверка доступности WebGL
console.log('WebGL support:', tf.env().get('WEBGL_VERSION'));

// Мониторинг памяти
console.log('Memory info:', tf.memory());
```

## 📚 Дополнительные ресурсы

### Документация
- [TensorFlow.js Guide](https://www.tensorflow.org/js/guide)
- [Urban Rivals Wiki](https://urbanrivals.fandom.com/)
- [Scikit-learn Documentation](https://scikit-learn.org/)

### Примеры кода
- `src/ml/training/` - Скрипты обучения
- `src/ml/model-loader.ts` - Загрузка моделей в браузере
- `src/ml/workers/` - ML workers для расширения

### Поддержка
- GitHub Issues для багов
- Discord сообщество для вопросов
- Email поддержка для критических проблем

---

## ✅ Чеклист готовности к production

- [ ] Модели обучены с приемлемой точностью
- [ ] Конвертация в TensorFlow.js прошла успешно
- [ ] Размер моделей оптимизирован (<5MB каждая)
- [ ] Время инференса <100ms
- [ ] Тесты покрывают основные сценарии
- [ ] Мониторинг и логирование настроены
- [ ] A/B тестирование запланировано
- [ ] Документация обновлена 