#!/usr/bin/env python3
"""
Urban Rivals ML Model Training
Обучение ML моделей для Urban Rivals консультанта
"""

import tensorflow as tf
import numpy as np
import pandas as pd
import json
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report
import joblib
import tensorflowjs as tfjs
from typing import Dict, Tuple, Any

class UrbanRivalsMLTrainer:
    """Класс для обучения ML моделей Urban Rivals"""
    
    def __init__(self, data_dir: str = "datasets", models_dir: str = "trained_models"):
        self.data_dir = Path(data_dir)
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        
        # Создаём папки для разных типов моделей
        (self.models_dir / "tensorflow").mkdir(exist_ok=True)
        (self.models_dir / "sklearn").mkdir(exist_ok=True)
        (self.models_dir / "tensorflowjs").mkdir(exist_ok=True)
    
    def load_training_data(self) -> Dict[str, pd.DataFrame]:
        """Загружает тренировочные данные"""
        print("📁 Загрузка тренировочных данных...")
        
        try:
            card_features = pd.read_csv(self.data_dir / "card_features.csv")
            battle_features = pd.read_csv(self.data_dir / "battle_features.csv")
            
            print(f"✅ Загружено {len(card_features)} карт и {len(battle_features)} боёв")
            
            return {
                'card_features': card_features,
                'battle_features': battle_features
            }
        except FileNotFoundError as e:
            print(f"❌ Ошибка: файлы с данными не найдены. Сначала запустите dataset.py")
            raise e
    
    def train_battle_predictor(self, battle_features: pd.DataFrame) -> Dict[str, Any]:
        """Обучает модель предсказания результата боя"""
        print("⚔️ Обучение модели предсказания боёв...")
        
        # Подготовка данных
        X = battle_features[['player_total_attack', 'opponent_total_attack', 
                            'attack_difference', 'player_pills_used', 'opponent_pills_used']]
        y = battle_features['winner']
        
        # Кодирование меток
        label_encoder = LabelEncoder()
        y_encoded = label_encoder.fit_transform(y)
        
        # Разделение на train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )
        
        # Нормализация
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Создание TensorFlow модели
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(3, activation='softmax')  # 3 класса: player, opponent, draw
        ])
        
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Обучение
        history = model.fit(
            X_train_scaled, y_train,
            epochs=50,
            batch_size=32,
            validation_split=0.2,
            verbose=1
        )
        
        # Оценка
        y_pred = model.predict(X_test_scaled)
        y_pred_classes = np.argmax(y_pred, axis=1)
        accuracy = accuracy_score(y_test, y_pred_classes)
        
        print(f"✅ Точность модели предсказания боёв: {accuracy:.3f}")
        
        # Сохранение TensorFlow модели
        model.save(self.models_dir / "tensorflow" / "battle_predictor.h5")
        
        # Сохранение скейлера и энкодера
        joblib.dump(scaler, self.models_dir / "sklearn" / "battle_scaler.pkl")
        joblib.dump(label_encoder, self.models_dir / "sklearn" / "battle_label_encoder.pkl")
        
        # Конвертация в TensorFlow.js
        tfjs.converters.save_keras_model(
            model, 
            str(self.models_dir / "tensorflowjs" / "battle_predictor")
        )
        
        return {
            'model': model,
            'scaler': scaler,
            'label_encoder': label_encoder,
            'accuracy': accuracy,
            'history': history
        }
    
    def train_card_recommender(self, card_features: pd.DataFrame, battle_features: pd.DataFrame) -> Dict[str, Any]:
        """Обучает модель рекомендации карт"""
        print("🃏 Обучение модели рекомендации карт...")
        
        # Создаём целевую переменную на основе успешности карт в боях
        card_success_rates = {}
        
        # Анализируем успешность каждой карты
        for _, battle in battle_features.iterrows():
            winner = battle['winner']
            if winner in ['player', 'opponent']:
                # Здесь упрощённая логика - в реальности нужны данные о конкретных картах в боях
                attack_diff = battle['attack_difference']
                success_score = 1 if attack_diff > 0 else 0
                
                # Псевдо-связывание с картами (в реальности нужна более сложная логика)
                card_id = f"card_{np.random.randint(1, len(card_features) + 1)}"
                if card_id not in card_success_rates:
                    card_success_rates[card_id] = []
                card_success_rates[card_id].append(success_score)
        
        # Вычисляем средние показатели успешности
        for card_id in card_success_rates:
            card_success_rates[card_id] = np.mean(card_success_rates[card_id])
        
        # Подготовка данных для обучения
        X = card_features[['clan_encoded', 'rarity_encoded', 'max_power', 'max_damage', 
                          'has_ability', 'power_damage_ratio', 'total_stats']]
        
        # Создаём целевую переменную (рейтинг карты)
        y = []
        for _, card in card_features.iterrows():
            card_id = card['card_id']
            success_rate = card_success_rates.get(card_id, 0.5)  # По умолчанию 0.5
            # Комбинируем успешность и статистики
            rating = success_rate * 0.7 + (card['total_stats'] / 20) * 0.3
            y.append(rating)
        
        y = np.array(y)
        
        # Разделение на train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Нормализация
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Создание TensorFlow модели
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')  # Рейтинг от 0 до 1
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        # Обучение
        history = model.fit(
            X_train_scaled, y_train,
            epochs=100,
            batch_size=32,
            validation_split=0.2,
            verbose=1
        )
        
        # Оценка
        y_pred = model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        
        print(f"✅ MSE модели рекомендации карт: {mse:.4f}")
        
        # Сохранение модели
        model.save(self.models_dir / "tensorflow" / "card_recommender.h5")
        joblib.dump(scaler, self.models_dir / "sklearn" / "card_scaler.pkl")
        
        # Конвертация в TensorFlow.js
        tfjs.converters.save_keras_model(
            model, 
            str(self.models_dir / "tensorflowjs" / "card_recommender")
        )
        
        return {
            'model': model,
            'scaler': scaler,
            'mse': mse,
            'history': history
        }
    
    def train_strategy_classifier(self, card_features: pd.DataFrame) -> Dict[str, Any]:
        """Обучает классификатор стратегий колод"""
        print("🎯 Обучение классификатора стратегий...")
        
        # Создаём стратегии на основе характеристик карт
        strategies = []
        strategy_labels = []
        
        # Генерируем случайные колоды и определяем их стратегии
        for _ in range(5000):
            # Случайная колода из 4 карт
            deck = card_features.sample(4)
            
            avg_power = deck['max_power'].mean()
            avg_damage = deck['max_damage'].mean()
            total_stats = deck['total_stats'].sum()
            clan_diversity = deck['clan_encoded'].nunique()
            ability_count = deck['has_ability'].sum()
            
            # Определяем стратегию
            if avg_power > 7.5:
                strategy = 'power_focused'
            elif avg_damage > 6:
                strategy = 'damage_focused'
            elif clan_diversity <= 2:
                strategy = 'mono_clan'
            elif ability_count >= 3:
                strategy = 'ability_focused'
            else:
                strategy = 'balanced'
            
            strategies.append([avg_power, avg_damage, total_stats, clan_diversity, ability_count])
            strategy_labels.append(strategy)
        
        X = np.array(strategies)
        y = np.array(strategy_labels)
        
        # Кодирование меток
        label_encoder = LabelEncoder()
        y_encoded = label_encoder.fit_transform(y)
        
        # Разделение на train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )
        
        # Нормализация
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Random Forest для сравнения
        rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        rf_model.fit(X_train_scaled, y_train)
        rf_accuracy = rf_model.score(X_test_scaled, y_test)
        
        # Создание TensorFlow модели
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(len(label_encoder.classes_), activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Обучение
        history = model.fit(
            X_train_scaled, y_train,
            epochs=50,
            batch_size=32,
            validation_split=0.2,
            verbose=1
        )
        
        # Оценка
        tf_accuracy = model.evaluate(X_test_scaled, y_test, verbose=0)[1]
        
        print(f"✅ Точность Random Forest: {rf_accuracy:.3f}")
        print(f"✅ Точность TensorFlow модели: {tf_accuracy:.3f}")
        
        # Сохранение моделей
        model.save(self.models_dir / "tensorflow" / "strategy_classifier.h5")
        joblib.dump(rf_model, self.models_dir / "sklearn" / "strategy_rf.pkl")
        joblib.dump(scaler, self.models_dir / "sklearn" / "strategy_scaler.pkl")
        joblib.dump(label_encoder, self.models_dir / "sklearn" / "strategy_label_encoder.pkl")
        
        # Конвертация в TensorFlow.js
        tfjs.converters.save_keras_model(
            model, 
            str(self.models_dir / "tensorflowjs" / "strategy_classifier")
        )
        
        return {
            'tf_model': model,
            'rf_model': rf_model,
            'scaler': scaler,
            'label_encoder': label_encoder,
            'tf_accuracy': tf_accuracy,
            'rf_accuracy': rf_accuracy
        }
    
    def create_model_metadata(self, models_info: Dict[str, Any]):
        """Создаёт метаданные обученных моделей"""
        print("📋 Создание метаданных моделей...")
        
        metadata = {
            'version': '1.0.0',
            'created': pd.Timestamp.now().isoformat(),
            'models': {
                'battle_predictor': {
                    'type': 'classification',
                    'accuracy': models_info['battle']['accuracy'],
                    'input_features': ['player_total_attack', 'opponent_total_attack', 
                                     'attack_difference', 'player_pills_used', 'opponent_pills_used'],
                    'output_classes': ['player', 'opponent', 'draw'],
                    'description': 'Предсказывает победителя боя на основе характеристик карт и пилюль'
                },
                'card_recommender': {
                    'type': 'regression',
                    'mse': models_info['card']['mse'],
                    'input_features': ['clan_encoded', 'rarity_encoded', 'max_power', 'max_damage', 
                                     'has_ability', 'power_damage_ratio', 'total_stats'],
                    'output_range': [0, 1],
                    'description': 'Оценивает полезность карты в текущей игровой ситуации'
                },
                'strategy_classifier': {
                    'type': 'classification',
                    'accuracy': models_info['strategy']['tf_accuracy'],
                    'input_features': ['avg_power', 'avg_damage', 'total_stats', 'clan_diversity', 'ability_count'],
                    'output_classes': ['power_focused', 'damage_focused', 'mono_clan', 'ability_focused', 'balanced'],
                    'description': 'Классифицирует стратегию колоды'
                }
            },
            'usage_instructions': {
                'tensorflow_js': 'Используйте модели из папки tensorflowjs/ в браузере',
                'preprocessing': 'Нормализуйте входные данные с помощью соответствующих скейлеров',
                'inference': 'Загрузите модель через tf.loadLayersModel() в JavaScript'
            }
        }
        
        # Сохраняем метаданные
        with open(self.models_dir / "models_metadata.json", 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        print("✅ Метаданные сохранены в models_metadata.json")
        return metadata
    
    def train_all_models(self):
        """Обучает все модели"""
        print("🚀 Начинаем обучение всех ML моделей...")
        
        # Загружаем данные
        data = self.load_training_data()
        
        models_info = {}
        
        # 1. Обучаем предиктор боёв
        battle_model = self.train_battle_predictor(data['battle_features'])
        models_info['battle'] = battle_model
        
        # 2. Обучаем рекомендатель карт
        card_model = self.train_card_recommender(data['card_features'], data['battle_features'])
        models_info['card'] = card_model
        
        # 3. Обучаем классификатор стратегий
        strategy_model = self.train_strategy_classifier(data['card_features'])
        models_info['strategy'] = strategy_model
        
        # 4. Создаём метаданные
        metadata = self.create_model_metadata(models_info)
        
        print("\n🎉 Все модели успешно обучены!")
        print(f"📁 Модели сохранены в: {self.models_dir}")
        print("\n📊 Результаты обучения:")
        print(f"  ⚔️ Предиктор боёв: {battle_model['accuracy']:.3f} точность")
        print(f"  🃏 Рекомендатель карт: {card_model['mse']:.4f} MSE")
        print(f"  🎯 Классификатор стратегий: {strategy_model['tf_accuracy']:.3f} точность")
        
        return models_info, metadata

def main():
    """Основная функция обучения"""
    print("🤖 Urban Rivals ML Training Pipeline")
    print("=====================================")
    
    trainer = UrbanRivalsMLTrainer()
    models_info, metadata = trainer.train_all_models()
    
    print("\n✅ Обучение завершено!")
    print("📦 Готовые модели для TensorFlow.js находятся в папке trained_models/tensorflowjs/")
    print("🔧 Метаданные моделей: trained_models/models_metadata.json")
    
    return models_info, metadata

if __name__ == "__main__":
    main() 