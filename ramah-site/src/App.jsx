import './index.css';
import Navbar from './components/sections/Navbar';
import Hero from './components/sections/Hero';
import WhoIsRamah from './components/sections/WhoIsRamah';
import ScrollVelocityDivider from './components/sections/ScrollVelocityDivider';
import MapSection from './components/sections/MapSection';
import ICRLTeaser from './components/sections/ICRLTeaser';
import Services from './components/sections/Services';
import Testimonials from './components/sections/Testimonials';
import CTABanner from './components/sections/CTABanner';
import Contact from './components/sections/Contact';
import Footer from './components/sections/Footer';

function App() {
  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">
      <Navbar />
      <Hero />
      <WhoIsRamah />
      <ScrollVelocityDivider />
      <MapSection />
      <ICRLTeaser />
      <Services />
      <Testimonials />
      <CTABanner />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
