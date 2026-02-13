import User from "../modules/users/user.model.js";
import bcrypt from "bcryptjs";

export const seedAdmin = async () => {
    try {
        const adminEmail = "admin@gmail.com";
        const adminPassword = "admin";

        // IMPORTANT: Select password to check/update it
        const existingAdmin = await User.findOne({ email: adminEmail }).select("+password");
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        if (!existingAdmin) {
            await User.create({
                name: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                emailVerified: true,
                onboardingStatus: "none",
                adminDetails: {
                    isSuperAdmin: true,
                    permissions: ["MANAGE_USERS", "MODERATE_CONTENT", "VIEW_REPORTS"],
                    notes: "Initial system administrator"
                }
            });
            console.log("✅ Default admin user created: admin@gmail.com / admin");
        } else {
            // Force synchronize credentials and role
            // This fixes the 'Invalid credentials' issue by ensuring the password is a valid hash of 'admin'
            existingAdmin.role = "admin";
            existingAdmin.emailVerified = true;
            existingAdmin.password = hashedPassword;

            if (!existingAdmin.adminDetails) {
                existingAdmin.adminDetails = {
                    isSuperAdmin: true,
                    permissions: ["MANAGE_USERS", "MODERATE_CONTENT", "VIEW_REPORTS"],
                    notes: "Initial system administrator"
                };
            }

            await existingAdmin.save();
            console.log("✅ Admin user credentials synchronized: admin@gmail.com / admin");
        }
    } catch (error) {
        console.error("❌ Failed to seed/sync admin user:", error.message);
    }
};
