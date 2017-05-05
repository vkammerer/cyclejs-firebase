const webpack = require("webpack");

module.exports = {
  devtool: "cheap-module-source-map",
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development" // use 'development' unless process.env.NODE_ENV is defined
    })
  ],
  resolve: {
    extensions: [".js"]
  },
  entry: {
    main: "./src/app.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader"
          }
        ]
      }
    ]
  }
};
