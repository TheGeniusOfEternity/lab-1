const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './main.ts',
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      favicon: path.resolve(__dirname, './src/assets/favicon.gif'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource', // copies image files to dist and resolves URLs
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource', // copies font files to dist and resolves URLs
      },
      {
        test: /\.s[ac]ss$/i, // match .scss and .sass files
        use: [
          'style-loader', // inject CSS into DOM
          'css-loader', // interprets CSS @import and url()
          'sass-loader', // compiles Sass to CSS
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  devtool: 'source-map',
  devServer: {
    static: './',
    port: 9000,
  },
};
