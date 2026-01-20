import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
} from "./auth.service.js";


export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created. Please verify your email to login.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.query;

    await verifyEmail(token);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


export const resendVerifyEmailController = async (req, res) => {
  try {
    const { email } = req.body;

    await resendVerificationEmail(email);

    return res.status(200).json({
      success: true,
      message: "Verification email sent again.",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};


export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    await forgotPassword(email);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to email.",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;

    await resetPassword(token, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can login now.",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


export const logout = async (req, res) => {
  await logoutUser();
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};
