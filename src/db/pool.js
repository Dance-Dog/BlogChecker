const { createPool } = require("promise-mysql");
const { connectionSettings } = require("../config");

const pool = createPool(connectionSettings);

module.exports = pool;
