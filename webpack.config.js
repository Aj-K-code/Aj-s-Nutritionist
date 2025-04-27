const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/js/index.js',
    output: {
      filename: 'js/bundle.[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html'
      }),
      new CopyPlugin({
        patterns: [
          { from: 'src/css', to: 'css' },
          { from: 'src/images', to: 'images' }
        ]
      }),
      // For local development
      new Dotenv({
        systemvars: true // Load all system environment variables as well
      }),
      // For GitHub Actions build
      new webpack.DefinePlugin({
        'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID),
        'process.env.GOOGLE_API_KEY': JSON.stringify(process.env.GOOGLE_API_KEY),
        'process.env.GOOGLE_SHEET_ID': JSON.stringify(process.env.GOOGLE_SHEET_ID),
        'process.env.GOOGLE_FOLDER_ID': JSON.stringify(process.env.GOOGLE_FOLDER_ID)
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true,
      port: 8080,
      hot: true
    },
    optimization: {
      minimize: isProduction
    }
  };
};
