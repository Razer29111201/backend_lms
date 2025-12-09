// scripts/hash-existing-passwords.js
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Tạo connection trực tiếp thay vì dùng pool từ database.js
const dbConfig = {
    host: process.env.DB_HOST || "crossover.proxy.rlwy.net",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "zRZqHEcPBOXRHYcGsVDROfkOmEDadAbI",
    database: process.env.DB_NAME || "railway",
    port: parseInt(process.env.DB_PORT) || 28675,
    ssl: false
};

async function hashExistingPasswords() {
    let connection;

    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Get all users
        const [users] = await connection.query('SELECT id, email, password FROM users');

        console.log(`\n📊 Found ${users.length} users\n`);

        let hashedCount = 0;
        let skippedCount = 0;

        for (const user of users) {
            // Check if password is already hashed
            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                console.log(`⏭️  User ${user.email} (ID: ${user.id}) - Already hashed, skipping`);
                skippedCount++;
                continue;
            }

            // Hash the plain text password
            console.log(`🔐 Hashing password for ${user.email} (ID: ${user.id})...`);
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Update user
            await connection.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, user.id]
            );

            console.log(`✅ Hashed password for ${user.email} (ID: ${user.id})`);
            hashedCount++;
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 SUMMARY:');
        console.log(`   Total users: ${users.length}`);
        console.log(`   Hashed: ${hashedCount}`);
        console.log(`   Skipped (already hashed): ${skippedCount}`);
        console.log('='.repeat(50));
        console.log('\n✅ All passwords processed successfully!\n');

    } catch (error) {
        console.error('\n❌ Error hashing passwords:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
        process.exit(0);
    }
}

// Run the script
console.log('🚀 Starting password hashing process...\n');
hashExistingPasswords();