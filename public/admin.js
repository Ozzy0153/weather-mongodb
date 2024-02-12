const bcrypt = require('bcrypt');
const saltRounds = 10;

async function ensureAdminUser() {
    const adminUsername = 'Orazaly';
    const adminExists = await User.findOne({ username: adminUsername });

    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('your_secure_password', saltRounds);
        await User.create({
            username: adminUsername,
            password: hashedPassword,
            isAdmin: true
        });
    }
}

ensureAdminUser().then(() => console.log('Admin user check complete'));
