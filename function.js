const User = require("./mongo");
const crypto = require("crypto");

const signUp = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    await User.create({ ...data, password: hashedPassword });
  } else {
    throw new Error("User Already Exists");
  }
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  const token = jwt.sign({ id: user._id, role: user.role }, "your_jwt_secret", {
    expiresIn: "1h",
  });
  return { token, user };
};

const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Here you would send an email containing the token to the user
  // sendEmail(user.email, token);
};

const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error("Password reset token is invalid or has expired.");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};
