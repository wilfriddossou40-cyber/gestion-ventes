import Header from "../components/landing/Header";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Footer from "../components/landing/Footer";

function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </>
  );
}

export default LandingPage;
