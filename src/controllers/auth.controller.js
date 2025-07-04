const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authController = {
    register: async (req, res) => {
        try {
            const { email, password, name, phone, birthday, address, role, avatarUrl, bio, username } = req.body;

            // Validate required fields
            if (!email || !password || !name || !role) {
                return res.status(400).json({
                    success: false,
                    message: "Email, password, name và role là bắt buộc"
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Email không hợp lệ"
                });
            }

            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email đã tồn tại"
                });
            }

            // Check if username already exists (if provided)
            if (username) {
                const existingUsername = await User.findOne({ username });
                if (existingUsername) {
                    return res.status(400).json({
                        success: false,
                        message: "Tên người dùng đã tồn tại"
                    });
                }
            }

            // Role-specific validations
            if (role === "user") {
                // Phone validation for users
                if (!phone) {
                    return res.status(400).json({
                        success: false,
                        message: "Số điện thoại không được để trống cho người dùng"
                    });
                }

                const existingPhone = await User.findOne({ phone: phone.replace(/\s/g, '') });
                if (existingPhone) {
                    return res.status(400).json({
                        success: false,
                        message: "Số điện thoại đã tồn tại"
                    });
                }

                const phoneRegex = /^0[0-9]{9}$/;
                if (!phoneRegex.test(phone)) {
                    return res.status(400).json({
                        success: false,
                        message: "Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 chữ số)"
                    });
                }

                // Address validation for users
                if (!address || typeof address !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Địa chỉ không hợp lệ hoặc bị thiếu cho người dùng"
                    });
                }

                const addressParts = address.split(",").map(part => part.trim());
                if (addressParts.length < 3) {
                    return res.status(400).json({
                        success: false,
                        message: "Địa chỉ phải có đầy đủ tỉnh/thành phố, quận/huyện, phường/xã"
                    });
                }
            }

            // Password validation
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    success: false,
                    message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái viết hoa, chữ cái viết thường, số và ký tự đặc biệt"
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Process address for users
            let addressObject = undefined;
            if (role === "user" && address) {
                const addressParts = address.split(",").map(part => part.trim());
                addressObject = [{
                    province: addressParts[0],
                    district: addressParts[1],
                    ward: addressParts[2]
                }];
            }

            // Validate birthday format if provided
            if (birthday) {
                const birthdayDate = new Date(birthday);
                if (isNaN(birthdayDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Ngày sinh không hợp lệ"
                    });
                }

                // Check if user is at least 13 years old
                const age = Math.floor((new Date() - birthdayDate) / (365.25 * 24 * 60 * 60 * 1000));
                if (age < 13) {
                    return res.status(400).json({
                        success: false,
                        message: "Người dùng phải ít nhất 13 tuổi"
                    });
                }
            }

            // Create user object
            const userData = {
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                name: name.trim(),
                role,
                avatarUrl: avatarUrl || "",
                bio: bio || "",
                username: username || ""
            };

            // Add role-specific fields
            if (role === "user") {
                userData.phone = phone.replace(/\s/g, '');
                userData.address = addressObject;
                if (birthday) userData.birthday = birthday;
            }

            // Create and save user
            const newUser = new User(userData);
            await newUser.save();

            // Remove password from response
            const userResponse = newUser.toObject();
            delete userResponse.password;

            res.status(201).json({
                success: true,
                message: "Đăng ký thành công",
                data: userResponse
            });

        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({
                success: false,
                message: "Lỗi server, vui lòng thử lại sau"
            });
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email không tồn tại" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Mật khẩu không chính xác" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ user, token });
    },
};

module.exports = authController;
