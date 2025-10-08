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
  Globe,
  Code,
  Zap,
  Shield,
} from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui";

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
      formData.subject || "Expense Tracker - Contact Form"
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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-300 dark:to-accent-300 bg-clip-text text-transparent">
          Contact & About
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Learn more about this app and get in touch with the developer
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-primary-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                About This App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  💰 Expense Tracker
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  A modern financial management suite designed to help you track
                  expenses, manage transactions, and gain insights into your
                  spending habits. Built with cutting-edge technology to provide
                  a seamless experience across all devices.
                </p>
              </div>

              <div className="pt-4 border-t border-primary-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  ✨ Key Features
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Smart Transaction Processing:</strong> Upload bank
                      statements (Excel/CSV) with automatic categorization
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Credit Card Tracking:</strong> Link credit card
                      statements to bank payments for detailed spending analysis
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Interactive Analytics:</strong> Beautiful charts
                      and insights to understand your spending patterns
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Custom Tags & Categories:</strong> Organize
                      transactions your way with flexible tagging system
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Date Filtering:</strong> Analyze spending across
                      different time periods with preset filters
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Secure Authentication:</strong> Multiple login
                      options including Google Sign-In and Phone OTP
                    </span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-primary-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  🎯 Purpose
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  This app was built to simplify personal finance management by
                  automating transaction tracking and providing actionable
                  insights. Whether you&apos;re managing daily expenses or
                  tracking credit card spending, this tool helps you stay on top
                  of your finances effortlessly.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Developer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-900 dark:text-white font-semibold text-lg mb-1">
                  Abhishek Kumar
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Full-Stack Developer & Financial Tech Enthusiast
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href="mailto:abhishek022kk@gmail.com"
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                >
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                    <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
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
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
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
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
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
                  Passionate about building user-friendly applications that
                  solve real-world problems. Open to feedback, suggestions, and
                  collaboration opportunities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Get In Touch
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="pl-10"
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
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="pl-10"
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
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Bug Report / Feature Request / General Inquiry"
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
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2"
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
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  This will open your default email client. Alternatively, you
                  can email directly at{" "}
                  <a
                    href="mailto:abhishek022kk@gmail.com"
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    abhishek022kk@gmail.com
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-100 dark:border-blue-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                    <strong>Feature Requests:</strong> Have an idea? I&apos;d
                    love to hear your suggestions!
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>
                    <strong>General Questions:</strong> Need clarification on
                    how something works? Ask away!
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                    •
                  </span>
                  <span>
                    <strong>Collaboration:</strong> Interested in contributing
                    or collaborating? Let&apos;s connect!
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-700 dark:to-accent-700 text-white border-0">
        <CardContent className="py-8 text-center">
          <h3 className="text-2xl font-bold mb-2">
            Thank You for Using This App!
          </h3>
          <p className="text-primary-100 max-w-2xl mx-auto">
            Your feedback helps make this app better. Whether it&apos;s a bug
            report, feature request, or just a hello, I&apos;d love to hear from
            you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
