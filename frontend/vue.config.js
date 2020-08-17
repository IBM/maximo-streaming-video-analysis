module.exports = {
  // devServer: {
  //   port: 8081,
  //   proxy: "<url>"
  // },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
          options.prettify = false
          // options.hotReload = false // disables Hot Reload // TODO, isn't working here
          return options
        })
  }
}
