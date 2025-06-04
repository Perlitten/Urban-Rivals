#!/bin/bash

# Urban Rivals ML Training Pipeline
# Автоматизированный скрипт для обучения ML моделей

set -e  # Остановка при ошибке

echo "🚀 Urban Rivals ML Training Pipeline"
echo "===================================="

# Проверка Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 не найден. Установите Python 3.8+"
    echo "   Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "   macOS: brew install python3"
    exit 1
fi

# Создание виртуального окружения если не существует
if [ ! -d "ml_env" ]; then
    echo "📦 Создание виртуального окружения..."
    python3 -m venv ml_env
fi

# Активация виртуального окружения
echo "⚡ Активация виртуального окружения..."
source ml_env/bin/activate || source ml_env/Scripts/activate

# Установка зависимостей
echo "📋 Установка Python зависимостей..."
pip install --upgrade pip

# Создаем requirements.txt если не существует
if [ ! -f "requirements-ml.txt" ]; then
    cat > requirements-ml.txt << EOF
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
EOF
fi

pip install -r requirements-ml.txt

# Создание папок
echo "📁 Создание структуры папок..."
mkdir -p datasets
mkdir -p trained_models/tensorflow
mkdir -p trained_models/sklearn
mkdir -p trained_models/tensorflowjs
mkdir -p models_backup

# Шаг 1: Создание датасета
echo ""
echo "🗂️ Шаг 1: Создание датасета..."
echo "==============================="
if [ -f "src/ml/training/dataset.py" ]; then
    python3 src/ml/training/dataset.py
else
    echo "❌ Файл dataset.py не найден"
    exit 1
fi

# Проверка создания датасета
if [ ! -f "datasets/training_data.json" ]; then
    echo "❌ Ошибка создания датасета"
    exit 1
fi

echo "✅ Датасет создан успешно"

# Шаг 2: Обучение моделей
echo ""
echo "🤖 Шаг 2: Обучение ML моделей..."
echo "==============================="
if [ -f "src/ml/training/train_models.py" ]; then
    python3 src/ml/training/train_models.py
else
    echo "❌ Файл train_models.py не найден"
    exit 1
fi

# Проверка обучения моделей
if [ ! -d "trained_models/tensorflowjs/battle_predictor" ]; then
    echo "❌ Ошибка обучения моделей"
    exit 1
fi

echo "✅ Модели обучены успешно"

# Шаг 3: Копирование моделей в проект
echo ""
echo "📦 Интеграция моделей в проект..."
echo "======================================="

# Создаем папку для моделей в assets
mkdir -p public/assets/models

# Копируем TensorFlow.js модели
echo "📋 Копирование TensorFlow.js моделей..."
cp -r trained_models/tensorflowjs/* public/assets/models/

# Копируем метаданные
cp trained_models/models_metadata.json public/assets/models/

echo "✅ Модели скопированы в public/assets/models/"

# Шаг 4: Создание бэкапа
echo ""
echo "💾 Создание бэкапа моделей..."
timestamp=$(date +"%Y%m%d_%H%M%S")
backup_name="models_backup_${timestamp}.tar.gz"

tar -czf "models_backup/${backup_name}" trained_models/
echo "✅ Бэкап создан: models_backup/${backup_name}"

# Деактивация виртуального окружения
deactivate 2>/dev/null || true

echo ""
echo "🎉 ML Training Pipeline завершён!"
echo "================================="
echo ""
echo "📁 Результаты:"
echo "  • Датасет: datasets/"
echo "  • Обученные модели: trained_models/"
echo "  • Модели для браузера: public/assets/models/"
echo "  • Бэкап: models_backup/${backup_name}"
echo ""
echo "🚀 Следующие шаги:"
echo "  1. Проверьте модели в public/assets/models/"
echo "  2. Запустите 'npm run build' для сборки"
echo "  3. Протестируйте ML функции в браузере"
echo ""
echo "💡 Подсказка: используйте 'npm run dev' для разработки" 