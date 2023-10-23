module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['expo-router/babel', 'react-native-reanimated/plugin'], //reanimated plugin must always be last in array
  };
};
