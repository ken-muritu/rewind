import { motion } from "framer-motion";
import { HelpCircle, Plus, Minus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does the reflection process take?",
    answer: "The full Rewind experience takes about 15 minutes. We guide you through psychology-backed questions designed to help you reflect meaningfully on your year without feeling overwhelmed.",
  },
  {
    question: "Is my data private and secure?",
    answer: "Absolutely. Your reflections are encrypted and stored securely. Only you can access your personal insights. We never share or sell your data to third parties.",
  },
  {
    question: "What makes Rewind different from journaling apps?",
    answer: "Rewind combines structured reflection with beautiful, shareable outputs. Unlike journaling apps, we use psychology-backed frameworks like narrative identity theory and peak-end research to guide your reflection, then transform your insights into cinematic Wrapped-style cards and actionable blueprints.",
  },
  {
    question: "Can I share my Wrapped cards on social media?",
    answer: "Yes! Your Wrapped cards are designed to be Instagram-ready. You can download them as images and share directly to any social platform. Many users share their year-end insights on LinkedIn, Instagram, and Twitter.",
  },
  {
    question: "What is the 2026 Blueprint?",
    answer: "The Blueprint is an AI-powered planning document generated from your reflection answers. It identifies patterns in your year, highlights growth areas, and provides quarterly action plans with specific milestones to help you achieve your goals.",
  },
  {
    question: "Is Rewind free to use?",
    answer: "Yes, the core Rewind experience is completely free. You can complete your reflection, get your Wrapped cards, and receive your personalized Blueprint at no cost. Premium features for teams and advanced analytics are available for power users.",
  },
  {
    question: "Can I do Rewind with my team or family?",
    answer: "Definitely! Many teams use Rewind for year-end retrospectives. Each person completes their individual reflection, then you can share and discuss insights together. It sparks meaningful conversations about culture, goals, and growth.",
  },
  {
    question: "How is the Blueprint generated?",
    answer: "Our AI analyzes your reflection responses to identify patterns, themes, and areas for growth. It then creates a personalized roadmap with quarterly goals, specific action items, and potential obstacles to watch for—all based on your unique experiences and aspirations.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      
      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/4 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl"
        animate={{ x: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">FAQ</span>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            Got questions?
            <br />
            <span className="text-gradient-primary">We have answers.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Rewind and how it can transform your year-end reflection.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl px-6 data-[state=open]:border-primary/30 transition-colors duration-300"
                >
                  <AccordionTrigger className="text-left font-semibold text-base sm:text-lg hover:no-underline py-5 [&[data-state=open]>svg]:rotate-45">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a
              href="mailto:hello@rewind.app"
              className="text-primary font-semibold hover:underline"
            >
              Get in touch
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
