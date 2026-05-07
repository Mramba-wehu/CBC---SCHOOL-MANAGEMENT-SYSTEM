import React from 'react';
import { motion } from 'framer-motion';
import { Info, Code2, Rocket, ShieldAlert, Cpu, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page max-w-4xl mx-auto py-10">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 bg-warning/10 text-warning px-4 py-2 rounded-full border border-warning/20 mb-6">
          <ShieldAlert size={18} />
          <span className="font-bold text-xs uppercase tracking-widest">Development Phase: Beta v1.0</span>
        </div>
        <h1 className="text-4xl font-black mb-4">Wehu CBC Management System</h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          A premium, high-performance ecosystem designed to bridge the gap between traditional management and the modern CBC curriculum in Kenya.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <motion.div 
          className="card glass p-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-3 bg-primary/20 rounded-xl text-primary w-fit mb-6">
            <Cpu size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">Core Technology</h3>
          <p className="text-sm text-dim leading-relaxed">
            Built on a modern full-stack architecture using Node.js, Express, React, and Prisma. Our offline-first approach ensures that schools in low-connectivity areas never lose their data.
          </p>
        </motion.div>

        <motion.div 
          className="card glass p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-3 bg-success/20 rounded-xl text-success w-fit mb-6">
            <Rocket size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">The Mission</h3>
          <p className="text-sm text-dim leading-relaxed">
            To provide school administrators and teachers with intelligent tools that automate the complex assessment and reporting requirements of the CBC curriculum.
          </p>
        </motion.div>
      </div>

      <motion.div 
        className="bg-primary/5 border border-primary/10 rounded-3xl p-10 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="animate-pulse w-3 h-3 bg-danger rounded-full"></div>
            <h2 className="text-2xl font-bold">Important Notice</h2>
          </div>
          <p className="text-dim mb-6 leading-relaxed">
            Please be advised that the **Wehu CBC SMS is currently under active development**. While the core features are functional, you may encounter periodic updates and UI refinements. We are continuously working to improve stability and add new modules.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1 rounded-lg">
              <Code2 size={14} className="text-primary" />
              <span>Version: 1.0.0-beta</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold bg-white/5 px-3 py-1 rounded-lg">
              <Info size={14} className="text-success" />
              <span>Status: Testing Phase</span>
            </div>
          </div>
        </div>
        <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[200%] bg-primary/5 blur-[80px] rounded-full"></div>
      </motion.div>

      <footer className="mt-20 text-center pb-10">
        <div className="flex items-center justify-center gap-2 text-muted text-sm font-medium">
          <span>Developed with</span>
          <Heart size={16} className="text-danger fill-danger" />
          <span>by the Wehu Team</span>
        </div>
        <p className="text-[10px] text-muted/50 mt-2 uppercase tracking-widest">© 2026 Wehu CBC School Management System</p>
      </footer>
    </div>
  );
};

export default About;
