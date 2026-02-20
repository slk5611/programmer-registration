module.exports = {
    apps: [
        {
            name: 'programmer-registration-backend',
            script: 'server/index.js',
            cwd: './',
            env: {
                NODE_ENV: 'development',
                PORT: 5000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000
            }
        }
    ]
};
