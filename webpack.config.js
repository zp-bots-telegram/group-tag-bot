const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/handler.ts',
  cache: true,
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.mjs', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()]
  },
  optimization: {
    minimize: false
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: {
    _http_common: 'commonjs2 _http_common'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'prisma/migrations/**/*',
          to: './'
        },
        {
          from: 'node_modules/@prisma/client/generated/schema.prisma',
          to: './schema.prisma'
        },
        {
          from: 'node_modules/@prisma/client/generated/*',
          to: './'
        }
      ]
    })
  ]
};
