module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'import'],
    extends: [
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        semi: ['error', 'never'],
        quotes: ['error', 'single'],
        indent: [2, 4],
        'import/extensions': ['error', 'ignorePackages']
    }
}
