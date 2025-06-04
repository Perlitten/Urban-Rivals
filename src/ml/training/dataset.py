#!/usr/bin/env python3
"""
Urban Rivals ML Dataset Creation and Preprocessing
Создание и предобработка датасета для обучения ML моделей
"""

import json
import pandas as pd
import numpy as np
import requests
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import sqlite3
from datetime import datetime, timedelta
import time

class UrbanRivalsDataCollector:
    """Сборщик данных об Urban Rivals"""
    
    def __init__(self, output_dir: str = "datasets"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Базовые данные о кланах и их бонусах
        self.clans_data = {
            'All Stars': {'bonus': '+2 Life', 'type': 'life'},
            'Bangers': {'bonus': '+2 Power', 'type': 'power'},
            'Fang Pi Clang': {'bonus': '+2 Damage', 'type': 'damage'},
            'Freaks': {'bonus': '+2 Poison', 'type': 'poison'},
            'Ulu Watu': {'bonus': '+2 Power', 'type': 'power'},
            'Montana': {'bonus': '-12 Opp Attack', 'type': 'attack_reduce'},
            'Uppers': {'bonus': '-10 Opp Attack', 'type': 'attack_reduce'},
            'Sakrohm': {'bonus': '-8 Opp Attack', 'type': 'attack_reduce'},
            'Nightmare': {'bonus': '-2 Opp Life', 'type': 'life_reduce'},
            'Piranas': {'bonus': '-2 Opp Power', 'type': 'power_reduce'},
            'Skeelz': {'bonus': 'Protection: Ability', 'type': 'protection'},
            'Roots': {'bonus': 'Stop: Ability', 'type': 'stop'},
            'GHEIST': {'bonus': 'Stop: Ability', 'type': 'stop'},
            'Pussycats': {'bonus': 'Damage = 1', 'type': 'damage_reduce'},
            'Rescue': {'bonus': '+1 Life per Damage', 'type': 'life_per_damage'},
            'Sentinels': {'bonus': '+8 Attack', 'type': 'attack'},
            'La Junta': {'bonus': '+2 Damage', 'type': 'damage'},
            'Junkz': {'bonus': '+8 Attack', 'type': 'attack'}
        }
    
    def create_cards_database(self) -> pd.DataFrame:
        """Создаёт базу данных карт Urban Rivals"""
        print("🃏 Создание базы данных карт...")
        
        cards_data = []
        
        # Симуляция данных карт (в реальности - парсинг сайта)
        rarities = ['Common', 'Uncommon', 'Rare', 'Legendary']
        
        card_id = 1
        for clan, clan_info in self.clans_data.items():
            # Генерируем 15-25 карт на клан
            for i in range(15, 26):
                rarity = np.random.choice(rarities, p=[0.5, 0.3, 0.15, 0.05])
                
                # Базовые характеристики зависят от редкости
                base_power = {
                    'Common': np.random.randint(4, 7),
                    'Uncommon': np.random.randint(6, 8),
                    'Rare': np.random.randint(7, 9),
                    'Legendary': np.random.randint(8, 10)
                }[rarity]
                
                base_damage = {
                    'Common': np.random.randint(2, 5),
                    'Uncommon': np.random.randint(4, 6),
                    'Rare': np.random.randint(5, 8),
                    'Legendary': np.random.randint(7, 10)
                }[rarity]
                
                # Генерируем характеристики для каждого уровня
                levels_data = {}
                for level in range(1, 6):
                    power_bonus = (level - 1) * np.random.randint(0, 2)
                    damage_bonus = (level - 1) * np.random.randint(0, 2)
                    
                    levels_data[f"power_level_{level}"] = base_power + power_bonus
                    levels_data[f"damage_level_{level}"] = base_damage + damage_bonus
                
                # Способности (только для некоторых карт)
                has_ability = np.random.random() < 0.7
                ability_types = ['+2 Power', '+2 Damage', '+1 Life', 'Stop Opp Ability', 
                               'Protection: Ability', '-2 Opp Power', '-2 Opp Damage']
                ability = np.random.choice(ability_types) if has_ability else None
                
                card_data = {
                    'card_id': f"card_{card_id}",
                    'name': f"{clan} Fighter {i}",
                    'clan': clan,
                    'rarity': rarity,
                    'ability': ability,
                    'ability_unlock_level': np.random.randint(2, 5) if has_ability else None,
                    'release_date': datetime.now() - timedelta(days=np.random.randint(1, 1000)),
                    **levels_data
                }
                
                cards_data.append(card_data)
                card_id += 1
        
        cards_df = pd.DataFrame(cards_data)
        
        # Сохраняем в файлы
        cards_df.to_csv(self.output_dir / "cards_database.csv", index=False)
        cards_df.to_json(self.output_dir / "cards_database.json", orient='records')
        
        print(f"✅ База карт создана: {len(cards_df)} карт, {len(self.clans_data)} кланов")
        return cards_df
    
    def generate_battle_data(self, cards_df: pd.DataFrame, num_battles: int = 10000) -> pd.DataFrame:
        """Генерирует данные о боях для обучения"""
        print(f"⚔️ Генерация {num_battles} боёв...")
        
        battles_data = []
        
        for battle_id in range(num_battles):
            # Случайный выбор 4 карт для каждого игрока
            player_cards = cards_df.sample(4)
            opponent_cards = cards_df.sample(4)
            
            # Симуляция боя
            battle_result = self._simulate_battle(player_cards, opponent_cards)
            
            battle_data = {
                'battle_id': f"battle_{battle_id}",
                'timestamp': datetime.now() - timedelta(minutes=np.random.randint(1, 10000)),
                'player_deck': player_cards['card_id'].tolist(),
                'opponent_deck': opponent_cards['card_id'].tolist(),
                'winner': battle_result['winner'],
                'rounds_data': battle_result['rounds'],
                'final_score': battle_result['final_score'],
                'game_duration': np.random.randint(3, 8)  # минуты
            }
            
            battles_data.append(battle_data)
            
            if battle_id % 1000 == 0:
                print(f"  📊 Обработано {battle_id} боёв...")
        
        battles_df = pd.DataFrame(battles_data)
        battles_df.to_csv(self.output_dir / "battles_database.csv", index=False)
        battles_df.to_json(self.output_dir / "battles_database.json", orient='records')
        
        print(f"✅ База боёв создана: {len(battles_df)} записей")
        return battles_df
    
    def _simulate_battle(self, player_cards: pd.DataFrame, opponent_cards: pd.DataFrame) -> Dict:
        """Симулирует бой между двумя наборами карт"""
        player_life = 12
        opponent_life = 12
        player_pills = 12
        opponent_pills = 12
        
        rounds = []
        
        for round_num in range(1, 5):  # Максимум 4 раунда
            if player_life <= 0 or opponent_life <= 0:
                break
                
            # Выбираем карты для раунда
            if round_num <= len(player_cards) and round_num <= len(opponent_cards):
                player_card = player_cards.iloc[round_num - 1]
                opponent_card = opponent_cards.iloc[round_num - 1]
                
                # Определяем количество пилюль (случайная стратегия)
                player_pills_used = min(np.random.randint(0, 6), player_pills)
                opponent_pills_used = min(np.random.randint(0, 6), opponent_pills)
                
                # Расчёт атаки
                player_attack = player_card[f'power_level_5'] + player_pills_used
                opponent_attack = opponent_card[f'power_level_5'] + opponent_pills_used
                
                # Определяем победителя раунда
                if player_attack > opponent_attack:
                    winner = 'player'
                    damage_dealt = player_card[f'damage_level_5']
                    opponent_life -= damage_dealt
                elif opponent_attack > player_attack:
                    winner = 'opponent'
                    damage_dealt = opponent_card[f'damage_level_5']
                    player_life -= damage_dealt
                else:
                    winner = 'draw'
                    damage_dealt = 0
                
                player_pills -= player_pills_used
                opponent_pills -= opponent_pills_used
                
                round_data = {
                    'round': round_num,
                    'player_card': player_card['card_id'],
                    'opponent_card': opponent_card['card_id'],
                    'player_pills_used': player_pills_used,
                    'opponent_pills_used': opponent_pills_used,
                    'player_attack': player_attack,
                    'opponent_attack': opponent_attack,
                    'winner': winner,
                    'damage_dealt': damage_dealt,
                    'player_life_after': player_life,
                    'opponent_life_after': opponent_life
                }
                
                rounds.append(round_data)
        
        # Определяем победителя боя
        if player_life > opponent_life:
            battle_winner = 'player'
        elif opponent_life > player_life:
            battle_winner = 'opponent'
        else:
            battle_winner = 'draw'
        
        return {
            'winner': battle_winner,
            'rounds': rounds,
            'final_score': {'player': player_life, 'opponent': opponent_life}
        }
    
    def generate_market_data(self, cards_df: pd.DataFrame, days: int = 180) -> pd.DataFrame:
        """Генерирует данные о рынке карт"""
        print(f"💰 Генерация рыночных данных за {days} дней...")
        
        market_data = []
        
        for day in range(days):
            date = datetime.now() - timedelta(days=day)
            
            # Для каждой карты генерируем цены
            for _, card in cards_df.iterrows():
                # Базовая цена зависит от редкости
                base_price = {
                    'Common': np.random.randint(50, 200),
                    'Uncommon': np.random.randint(150, 500),
                    'Rare': np.random.randint(400, 1500),
                    'Legendary': np.random.randint(1000, 5000)
                }[card['rarity']]
                
                # Добавляем случайные колебания
                price_variation = np.random.normal(0, 0.1)
                current_price = int(base_price * (1 + price_variation))
                
                # Количество сделок
                transaction_count = np.random.poisson(5)
                
                market_entry = {
                    'date': date,
                    'card_id': card['card_id'],
                    'card_name': card['name'],
                    'price': max(1, current_price),
                    'transaction_count': transaction_count,
                    'total_volume': current_price * transaction_count
                }
                
                market_data.append(market_entry)
        
        market_df = pd.DataFrame(market_data)
        market_df.to_csv(self.output_dir / "market_data.csv", index=False)
        market_df.to_json(self.output_dir / "market_data.json", orient='records')
        
        print(f"✅ Рыночные данные созданы: {len(market_df)} записей")
        return market_df
    
    def create_training_features(self, cards_df: pd.DataFrame, battles_df: pd.DataFrame) -> Dict:
        """Создаёт признаки для обучения ML моделей"""
        print("🔧 Создание признаков для ML...")
        
        # Признаки для модели выбора карт
        card_features = []
        for _, card in cards_df.iterrows():
            features = {
                'card_id': card['card_id'],
                'clan_encoded': list(self.clans_data.keys()).index(card['clan']),
                'rarity_encoded': ['Common', 'Uncommon', 'Rare', 'Legendary'].index(card['rarity']),
                'max_power': card['power_level_5'],
                'max_damage': card['damage_level_5'],
                'has_ability': 1 if card['ability'] else 0,
                'power_damage_ratio': card['power_level_5'] / max(card['damage_level_5'], 1),
                'total_stats': card['power_level_5'] + card['damage_level_5']
            }
            card_features.append(features)
        
        # Признаки для модели предсказания боёв
        battle_features = []
        for _, battle in battles_df.iterrows():
            if isinstance(battle['rounds_data'], list) and len(battle['rounds_data']) > 0:
                first_round = battle['rounds_data'][0]
                
                features = {
                    'battle_id': battle['battle_id'],
                    'player_total_attack': first_round.get('player_attack', 0),
                    'opponent_total_attack': first_round.get('opponent_attack', 0),
                    'attack_difference': first_round.get('player_attack', 0) - first_round.get('opponent_attack', 0),
                    'player_pills_used': first_round.get('player_pills_used', 0),
                    'opponent_pills_used': first_round.get('opponent_pills_used', 0),
                    'winner': battle['winner']
                }
                battle_features.append(features)
        
        # Сохраняем признаки
        card_features_df = pd.DataFrame(card_features)
        battle_features_df = pd.DataFrame(battle_features)
        
        card_features_df.to_csv(self.output_dir / "card_features.csv", index=False)
        battle_features_df.to_csv(self.output_dir / "battle_features.csv", index=False)
        
        print(f"✅ Признаки созданы: {len(card_features)} карт, {len(battle_features)} боёв")
        
        return {
            'card_features': card_features_df,
            'battle_features': battle_features_df
        }
    
    def export_for_tensorflowjs(self, features: Dict):
        """Экспортирует данные в формате для TensorFlow.js"""
        print("📦 Экспорт для TensorFlow.js...")
        
        # Экспорт в JSON формат для браузера
        export_data = {
            'metadata': {
                'version': '1.0.0',
                'created': datetime.now().isoformat(),
                'cards_count': len(features['card_features']),
                'battles_count': len(features['battle_features']),
                'clans': list(self.clans_data.keys())
            },
            'card_features': features['card_features'].to_dict('records'),
            'battle_features': features['battle_features'].to_dict('records'),
            'clans_data': self.clans_data
        }
        
        # Сохраняем компактный JSON
        with open(self.output_dir / "training_data.json", 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, separators=(',', ':'))
        
        print(f"✅ Данные экспортированы в training_data.json")
        return export_data

def main():
    """Основная функция для создания полного датасета"""
    print("🚀 Начинаем создание датасета Urban Rivals ML...")
    
    collector = UrbanRivalsDataCollector()
    
    # 1. Создаём базу карт
    cards_df = collector.create_cards_database()
    
    # 2. Генерируем данные о боях
    battles_df = collector.generate_battle_data(cards_df, num_battles=10000)
    
    # 3. Генерируем рыночные данные
    market_df = collector.generate_market_data(cards_df, days=180)
    
    # 4. Создаём признаки для ML
    features = collector.create_training_features(cards_df, battles_df)
    
    # 5. Экспортируем для TensorFlow.js
    export_data = collector.export_for_tensorflowjs(features)
    
    print("\n🎉 Датасет успешно создан!")
    print(f"📁 Все файлы сохранены в папке: {collector.output_dir}")
    print(f"🃏 Карт: {len(cards_df)}")
    print(f"⚔️ Боёв: {len(battles_df)}")
    print(f"💰 Рыночных записей: {len(market_df)}")
    
    return export_data

if __name__ == "__main__":
    main() 