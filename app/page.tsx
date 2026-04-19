import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Projects from "@/components/Projects";
import Pricing from "@/components/Pricing";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import BackgroundLayers from "@/components/BackgroundLayers";

export default function Home() {
  return (
    <>
      <BackgroundLayers />
      <main className="relative z-10 flex flex-col overflow-x-clip bg-background">
        <Nav />
        <Hero />
        <Metrics />
        <Projects />
        <Pricing />
        <About />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  );
}
