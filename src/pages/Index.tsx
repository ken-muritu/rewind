import { Hero } from "@/components/landing/Hero";
import { WrappedDemo } from "@/components/landing/WrappedDemo";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AppFlowDemo } from "@/components/landing/AppFlowDemo";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";

const Index = () => {
  return (
    <main className="min-h-screen">
      <ScrollToTop />
      <Hero />
      <WrappedDemo />
      <HowItWorks />
      <AppFlowDemo />
      <section id="features">
        <Features />
      </section>
      <section id="pricing">
        <Pricing />
      </section>
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
