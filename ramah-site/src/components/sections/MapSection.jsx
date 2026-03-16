import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import heroImg from '@/assets/images/hero-portrait.png';

/* Inline SVG Dotted Map — lightweight alternative to MagicUI DottedMap */
function DottedWorld() {
  // Generate dot grid for simplified world map shape (focusing on Middle East region)
  const dots = [];
  const rows = 50;
  const cols = 100;
  
  // Simple world map silhouette approximation — dense in land areas
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isLand = isWorldLandApprox(r / rows, c / cols);
      if (isLand) {
        dots.push({ x: c * 10, y: r * 10, r: r / rows, c: c / cols });
      }
    }
  }

  return (
    <svg viewBox="0 0 1000 500" className="w-full h-auto">
      {dots.map((dot, i) => {
        // Highlight Middle East / Egypt area
        const isMENA = dot.c > 0.45 && dot.c < 0.65 && dot.r > 0.25 && dot.r < 0.55;
        const isEgypt = dot.c > 0.52 && dot.c < 0.58 && dot.r > 0.35 && dot.r < 0.48;
        
        return (
          <motion.circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={isEgypt ? 2.5 : isMENA ? 2 : 1.5}
            fill={isEgypt ? '#C5A55A' : isMENA ? '#30B6B0' : 'rgba(255,255,255,0.15)'}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.001, duration: 0.3 }}
          />
        );
      })}
    </svg>
  );
}

// Very simplified land detection for a world map
function isWorldLandApprox(normR, normC) {
  // North America
  if (normC > 0.05 && normC < 0.28 && normR > 0.15 && normR < 0.45) return Math.random() > 0.4;
  // South America
  if (normC > 0.2 && normC < 0.35 && normR > 0.5 && normR < 0.85) return Math.random() > 0.45;
  // Europe
  if (normC > 0.42 && normC < 0.58 && normR > 0.12 && normR < 0.35) return Math.random() > 0.35;
  // Africa
  if (normC > 0.42 && normC < 0.62 && normR > 0.35 && normR < 0.72) return Math.random() > 0.35;
  // Middle East
  if (normC > 0.55 && normC < 0.70 && normR > 0.25 && normR < 0.45) return Math.random() > 0.3;
  // Asia / India
  if (normC > 0.60 && normC < 0.85 && normR > 0.15 && normR < 0.55) return Math.random() > 0.4;
  // Southeast Asia / Australia
  if (normC > 0.78 && normC < 0.95 && normR > 0.55 && normR < 0.80) return Math.random() > 0.5;
  return false;
}

export default function MapSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="section-padding bg-bg-dark relative overflow-hidden">
      <div className="container-max">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-text-white mb-4">
            <motion.span
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              من قلب <span className="text-accent">مصر</span>
            </motion.span>
          </h2>
          <p className="text-white/50 text-lg">
            إلى العالم العربي بأكمله... التغيير يبدأ من هنا
          </p>
        </motion.div>

        {/* Map Container */}
        <div className="relative">
          <DottedWorld />
          
          {/* Ahmed's photo pin on Egypt */}
          <motion.div
            initial={{ opacity: 0, scale: 0, y: -30 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.5, type: 'spring', bounce: 0.4 }}
            className="absolute"
            style={{ top: '38%', left: '45%', transform: 'translate(-50%, -50%)' }}
          >
            {/* Pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                className="w-16 h-16 rounded-full bg-accent/30"
              />
            </div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 2], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: 'easeOut' }}
            >
              <div className="w-16 h-16 rounded-full bg-accent/20" />
            </motion.div>

            {/* Photo avatar */}
            <div className="relative w-16 h-16 rounded-full border-3 border-accent overflow-hidden shadow-lg shadow-accent/30">
              <img src={heroImg} alt="أحمد رمّاح" className="w-full h-full object-cover" />
            </div>

            {/* Label */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-accent font-medium bg-accent/10 px-3 py-1 rounded-full">
              القاهرة، مصر 🇪🇬
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
