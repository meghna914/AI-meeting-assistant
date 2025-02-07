import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MessageSquareText,
  Brain,
  Lock,
  ArrowRight,
  Zap,
  CheckCircle2,
  ChevronDown,
  Github,
  Twitter,
  Linkedin,
  Video,
  Slack,
  Trello,
  MessageCircle,
  FileText,
  HelpCircle,
  Mail,
  Phone
} from 'lucide-react';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageSquareText className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MeetingAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Meeting Assistant for Smarter Collaboration
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join meetings automatically, transcribe in real-time, and get actionable insights—effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-lg hover:border-gray-300 transition-colors">
              Watch Demo
            </button>
          </div>
          <div className="mt-12">
            <img
              src="https://images.unsplash.com/photo-1600267185393-e158a98703de?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquareText className="h-8 w-8 text-indigo-600" />,
                title: "Real-Time Transcription",
                description: "Live speech-to-text conversion with high accuracy powered by advanced AI."
              },
              {
                icon: <Brain className="h-8 w-8 text-indigo-600" />,
                title: "AI-Driven Insights",
                description: "Extract action items, deadlines, and key decisions automatically."
              },
              {
                icon: <Calendar className="h-8 w-8 text-indigo-600" />,
                title: "Calendar Sync",
                description: "Seamless integration with Google Calendar & Outlook."
              },
              {
                icon: <Zap className="h-8 w-8 text-indigo-600" />,
                title: "Workflow Automation",
                description: "Push tasks to Slack, Trello, or Jira instantly."
              },
              {
                icon: <Lock className="h-8 w-8 text-indigo-600" />,
                title: "Privacy & Security",
                description: "End-to-end encryption with automatic redaction of sensitive data."
              },
              {
                icon: <CheckCircle2 className="h-8 w-8 text-indigo-600" />,
                title: "Smart Summaries",
                description: "Get AI-generated meeting summaries and action items instantly."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "This tool has transformed how our team collaborates—no more manual note-taking!",
                author: "John D.",
                role: "Product Manager",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              },
              {
                quote: "The AI insights have helped us make our meetings 10x more productive.",
                author: "Sarah L.",
                role: "CEO",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              },
              {
                quote: "Incredible accuracy in transcription and the integrations are seamless.",
                author: "Mike R.",
                role: "Engineering Lead",
                image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-6">Seamless Integrations</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Connect effortlessly with the tools you already use
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            {[
              { icon: <Video className="h-12 w-12" />, name: "Zoom" },
              { icon: <MessageCircle className="h-12 w-12" />, name: "Teams" },
              { icon: <Slack className="h-12 w-12" />, name: "Slack" },
              { icon: <Trello className="h-12 w-12" />, name: "Trello" },
              { icon: <FileText className="h-12 w-12" />, name: "Jira" }
            ].map((integration, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  {integration.icon}
                </div>
                <span className="text-gray-600 font-medium">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-6">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Find answers to common questions about MeetingAI
          </p>
          <div className="space-y-4">
            {[
              {
                question: "How accurate is the AI transcription?",
                answer: "Our AI transcription system achieves over 95% accuracy across multiple accents and languages. It continuously learns and improves through machine learning, ensuring high-quality transcriptions even in challenging audio conditions."
              },
              {
                question: "Can I export my meeting summaries?",
                answer: "Yes! You can export meeting summaries in multiple formats including PDF, Word, and plain text. We also support direct exports to note-taking apps like Notion and Evernote."
              },
              {
                question: "Does this work with all video conferencing platforms?",
                answer: "MeetingAI works seamlessly with major platforms including Zoom, Microsoft Teams, Google Meet, and Webex. We're constantly adding support for more platforms based on user requests."
              },
              {
                question: "How secure is my data?",
                answer: "We implement enterprise-grade security with end-to-end encryption, SOC 2 compliance, and GDPR adherence. Your data is stored in secure, encrypted servers with regular security audits and updates."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${openFaq === index ? 'transform rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="#help-center" className="inline-flex items-center text-indigo-600 hover:text-indigo-700">
              <HelpCircle className="h-5 w-5 mr-2" />
              Visit our Help Center for more information
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Get in Touch</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Mail className="h-6 w-6 text-indigo-600" />
                <div>
                  <h3 className="font-semibold">Email Us</h3>
                  <p className="text-gray-600">support@meetingai.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="h-6 w-6 text-indigo-600" />
                <div>
                  <h3 className="font-semibold">Call Us</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MessageSquareText className="h-6 w-6 text-indigo-600" />
                <div>
                  <h3 className="font-semibold">Live Chat</h3>
                  <p className="text-gray-600">Available 24/7</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="flex space-x-6">
                <a href="#twitter" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  <Twitter className="h-8 w-8" />
                </a>
                <a href="#github" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  <Github className="h-8 w-8" />
                </a>
                <a href="#linkedin" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  <Linkedin className="h-8 w-8" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <MessageSquareText className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-xl font-bold">MeetingAI</span>
              </div>
              <p className="text-gray-400">Making meetings smarter with AI.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#integrations" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#careers" className="hover:text-white">Careers</a></li>
                <li><a href="#blog" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#twitter" className="hover:text-indigo-400">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#github" className="hover:text-indigo-400">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#linkedin" className="hover:text-indigo-400">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 MeetingAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;