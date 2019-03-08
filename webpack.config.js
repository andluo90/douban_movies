const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');


module.exports = {
  context: path.resolve(__dirname, 'src'),

  entry: {app:'./index.js'},

  mode:"production",
  devtool: 'inline-source-map',
  

  devServer:{
    contentBase: './dist',
  },
  
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  plugins:[
    new HtmlWebpackPlugin({template: './index.html'}),
    new CleanWebpackPlugin()
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