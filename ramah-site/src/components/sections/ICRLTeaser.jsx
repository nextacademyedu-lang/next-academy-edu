import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const SHAPES = [
  {
    name: 'الماسة',
    color: '#C5A55A',
    label: 'Diamond',
    desc: 'القائد الحاسم',
    render: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,5 95,50 50,95 5,50" fill={color} />
      </svg>
    ),
  },
  {
    name: 'الدائرة',
    color: '#30B6B0',
    label: 'Circle',
    desc: 'المحب للتواصل',
    render: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill={color} />
      </svg>
    ),
  },
  {
    name: 'المثلث',
    color: '#E74C3C',
    label: 'Triangle',
    desc: 'الطموح المتعلم',
    render: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,5 95,90 5,90" fill={color} />
      </svg>
    ),
  },
  {
    name: 'المربع',
    color: '#2ECC71',
    label: 'Square',
    desc: 'المنظّم المنهجي',
    render: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="10" y="10" width="80" height="80" fill={color} />
      </svg>
    ),
  },
];

export default function ICRLTeaser() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section id="icrl" ref={sectionRef} className="section-padding bg-bg relative overflow-hidden">
      <div className="container-max">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm tracking-wider mb-2 block">
            منهجية ICRL
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-text mb-4">
            <motion.span
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              كل شخص له <span className="text-primary">شكل</span>
            </motion.span>
          </h2>
          <p className="text-text-light text-lg max-w-2xl mx-auto">
            الأشكال الأربعة في منهجية ICRL تكشف عن أنماط التفكير والسلوك. 
            أي شكل يمثلك؟
          </p>
        </motion.div>

        {/* Shapes Grid with fall animation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-4xl mx-auto mb-16">
          {SHAPES.map((shape, i) => {
            return (
              <ShapeCard
                key={shape.label}
                shape={shape}
                index={i}
                scrollProgress={scrollYProgress}
              />
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-primary-dark text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
          >
            اكتشف ما يقوله شكلك عنك
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function ShapeCard({ shape, index, scrollProgress }) {
  const y = useTransform(
    scrollProgress,
    [0, 0.3, 0.5],
    [-200 - index * 50, -50, 0]
  );
  const opacity = useTransform(scrollProgress, [0.1, 0.35], [0, 1]);
  const scale = useTransform(scrollProgress, [0.3, 0.5], [0.8, 1]);
  const rotate = useTransform(scrollProgress, [0, 0.4], [15 * (index % 2 === 0 ? 1 : -1), 0]);

  return (
    <motion.div
      style={{ y, opacity, scale, rotate }}
      whileHover={{ scale: 1.08, y: -8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="flex flex-col items-center gap-4 cursor-pointer group"
    >
      <div
        className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 transition-all duration-300 group-hover:drop-shadow-[0_8px_25px_rgba(0,0,0,0.2)]"
      >
        {shape.render(shape.color)}
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-text">{shape.name}</h3>
        <p className="text-sm text-text-light">{shape.desc}</p>
      </div>
    </motion.div>
  );
}
