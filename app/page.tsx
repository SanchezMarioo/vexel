import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  return (
    <main className="flex flex-col bg-background overflow-x-hidden">
      <Nav />
      <Hero />
      <Metrics />
      <Services />
      <Process />
      <Testimonials />
      <FinalCTA />
    </main>
  );
}
