import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ScrollVelocityDivider({
  texts = ['المعالج الوحيد المعتمد في الشرق الأوسط', 'Master Trainer', 'ICRL', 'أحمد رمّاح'],
  baseVelocity = 3,
  className = '',
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', `-${baseVelocity * 15}%`]);
  const x2 = useTransform(scrollYProgress, [0, 1], [`-${baseVelocity * 10}%`, '0%']);

  const fullText = texts.join(' • ');
  const repeated = Array(8).fill(fullText).join('   ★   ');

  return (
    <div ref={ref} className={`py-10 overflow-hidden bg-primary-dark ${className}`}>
      {/* Row 1 — moves left */}
      <motion.div style={{ x: x1 }} className="whitespace-nowrap mb-4">
        <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/15 font-[var(--font-heading)] tracking-wide">
          {repeated}
        </span>
      </motion.div>

      {/* Row 2 — moves right */}
      <motion.div style={{ x: x2 }} className="whitespace-nowrap">
        <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary/20 font-[var(--font-heading)] tracking-wide">
          {repeated}
        </span>
      </motion.div>
    </div>
  );
}
