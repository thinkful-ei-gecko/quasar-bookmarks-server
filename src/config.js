// exports object that contains default values for PORT and NODE_ENV
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};