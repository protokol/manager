const webpack = require('webpack');

module.exports = {
  plugins: [
    // Remove all non english word list, to optimize the bundle size
    new webpack.IgnorePlugin(/^\.\/wordlists\/(?!english)/, /bip39\/src$/),
  ],
  module: {
    rules: [
      {
        test: /\.less$/,
        loader: 'less-loader',
        options: {
          lessOptions: {
            modifyVars: {
              // modify theme variable
              'primary-color': '#429EF5',
              'info-color': '#142B4D',
              'success-color': '#66CFDB',
              'processing-color': '#BD66E5',
              'error-color': '#FF545C',
              'highlight-color': '#DEE3F7',
              'warning-color': '#F58542',
              'normal-color': '#E3E3E3',
              white: '#FFF',
              black: '#000',
              'body-background': '#FFF',
              'layout-header-background': '#E3E3E3',
              'layout-body-background': '#E3E3E3',
              // Extend ant design fonts, and place Open Sans as default
              'font-family': `'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
						'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
						'Noto Color Emoji'`,
            },
            javascriptEnabled: true,
          },
        },
      },
    ],
  },
};
