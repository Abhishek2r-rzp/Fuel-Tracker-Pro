import { useState } from "react";
import {
  Mail,
  Send,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Github,
  Linkedin,
  Fuel,
  MapPin,
  TrendingUp,
  Camera,
  FileText,
  Shield,
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const mailtoLink = `mailto:abhishek022kk@gmail.com?subject=${encodeURIComponent(
      formData.subject || "Fuel Tracker - Contact Form"
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;

    window.location.href = mailtoLink;

    setTimeout(() => {
      setStatus({
        type: "success",
        message:
          "Email client opened! Please send the email from your email app.",
      });
      setLoading(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Contact & About
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Learn more about Fuel Tracker and get in touch with the developer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border-2 border-blue-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Fuel className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  About Fuel Tracker
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    ⛽ Your Smart Fuel Management Companion
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    Fuel Tracker is a comprehensive solution for tracking your
                    vehicle&apos;s fuel consumption, mileage, and expenses.
                    Designed for bike and car owners who want to optimize their
                    fuel efficiency and keep detailed records of their vehicle
                    maintenance.
                  </p>
                </div>

                <div className="pt-4 border-t border-blue-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    ✨ Key Features
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Smart Bill Scanning:</strong> Capture fuel bills
                        with your camera and automatically extract details using
                        OCR technology
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Manual Entry:</strong> Quickly add fuel records
                        manually with an intuitive form interface
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Mileage Tracking:</strong> Calculate and monitor
                        your vehicle&apos;s fuel efficiency (km/l) over time
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Fuel Station Locator:</strong> Find nearby fuel
                        stations with real-time pricing information
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Fuel className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Comprehensive History:</strong> View detailed
                        fuel records with filtering and sorting options
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Bike Profiles:</strong> Manage multiple vehicles
                        with separate tracking for each
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-blue-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    🎯 Purpose
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    This app was built to help vehicle owners maintain accurate
                    fuel records, track expenses, and optimize fuel efficiency.
                    Whether you&apos;re a daily commuter or a long-distance
                    traveler, Fuel Tracker provides the insights you need to
                    make informed decisions about your vehicle&apos;s fuel
                    consumption.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Developer Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold text-lg mb-1">
                    Abhishek Kumar
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Full-Stack Developer & Automotive Tech Enthusiast
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <a
                    href="mailto:abhishek022kk@gmail.com"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Email
                      </p>
                      <p className="text-sm font-medium">
                        abhishek022kk@gmail.com
                      </p>
                    </div>
                  </a>

                  <a
                    href="https://github.com/abhishek022kk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        GitHub
                      </p>
                      <p className="text-sm font-medium">@abhishek022kk</p>
                    </div>
                  </a>

                  <a
                    href="https://linkedin.com/in/abhishek022kk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        LinkedIn
                      </p>
                      <p className="text-sm font-medium">Abhishek Kumar</p>
                    </div>
                  </a>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                    Passionate about building practical applications that solve
                    everyday problems. Open to feedback, suggestions, and
                    collaboration opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Get In Touch
                </h2>
              </div>

              {status.message && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                    status.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-sm ${
                      status.type === "success"
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {status.message}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Your Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Bug Report / Feature Request / General Inquiry"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your issue, suggestion, or question in detail..."
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Opening Email Client...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  This will open your default email client. Alternatively, you
                  can email directly at{" "}
                  <a
                    href="mailto:abhishek022kk@gmail.com"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    abhishek022kk@gmail.com
                  </a>
                </p>
              </form>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 border-2 border-blue-100 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Need Help?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>
                    <strong>Bug Reports:</strong> Found a bug? Let me know with
                    detailed steps to reproduce it.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>
                    <strong>Feature Requests:</strong> Have an idea to improve
                    Fuel Tracker? I&apos;d love to hear it!
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>
                    <strong>General Questions:</strong> Need help using the app?
                    Ask away!
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>
                    <strong>Collaboration:</strong> Interested in contributing?
                    Let&apos;s connect!
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">
            Thank You for Using Fuel Tracker!
          </h3>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Your feedback helps make this app better. Whether it&apos;s a bug
            report, feature request, or just a hello, I&apos;d love to hear from
            you.
          </p>
        </div>
      </div>
    </div>
  );
}
