const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authController = {
    register: async (req, res) => {
        const { email, password, name, phone, birthday, address, role, avatarUrl, bio, username } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }
        const userUsername = await User.findOne({ username });
        if (userUsername) {
            return res.status(400).json({ message: "Tên người dùng đã tồn tại" });
        }
        if (role === "user") {
          if(!phone) {
            return res.status(400).json({ message: "Số điện thoại không được để trống" });
          }
          const userPhone = await User.findOne({ phone });
          if (userPhone) {
              return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
          }
          const userPhoneRegex = /^0[0-9]{9}$/;
          if (!userPhoneRegex.test(phone)) {
              return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
          }
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái viết hoa, chữ cái viết thường, số và ký tự đặc biệt" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);


        let addressObject = undefined;
        if (role === "user") {
            if (!address || typeof address !== "string") {
                return res.status(400).json({ message: "Địa chỉ không hợp lệ hoặc bị thiếu" });
            }
            const addressArray = address.split(",");
            const province = addressArray[0];
            const district = addressArray[1];
            const ward = addressArray[2];
            addressObject = [{ province, district, ward }];
        }


        const newUser = new User({ email, password: hashedPassword, name, phone: role === "user" ? phone.replace(/\s/g, '') : undefined, birthday, address: addressObject, role,
          avatarUrl: avatarUrl || "",
          bio: bio || "",
          username: username || "" });
        await newUser.save();
        res.status(201).json(newUser);
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
