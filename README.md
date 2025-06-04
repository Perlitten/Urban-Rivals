# 🤖 Urban Rivals ML Consultant

> AI-powered Chrome extension for Urban Rivals card game - Complete machine learning solution for battle analysis, deck optimization, and strategic guidance.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Chrome](https://img.shields.io/badge/Chrome-88+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.15.0-orange.svg)

## ✨ Features

### 🎯 Battle Assistant
- Real-time battle analysis with ML recommendations
- Card selection and pills optimization
- Win probability calculations
- Alternative strategy suggestions

### 🃏 Deck Builder
- ML-powered deck optimization
- Meta-analysis and synergy improvements
- Card effectiveness predictions

### 💰 Market Analyzer
- Market price analysis and predictions
- Trading opportunity identification
- Investment recommendations

### 📊 Analytics Dashboard
- Detailed gameplay statistics
- Progress tracking and insights
- Performance improvement suggestions

### 🤖 ML Engine
- Local machine learning processing
- Privacy-focused browser-based computation
- Custom trained models for Urban Rivals

## 🚀 Quick Start

### 📋 Installation & Setup

```bash
# 1. Clone and setup
git clone https://github.com/Perlitten/Urban-Rivals.git
cd Urban-Rivals
npm install

# 2. Build the extension
npm run build
```

### 🔧 Install in Chrome

1. **Open Chrome Extensions:** `chrome://extensions/`
2. **Enable Developer Mode** (toggle in top-right)
3. **Click "Load unpacked extension"**
4. **⚠️ ВАЖНО: Выберите папку `dist/`** (не корневую папку проекта!)
5. **Убедитесь что расширение появилось в списке**

### 🧪 Test & Verify

1. **Диагностика:** Откройте `diagnose-extension.html` для автоматической проверки
2. **ML Тестирование:** Откройте `demo.html` для тестирования ML функций  
3. **Live Testing:** Зайдите на `urban-rivals.com` для реального тестирования

### ⚠️ Troubleshooting

Если что-то не работает - см. подробное руководство: [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)

## 🔧 Development

### Commands
```bash
npm run dev          # Development build with watch mode
npm run build        # Production build
npm run test         # Run test suite
npm run lint         # Code linting and formatting
```

### ML Model Training
```bash
# Windows
scripts/train-ml-models.bat

# macOS/Linux  
./scripts/train-ml-models.sh
```

### Project Structure
```
src/
├── background/      # Service Worker & ML coordination
├── content/         # DOM integration & game state extraction  
├── popup/           # Extension popup interface
├── ui/              # React components & main app
│   ├── App.tsx      # Main tabbed interface
│   └── components/  # Feature components
├── ml/              # Machine learning core
│   ├── workers/     # Web Workers for ML processing
│   ├── training/    # Python training scripts
│   └── model-loader.ts # Model management
└── common/          # Shared types & utilities
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript 5.0, Styled Components
- **ML**: TensorFlow.js 4.15, ONNX.js, Web Workers
- **Storage**: IndexedDB (Dexie), Chrome Storage API
- **Build**: Webpack 5, Jest, ESLint, Babel
- **Extension**: Chrome Manifest v3

## 🎮 Usage

1. **Install** the extension in Chrome
2. **Navigate** to urbanrivals.com and log in
3. **Open battles** - the ML assistant activates automatically
4. **Use recommendations** from the popup or injected UI
5. **Customize settings** for personalized experience

## 📊 ML Models

The extension includes several specialized models:

- **Battle Predictor**: Analyzes card matchups and recommends optimal plays
- **Deck Optimizer**: Evaluates deck composition and suggests improvements  
- **Market Analyzer**: Predicts card prices and identifies trading opportunities
- **Meta Tracker**: Monitors game trends and strategy effectiveness

All models run locally in your browser for privacy and speed.

## 🔒 Privacy & Security

- ✅ **Local Processing**: All ML computations run in your browser
- ✅ **No Data Collection**: Game data stays on your device
- ✅ **Offline Capable**: Core features work without internet
- ✅ **Open Source**: Full transparency of data handling

## 📋 System Requirements

- **Browser**: Chrome 88+ (or Chromium-based)
- **Memory**: 2GB RAM minimum
- **Storage**: ~50MB for extension and models
- **Network**: Internet connection for Urban Rivals access

## 🛠️ Troubleshooting

### Extension Issues
- Ensure `dist/manifest.json` exists
- Enable Developer Mode in Chrome Extensions
- Check browser console for errors
- Try reloading the extension

### Urban Rivals Integration
- Verify site is fully loaded
- Disable ad blockers temporarily  
- Check DevTools Console tab
- Ensure you're logged into Urban Rivals

### ML Features
- Run model training scripts
- Verify `public/assets/models/` folder exists
- Rebuild with `npm run build`
- Check browser ML API support

### Performance Tips
- Close unused tabs to free memory
- Restart Chrome if extension becomes unresponsive
- Use incognito mode for testing
- Monitor CPU usage during battles

## 📖 Documentation

Complete documentation available in [`docs/`](docs/):
- [📋 Architecture Overview](docs/architecture.md)
- [⚡ Core Features Guide](docs/core_features.md) 
- [🔧 Technology Stack](docs/technologies.md)
- [📱 UI Design System](docs/ui_mockups.md)
- [🧠 ML Components](docs/ml_component.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🎯 Roadmap

- [ ] Advanced ML model improvements
- [ ] Tournament mode support
- [ ] Multi-language interface
- [ ] Mobile companion app
- [ ] Community features
- [ ] API integrations

## 📄 License

Distributed under the MIT License. See `LICENSE` file for details.

## 🙋‍♂️ Support

- 📧 **Email**: Create an issue for support
- 🐛 **Bug Reports**: [GitHub Issues](../../issues)
- 💡 **Feature Requests**: [Discussions](../../discussions)
- 📖 **Documentation**: See docs/ folder

---

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Compatibility**: Chrome 88+

Built with ❤️ for the Urban Rivals community 