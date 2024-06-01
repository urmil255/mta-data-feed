// config-overrides.js

module.exports = function override(config, env) {
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      process: require.resolve('process/browser'),
    };
  
    return config;
  };
  