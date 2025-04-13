"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql2/promise");
const DB_NAME = 'sudoku';
async function createDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    console.log(`✅ Database '${DB_NAME}' created or already exists.`);
    await connection.end();
}
createDatabase().catch((err) => {
    console.error('❌ Failed to create database:', err);
    process.exit(1);
});
//# sourceMappingURL=create-db.js.map