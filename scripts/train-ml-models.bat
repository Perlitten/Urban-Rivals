@echo off
REM Urban Rivals ML Training Pipeline - Windows Version
REM Автоматизированный скрипт для обучения ML моделей

echo 🚀 Urban Rivals ML Training Pipeline
echo ====================================

REM Проверка Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не найден. Установите Python 3.8+
    echo    Скачать: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Создание виртуального окружения если не существует
if not exist "ml_env" (
    echo 📦 Создание виртуального окружения...
    python -m venv ml_env
)

REM Активация виртуального окружения
echo ⚡ Активация виртуального окружения...
call ml_env\Scripts\activate.bat

REM Установка зависимостей
echo 📋 Установка Python зависимостей...
python -m pip install --upgrade pip

REM Создаем requirements.txt если не существует
if not exist "requirements-ml.txt" (
    echo tensorflow==2.15.0> requirements-ml.txt
    echo tensorflowjs==4.15.0>> requirements-ml.txt
    echo numpy==1.24.3>> requirements-ml.txt
    echo pandas==2.0.3>> requirements-ml.txt
    echo scikit-learn==1.3.0>> requirements-ml.txt
    echo joblib==1.3.2>> requirements-ml.txt
    echo requests==2.31.0>> requirements-ml.txt
    echo matplotlib==3.7.2>> requirements-ml.txt
    echo seaborn==0.12.2>> requirements-ml.txt
    echo jupyter==1.0.0>> requirements-ml.txt
)

pip install -r requirements-ml.txt

REM Создание папок
echo 📁 Создание структуры папок...
if not exist "datasets" mkdir datasets
if not exist "trained_models" mkdir trained_models
if not exist "trained_models\tensorflow" mkdir trained_models\tensorflow
if not exist "trained_models\sklearn" mkdir trained_models\sklearn
if not exist "trained_models\tensorflowjs" mkdir trained_models\tensorflowjs
if not exist "models_backup" mkdir models_backup

REM Шаг 1: Создание датасета
echo.
echo 🗂️ Шаг 1: Создание датасета...
echo ===============================
if exist "src\ml\training\dataset.py" (
    python src\ml\training\dataset.py
) else (
    echo ❌ Файл dataset.py не найден
    pause
    exit /b 1
)

REM Проверка создания датасета
if not exist "datasets\training_data.json" (
    echo ❌ Ошибка создания датасета
    pause
    exit /b 1
)

echo ✅ Датасет создан успешно

REM Шаг 2: Обучение моделей
echo.
echo 🤖 Шаг 2: Обучение ML моделей...
echo ===============================
if exist "src\ml\training\train_models.py" (
    python src\ml\training\train_models.py
) else (
    echo ❌ Файл train_models.py не найден
    pause
    exit /b 1
)

REM Проверка обучения моделей
if not exist "trained_models\tensorflowjs\battle_predictor" (
    echo ❌ Ошибка обучения моделей
    pause
    exit /b 1
)

echo ✅ Модели обучены успешно

REM Шаг 4: Копирование моделей в проект
echo.
echo 📦 Интеграция моделей в проект...
echo =======================================

REM Создаем папку для моделей в assets
if not exist "public\assets" mkdir public\assets
if not exist "public\assets\models" mkdir public\assets\models

REM Копируем TensorFlow.js модели
echo 📋 Копирование TensorFlow.js моделей...
xcopy "trained_models\tensorflowjs\*" "public\assets\models\" /E /I /Y >nul

REM Копируем метаданные
copy "trained_models\models_metadata.json" "public\assets\models\" >nul

echo ✅ Модели скопированы в public\assets\models\

REM Шаг 5: Создание бэкапа
echo.
echo 💾 Создание бэкапа моделей...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do if not "%%I"=="" set datetime=%%I
set timestamp=%datetime:~0,8%_%datetime:~8,6%
set backup_name=models_backup_%timestamp%.zip

powershell Compress-Archive -Path "trained_models\*" -DestinationPath "models_backup\%backup_name%"
echo ✅ Бэкап создан: models_backup\%backup_name%

REM Деактивация виртуального окружения
call ml_env\Scripts\deactivate.bat

echo.
echo 🎉 ML Training Pipeline завершён!
echo =================================
echo.
echo 📁 Результаты:
echo   • Датасет: datasets\
echo   • Обученные модели: trained_models\
echo   • Модели для браузера: public\assets\models\
echo   • Бэкап: models_backup\%backup_name%
echo.
echo 🚀 Следующие шаги:
echo   1. Проверьте модели в public\assets\models\
echo   2. Запустите 'npm run build' для сборки
echo   3. Протестируйте ML функции в браузере
echo.
echo 💡 Подсказка: используйте 'npm run dev' для разработки

pause 