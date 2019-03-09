const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');


module.exports = {
  context: path.resolve(__dirname, 'src'),

  entry: {app:'./index.js'},

  devtool: 'inline-source-map',

  devServer: {
    contentBase: './dist',
    hot: true,
    host:'0.0.0.0'
  },

  
  
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  plugins:[
    new HtmlWebpackPlugin({template: './index.html'}),
    new CleanWebpackPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],

  module:{
      rules:[
          {
              test:/\.css/,
              use:['style-loader','css-loader']
          },
          {
              test: /\.(png|svg|jpg|gif)$/,
              use:['file-loader']
          }
      ]
  }
};