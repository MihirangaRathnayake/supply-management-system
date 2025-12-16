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
            const rawMessage = error && error.message ? error.message : 'Oracle query failed';
            const safeMessage = rawMessage.includes('Converting circular structure')
                ? 'Oracle driver failed while handling the connection description. Check connection string/descriptor.'
                : rawMessage;
            console.error('Oracle Query Error:', safeMessage);
            // Re-throw a sanitized error to avoid circular JSON structures from the driver
            const err = new Error(safeMessage);
            err.code = error?.code;
            err.errorNum = error?.errorNum;
            err.offset = error?.offset;
            throw err;
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
