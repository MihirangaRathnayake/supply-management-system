/**
 * Database Configuration
 * ======================
 * Handles connections to Oracle (Relational) and MongoDB (NoSQL)
 */

const oracledb = require('oracledb');
const mongoose = require('mongoose');

const dbStatus = {
    oracle: {
        connected: false,
        message: 'Not initialized',
        lastConnectedAt: null,
        lastError: null
    },
    mongo: {
        connected: false,
        message: 'Not initialized',
        lastConnectedAt: null,
        lastError: null
    }
};

const updateStatus = (db, patch) => {
    dbStatus[db] = {
        ...dbStatus[db],
        ...patch
    };
};

// Configure Oracle
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

// Oracle Connection Pool
let oraclePool;

async function initializeOracle() {
    try {
        if (!process.env.ORACLE_CONNECTION_STRING) {
            console.warn('⚠️ Oracle configuration missing. Skipping Oracle connection.');
            updateStatus('oracle', {
                connected: false,
                message: 'Configuration missing',
                lastError: 'Missing ORACLE_CONNECTION_STRING'
            });
            return;
        }

        oraclePool = await oracledb.createPool({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONNECTION_STRING,
            poolMin: parseInt(process.env.ORACLE_POOL_MIN || '2'),
            poolMax: parseInt(process.env.ORACLE_POOL_MAX || '10'),
            poolIncrement: parseInt(process.env.ORACLE_POOL_INCREMENT || '1')
        });

        console.log('✅ Connected to Oracle Database');
        updateStatus('oracle', {
            connected: true,
            message: 'Connected',
            lastConnectedAt: new Date().toISOString(),
            lastError: null
        });
    } catch (err) {
        console.error('❌ Oracle Connection Error:', err);
        updateStatus('oracle', {
            connected: false,
            message: 'Connection failed',
            lastError: err.message
        });
        // Don't exit process, allow app to run with limited functionality or retry
    }
}

async function closeOracle() {
    if (oraclePool) {
        try {
            await oraclePool.close();
            console.log('Oracle connection pool closed');
            updateStatus('oracle', {
                connected: false,
                message: 'Closed',
                lastConnectedAt: null
            });
        } catch (err) {
            console.error('Error closing Oracle pool:', err);
        }
    }
}

// Get Oracle Connection from Pool
async function getOracleConnection() {
    if (!oraclePool) {
        throw new Error('Oracle pool not initialized');
    }
    return await oraclePool.getConnection();
}

// Initialize MongoDB
async function initializeMongo() {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn('⚠️ MongoDB configuration missing. Skipping MongoDB connection.');
            updateStatus('mongo', {
                connected: false,
                message: 'Configuration missing',
                lastError: 'Missing MONGODB_URI'
            });
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            // Mongoose 6+ defaults are good, but explicit options can be added here
        });

        console.log('✅ Connected to MongoDB');
        updateStatus('mongo', {
            connected: true,
            message: 'Connected',
            lastConnectedAt: new Date().toISOString(),
            lastError: null
        });
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        updateStatus('mongo', {
            connected: false,
            message: 'Connection failed',
            lastError: err.message
        });
    }
}

async function closeMongo() {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        updateStatus('mongo', {
            connected: false,
            message: 'Closed',
            lastConnectedAt: null
        });
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
    }
}

// Initialize both databases
async function initializeDatabases() {
    await Promise.all([initializeOracle(), initializeMongo()]);
}

// Close both databases
async function closeDatabases() {
    await Promise.all([closeOracle(), closeMongo()]);
}

function getDbHealth() {
    return {
        oracle: { ...dbStatus.oracle },
        mongo: { ...dbStatus.mongo }
    };
}

module.exports = {
    initializeDatabases,
    closeDatabases,
    getOracleConnection,
    getDbHealth,
    mongoose
};
