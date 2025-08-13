require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

const createStudent = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in .env file");
    }
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");

    // Admin details
    const adminData = {
      name: "Daniel Dravie",
      email: "admin@juass",
      password: "123456", // This will be hashed
    };

    // Check if admin already exists by email
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log(`Admin with email '${adminData.email}' already exists`);
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Create new admin
    const newAdmin = new Admin({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      // timestamp is automatically set by schema default (Date.now)
    });

    // Save admin to database
    await newAdmin.save();
    console.log(
      `Admin created successfully: ${newAdmin.name} (${newAdmin.email})`
    );

    console.log("Admin creation process completed");
  } catch (error) {
    console.error("Error creating admin:", error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("MongoDB Connection Closed");
  }
};

// Run the script
createStudent();
