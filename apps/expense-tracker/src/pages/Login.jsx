import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@bill-reader/shared-auth";
import { Wallet, Mail, Lock, Phone, Loader } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle, sendPhoneOTP, verifyPhoneOTP } =
    useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp && password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      setError("");
      setLoading(true);

      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }

      navigate("/");
    } catch (_err) {
      setError(
        isSignUp
          ? "Failed to create account: " + _err.message
          : "Failed to sign in: " + _err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      await loginWithGoogle(isMobile);
      if (!isMobile) {
        navigate("/");
      }
    } catch (_err) {
      setError("Failed to sign in with Google: " + _err.message);
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!phoneNumber || phoneNumber.length < 10) {
      return setError("Please enter a valid phone number");
    }

    const formattedPhone = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+91${phoneNumber}`;

    try {
      setError("");
      setLoading(true);
      await sendPhoneOTP(formattedPhone);
      setOtpSent(true);
      setError("");
    } catch (_err) {
      setError("Failed to send OTP: " + _err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      return setError("Please enter a valid 6-digit OTP");
    }

    try {
      setError("");
      setLoading(true);
      await verifyPhoneOTP(otp);
      navigate("/");
    } catch (_err) {
      setError("Failed to verify OTP: " + _err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-200 via-accent-100 to-secondary-200 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800/50 dark:to-primary-700/50 p-4 rounded-full mb-4 shadow-lg">
            <Wallet className="w-12 h-12 text-primary-600 dark:text-primary-300" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-300 dark:to-accent-300 bg-clip-text text-transparent">
            Bill Reader
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Financial Management Suite
          </p>
        </div>

        {error && (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!showPhoneAuth ? (
          <>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : isSignUp ? (
                  "Sign Up"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Google
                  </span>
                </button>

                <button
                  onClick={() => setShowPhoneAuth(true)}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </>
        ) : (
          <>
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter with country code (e.g., +91 for India)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Enter the 6-digit code sent to {phoneNumber}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Resend OTP
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowPhoneAuth(false);
                  setOtpSent(false);
                  setPhoneNumber("");
                  setOtp("");
                }}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                ← Back to other options
              </button>
            </div>
          </>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}

export default Login;
