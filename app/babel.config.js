module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: [__dirname],
          alias: {
            '@': __dirname,
            components: `${__dirname}/components`,
            screens: `${__dirname}/screens`,
            context: `${__dirname}/context`,
            hooks: `${__dirname}/hooks`,
            services: `${__dirname}/services`,
            theme: `${__dirname}/theme`,
            utils: `${__dirname}/utils`,
            assets: `${__dirname}/assets`,
            config: `${__dirname}/config`,
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
    ],
    env: {
      test: {
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      },
    },
  };
};
