import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  Tool, 
  MessageSquare,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: <HelpCircle className="w-5 h-5 text-primary-500" />,
      items: [
        { q: "What is MsikaPos?", a: "MsikaPos is a next-generation cloud-based Point of Sale system designed for Malawian businesses to track sales, manage inventory, and monitor staff performance in real-time." },
        { q: "Can I use it offline?", a: "Yes! MsikaPos is built with offline-first technology. You can continue making sales even when the internet is down, and it will sync automatically once you're back online." },
        { q: "How do I add new staff?", a: "Only SuperAdmins can add staff. Go to the 'Team' section, click 'Add Staff', and you can even generate a Magic Link to send them via WhatsApp." }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Guide',
      icon: <Info className="w-5 h-5 text-orange-500" />,
      items: [
        { q: "Sync is stuck?", a: "Ensure your internet connection is active. You can force a manual sync by clicking the 'Sync' icon in the top header." },
        { q: "Receipt printer not working?", a: "Check if the printer is connected via USB or Bluetooth. MsikaPos uses standard browser printing; ensure the correct printer is selected in the print dialog." },
        { q: "Login failed?", a: "Check your username and password. If your account was recently suspended by an admin, you will need to contact them to reactivate it." }
      ]
    },
    {
      id: 'privacy',
      title: 'Terms & Privacy',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      content: "MsikaPos values your privacy. We encrypt all sensitive data and never share your business metrics with third parties. Your data is stored securely on cloud servers with daily backups. By using this system, you agree to follow the operational guidelines set by your business administrator."
    }
  ];

  return (
    <div className="min-h-screen bg-surface-bg text-surface-text selection:bg-primary-500/30 pb-20">
      <header className="sticky top-0 z-30 bg-surface-card/80 backdrop-blur-xl border-b border-surface-border px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-bg rounded-xl transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black italic tracking-tighter">About MsikaPos</h1>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-10">
        {/* Brand Hero */}
        <section className="text-center space-y-4 py-10">
          <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto border border-primary-500/20">
            <img src="/icon.png" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight italic">MsikaPos</h2>
            <p className="text-surface-text/40 text-xs font-black tracking-widest uppercase">Version 2.4.0 • Cloud Powered</p>
          </div>
        </section>

        {sections.map((section, idx) => (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            key={section.id} 
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-card border border-surface-border rounded-xl">
                {section.icon}
              </div>
              <h3 className="text-lg font-black tracking-tight">{section.title}</h3>
            </div>

            <div className="bg-surface-card border border-surface-border rounded-[2rem] overflow-hidden">
              {section.items ? (
                <div className="divide-y divide-surface-border">
                  {section.items.map((item, i) => (
                    <div key={i} className="p-6 space-y-2 hover:bg-surface-bg/50 transition-all">
                      <h4 className="text-sm font-black text-primary-500 italic">Q: {item.q}</h4>
                      <p className="text-[11px] font-medium text-surface-text/60 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8">
                  <p className="text-[11px] font-medium text-surface-text/60 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        ))}

        <footer className="text-center pt-10 space-y-4">
          <p className="text-[10px] font-black text-surface-text/20 tracking-[0.3em] uppercase">Built for Indelible-cpu</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-[10px] font-bold text-primary-500 hover:underline flex items-center gap-1">
              Support Portal <ExternalLink className="w-3 h-3" />
            </a>
            <a href="#" className="text-[10px] font-bold text-primary-500 hover:underline flex items-center gap-1">
              Contact Admin <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AboutPage;
