/**
 * Auth Service
 * ============
 * Business logic for authentication
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getOracleConnection } = require('../config/database');
const { ApiError } = require('../middleware/error.middleware');

class AuthService {
    // Generate Access and Refresh Tokens
    generateTokens(user) {
        const accessToken = jwt.sign(
            {
                userId: user.USER_ID,
                email: user.EMAIL,
                role: user.ROLE,
                firstName: user.FIRST_NAME,
                lastName: user.LAST_NAME
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { userId: user.USER_ID },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        return { accessToken, refreshToken };
    }

    // Register new user
    async register(userData) {
        let connection;
        try {
            try {
                connection = await getOracleConnection();
            } catch (dbError) {
                console.warn('⚠️ Database not available, using mock registration for development');
                // Mock registration
                const userId = uuidv4();
                return {
                    userId,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: userData.role || 'VIEWER'
                };
            }

            // Check if user exists
            const checkResult = await connection.execute(
                `SELECT COUNT(*) as count FROM USERS WHERE EMAIL = :email`,
                [userData.email]
            );

            if (checkResult.rows[0].COUNT > 0) {
                throw ApiError.conflict('Email already registered');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(userData.password, salt);
            const userId = uuidv4();

            // Insert user
            await connection.execute(
                `INSERT INTO USERS (
          USER_ID, EMAIL, PASSWORD_HASH, FIRST_NAME, LAST_NAME, ROLE
        ) VALUES (
          :id, :email, :hash, :firstName, :lastName, :role
        )`,
                {
                    id: userId,
                    email: userData.email,
                    hash: passwordHash,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: userData.role || 'VIEWER'
                },
                { autoCommit: true }
            );

            return {
                userId,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role || 'VIEWER'
            };

        } catch (error) {
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

    // Login user
    async login(email, password) {
        let connection;
        try {
            try {
                connection = await getOracleConnection();
            } catch (dbError) {
                console.warn('⚠️ Database not available, using mock auth for development');
                // Mock login for development
                if (email === 'admin@example.com' && password === 'password') {
                    const mockUser = {
                        USER_ID: 'mock-admin-id',
                        EMAIL: 'admin@example.com',
                        FIRST_NAME: 'Admin',
                        LAST_NAME: 'User',
                        ROLE: 'ADMIN'
                    };
                    const tokens = this.generateTokens(mockUser);
                    return {
                        user: {
                            id: mockUser.USER_ID,
                            email: mockUser.EMAIL,
                            firstName: mockUser.FIRST_NAME,
                            lastName: mockUser.LAST_NAME,
                            role: mockUser.ROLE
                        },
                        ...tokens
                    };
                }
                throw ApiError.unauthorized('Invalid credentials (Mock)');
            }

            // Get user
            const result = await connection.execute(
                `SELECT * FROM USERS WHERE EMAIL = :email AND STATUS = 'ACTIVE'`,
                [email]
            );

            if (result.rows.length === 0) {
                throw ApiError.unauthorized('Invalid credentials');
            }

            const user = result.rows[0];

            // Verify password
            const isMatch = await bcrypt.compare(password, user.PASSWORD_HASH);
            if (!isMatch) {
                throw ApiError.unauthorized('Invalid credentials');
            }

            // Update last login
            await connection.execute(
                `UPDATE USERS SET LAST_LOGIN = CURRENT_TIMESTAMP WHERE USER_ID = :id`,
                [user.USER_ID],
                { autoCommit: true }
            );

            // Generate tokens
            const tokens = this.generateTokens(user);

            // Store refresh token
            // In a real app, you'd hash this and store in DB

            return {
                user: {
                    id: user.USER_ID,
                    email: user.EMAIL,
                    firstName: user.FIRST_NAME,
                    lastName: user.LAST_NAME,
                    role: user.ROLE
                },
                ...tokens
            };

        } catch (error) {
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

    // Refresh token
    async refreshToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

            let connection;
            try {
                connection = await getOracleConnection();

                const result = await connection.execute(
                    `SELECT * FROM USERS WHERE USER_ID = :id AND STATUS = 'ACTIVE'`,
                    [decoded.userId]
                );

                if (result.rows.length === 0) {
                    throw ApiError.unauthorized('User not found or inactive');
                }

                const user = result.rows[0];
                const tokens = this.generateTokens(user);

                return tokens;

            } finally {
                if (connection) await connection.close();
            }
        } catch (error) {
            throw ApiError.unauthorized('Invalid refresh token');
        }
    }
}

module.exports = new AuthService();
