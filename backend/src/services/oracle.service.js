/**
 * Oracle Service Helper
 * =====================
 * Generic methods for Oracle database operations
 */

const { getOracleConnection } = require('../config/database');

class OracleService {
    async executeQuery(sql, params = [], options = {}) {
        let connection;
        try {
            connection = await getOracleConnection();
            const result = await connection.execute(sql, params, {
                autoCommit: true,
                ...options
            });
            return result;
        } catch (error) {
            console.error('Oracle Query Error:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error closing connection:', err);
                }
            }
        }
    }

    async findById(table, idColumn, id) {
        const result = await this.executeQuery(
            `SELECT * FROM ${table} WHERE ${idColumn} = :id`,
            [id]
        );
        return result.rows[0];
    }

    async findAll(table, whereClause = '', params = []) {
        const sql = `SELECT * FROM ${table} ${whereClause}`;
        const result = await this.executeQuery(sql, params);
        return result.rows;
    }
}

module.exports = new OracleService();
