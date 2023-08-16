module.exports = {
    DB: process.env.DB_NAME,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    HOST: process.env.DB_HOST,
    PORT: 5432,
    dialect: 'postgres',
    pool: {
        min: 0,
        max: 10,
        acquire: 60000,
        idle: 10000
    }
}
