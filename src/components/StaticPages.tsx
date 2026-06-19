import React, { useState } from "react";
import { Mail, Phone, MapPin, Sparkles, Shield, Award, Send, CheckCircle } from "lucide-react";

export function AboutPage() {
  return (
    <div id="about-page-container" className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full uppercase tracking-wider">
            About Mini Glitz
          </span>
          <h1 className="font-display font-bold text-3xl text-slate-800 tracking-tight mt-3 mb-4">
            Empowering Millions of Sellers across India
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Mini Glitz is India's fastest growing social e-commerce platform, enabling direct sellers and micro-businesses to establish online shops and easily supply stylish fashion, beauty, jewelry, and living products.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100/50">
            <div className="h-10 w-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm mb-2">Social Commerce Pioneers</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              We leverage cutting-edge technology and social sharing to connect makers with millions of household consumers.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100/50">
            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm mb-2">Zero Startup Risk</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Register for free, upload products without upfront fees, and start earning instantly with prompt payout cycles.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100/50">
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm mb-2">Enterprise Scale Support</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Integrated logistics, simple Cash on Delivery (COD), order tracking services, and automated AI catalog helpers.
            </p>
          </div>
        </div>

        {/* Vision, Mission */}
        <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-2">Our Vision</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              To democratize social commerce and bring offline retailers directly to a nationwide consumer base, reducing middleman costs and maximizing quality savings for average Indian families.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-2">Our Mission</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              To support and empower over 100 million entrepreneurs, housewives, and small traders, giving them access to digital storefronts, supply chains, banking, and safe smart payment rails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", query: "" });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.query) return;
    setIsSent(true);
    setFormData({ name: "", email: "", query: "" });
    setTimeout(() => {
      setIsSent(false);
    }, 4000);
  };

  return (
    <div id="contact-page-container" className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-2 bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-pink-400 font-bold text-xs uppercase tracking-wider block mb-2">
              Contact Us
            </span>
            <h2 className="font-display font-bold text-2xl tracking-tight mb-4 text-white">
              Get in Touch with Mini Glitz Help
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed mb-8">
              Are you a supplier wanting to list products? Or a shopper tracking an order? Send our helpdesk team a message!
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Email Help</h4>
                  <p className="text-[11px] text-slate-400">support@miniglitz.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Supplier Support Line</h4>
                  <p className="text-[11px] text-slate-400">+91 80 6000 7000 (Mon-Sat, 9AM-6PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Corporate Head Office</h4>
                  <p className="text-[11px] text-slate-400">
                    Mini Glitz HQ, Outer Ring Rd, Devarabisanahalli, Bengaluru, Karnataka 560103, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 mt-8">
            <p className="text-[10px] text-slate-400">
              © 2026 Mini Glitz Technologies. All rights reserved.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <h3 className="font-display font-semibold text-slate-800 text-lg mb-2">Send us a Message</h3>
          <p className="text-slate-400 text-xs mb-6">Our average helpline response window is less than 3 hours.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Roshni Patel"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="roshni@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Your Query Details</label>
              <textarea
                required
                rows={4}
                value={formData.query}
                onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                placeholder="Describe your question or issue in detail..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
              />
            </div>

            {isSent && (
              <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-green-100 animate-in fade-in duration-150">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Message received! Our team will get back to you soon. Thank you.</span>
              </div>
            )}

            <button
              id="submit-contact-btn"
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Send className="h-3 w-3" />
              Send Helpline Query
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
