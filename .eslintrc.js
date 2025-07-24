module.exports = {
  extends: ['expo', '@react-native'],
  rules: {
    // Disable some rules that might be causing issues
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-native/no-inline-styles': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};