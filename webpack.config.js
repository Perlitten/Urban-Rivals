const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      background: './src/background/index.ts',
      content: './src/content/index.ts',
      popup: './src/popup/index.tsx',
      'ml-worker-battle': './src/ml/workers/battleWorker.ts',
      'ml-worker-deck': './src/ml/workers/deckWorker.ts',
      'ml-worker-market': './src/ml/workers/marketWorker.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.build.json'
            }
          },
          exclude: /node_modules/
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource'
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/common': path.resolve(__dirname, 'src/common'),
        '@/ui': path.resolve(__dirname, 'src/ui'),
        '@/ml': path.resolve(__dirname, 'src/ml'),
        '@/background': path.resolve(__dirname, 'src/background'),
        '@/content': path.resolve(__dirname, 'src/content'),
        '@/popup': path.resolve(__dirname, 'src/popup')
      }
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/popup.html']
            }
          }
        ]
      }),
      new HtmlWebpackPlugin({
        template: './public/popup.html',
        filename: 'popup.html',
        chunks: ['popup']
      })
    ],
    devtool: isProduction ? false : 'cheap-module-source-map',
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
        maxSize: 200000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 200000
          }
        }
      }
    },
    performance: {
      maxEntrypointSize: 300000,
      maxAssetSize: 300000,
      hints: false
    },
    mode: argv.mode || 'development'
  };
}; 