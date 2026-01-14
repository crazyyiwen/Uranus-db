

const env: any = {
    mongo_uri: process.env.MONGO_URI || 'mongodb://localhost:27017/uranusdb',
    port: process.env.PORT || 3316,
    cors_origin: process.env.CORS_ORIGIN || '*',
}