import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function CTABanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="section-padding bg-primary-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="container-max relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary font-[var(--font-script)] text-2xl md:text-3xl mb-4">
            ابدأ رحلتك
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-text-white mb-6 leading-tight">
            <motion.span
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="block"
            >
              التغيير الحقيقي
            </motion.span>
            <motion.span
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="block text-accent"
            >
              ممكن يبدأ النهارده
            </motion.span>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-white/60 text-lg max-w-xl mx-auto mb-8"
          >
            احجز جلستك الأولى المجانية واكتشف كيف يمكن لمنهج ICRL 
            أن يغيّر فهمك لنفسك وعلاقاتك.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a
              href="#contact"
              className="bg-accent text-primary-dark px-8 py-3.5 rounded-full text-base font-bold hover:bg-accent-light transition-all duration-300 hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5"
            >
              احجز جلستك المجانية
            </a>
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white/20 text-text-white px-8 py-3.5 rounded-full text-base font-medium hover:border-white/50 hover:bg-white/5 transition-all duration-300 hover:-translate-y-0.5"
            >
              تواصل عبر واتساب
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
