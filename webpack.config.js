const VueLoaderPlugin = require('vue-loader/lib/plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  output: {
    filename: 'bundle.js'
  },
  devtool: isDevelopment && 'eval-source-map',
  mode: process.env.NODE_ENV,
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: file => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        )
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false,
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]'
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              prependData: `
                @import "./src/assets/styles/variables.scss";
                @import "./src/assets/styles/mixins.scss";
              `,
            },
          },
        ]
      },
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
};
