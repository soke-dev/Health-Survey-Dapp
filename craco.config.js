const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "process/browser": require.resolve("process/browser"),
        stream: require.resolve("stream-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        zlib: require.resolve("browserify-zlib"),
        buffer: require.resolve("buffer/"),
        util: require.resolve("util/"),
        assert: require.resolve("assert/"),
      };

      config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
          process: "process/browser",
        }),
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
      ]);

      // Make Webpack treat .mjs files correctly (needed for Magic SDK)
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      });

      return config;
    },
  },
};
