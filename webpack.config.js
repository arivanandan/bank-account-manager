let webpack = require('webpack')

module.exports = {
  entry: [
    'script!jquery/dist/jquery.min.js',
    'script!foundation-sites/dist/js/foundation.min.js',
    './app/app.jsx'
  ],
  externals: {
    jquery: 'jQuery'
  },
  plugins: [
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery'
    })
  ],
  output: {
    path: __dirname,
    filename: './public/bundle.js'
  },
  resolve: {
    root: __dirname,
    alias: {
      Main: 'app/components/main.jsx',
      TMain: 'app/components/tmain.jsx',
      Nav: 'app/components/nav.jsx',
      TransactionList: 'app/components/transaction_list.jsx',
      Transaction: 'app/components/transaction.jsx',
      Upload: 'app/components/upload.jsx',
      Tdetail: 'app/components/tdetail.jsx',
      AddTransaction: 'app/components/addtransaction.jsx',
      applicationStyles: 'app/styles/app.scss'
    },
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        loader: 'babel',
        /* query: {
          presets: ['react', 'es2015', 'stage-0']
        }, */
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/
      }
    ]
  },
  devtool: 'cheap-module-eval-source-map'
}
