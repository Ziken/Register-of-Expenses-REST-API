const env = process.env.NODE_ENV || 'development';

if (env === 'test' || env === 'development') {
    try {
        const config = require('./config.json');
        const configEnv = config[env];

        Object.keys(configEnv).forEach((key) => {
            process.env[key] = configEnv[key];
        });
    } catch (e) {
        console.log('Cannot find /server/config/config.json');
        process.exit(1);
    }


}