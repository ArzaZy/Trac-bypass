import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { BypassPanel } from "@/components/bypass-panel";
import { HistoryPanel } from "@/components/history-panel";
import { HowItWorks } from "@/components/how-it-works";
import { ApiStatus } from "@/components/api-status";
import { FaqSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <section id="bypass" className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
          <BypassPanel />
          <HistoryPanel />
        </section>
        <HowItWorks />
        <ApiStatus />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
