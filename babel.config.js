module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['expo-router/babel', ['module-resolver', {root: ['./'], alias: {"@" : "./"}}], 'react-native-reanimated/plugin'], //reanimated plugin must always be last in array
  };
};
