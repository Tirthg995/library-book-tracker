const globals = {
    console: 'readonly',
    process: 'readonly',
    require: 'readonly',
    module: 'readonly',
    __dirname: 'readonly',
    fetch: 'readonly'
};

module.exports = [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals
        },
        rules: {
            'no-unused-vars': 'error',
            'no-undef': 'error'
        }
    },
    {
        ignores: [
            'node_modules/**'
        ]
    }
];
