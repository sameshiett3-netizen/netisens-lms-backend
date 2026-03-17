require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Pulls in your exact User model

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to database...");

        // 1. Check if this admin already exists so we don't make duplicates
        const existingAdmin = await User.findOne({ email: "admin@netisens.com" });
        if (existingAdmin) {
            console.log("Admin account already exists!");
            process.exit();
        }

        // 2. Hash the password manually
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("AdminPassword123!", salt);

        // 3. Build and save the Admin profile
        const superAdmin = new User({
            name: "System Administrator",
            email: "admin@netisens.com",
            password: hashedPassword,
            role: "admin" // Force the admin role!
        });

        await superAdmin.save();
        console.log("Success! Super Admin created.");
        process.exit(); // Closes the script

    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createSuperAdmin();