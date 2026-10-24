import { motion } from "framer-motion";
import { Heart, ExternalLink, Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 border-t border-border/50 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/30 to-transparent" />
      
      <div className="relative container mx-auto px-4">
        <div className="flex flex-col items-center gap-8">
          {/* Logo and tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-3xl font-black mb-2">
              <span className="text-gradient-primary">Rewind</span>
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Your year, distilled. Your future, designed.
            </p>
          </motion.div>

          {/* Navigation links */}
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm"
          >
            <a 
              href="#demo" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline"
            >
              Demo
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline"
            >
              Features
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 link-underline"
            >
              Terms
            </a>
          </motion.nav>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            {[
              { icon: Twitter, href: "#", label: "Twitter" },
              { icon: Github, href: "#", label: "GitHub" },
              { icon: Linkedin, href: "#", label: "LinkedIn" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-10 h-10 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-300 group"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Builder credit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground"
          >
            <p className="flex items-center gap-2">
              Built with <Heart className="w-4 h-4 text-destructive fill-destructive animate-pulse" /> by
            </p>
            <a
              href="https://muritukennedy.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 group"
            >
              <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Kennedy Muritu
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          </motion.div>

          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xs text-muted-foreground/60 text-center"
          >
            © {currentYear} Rewind. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};
