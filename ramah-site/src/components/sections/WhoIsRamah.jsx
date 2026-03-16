import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ─── Inline Terminal Component ─── */
function Terminal({ children }) {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl overflow-hidden font-mono text-sm">
      {/* macOS traffic lights */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span className="text-white/30 text-xs mr-4">ramah@mind:~</span>
      </div>
      <div className="p-5 space-y-1 text-left" dir="ltr">
        {children}
      </div>
    </div>
  );
}

function TermLine({ prompt, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="text-[#e6edf3] leading-relaxed"
    >
      {prompt}
    </motion.div>
  );
}

function TermCommand({ text, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      className="leading-relaxed"
    >
      <span className="text-[#27c93f]">$</span>{' '}
      <span className="text-[#e6edf3]">{text}</span>
    </motion.div>
  );
}

function TermOutput({ text, color = '#8b949e', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      className="leading-relaxed"
      style={{ color }}
    >
      {text}
    </motion.div>
  );
}

/* ─── WhoIsRamah Section ─── */
export default function WhoIsRamah() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const badges = [
    { number: '+1500', label: 'ملف نفسي' },
    { number: 'الوحيد', label: 'في الشرق الأوسط' },
    { number: '+15', label: 'سنة خبرة' },
  ];

  return (
    <section
      id="about"
      ref={ref}
      className="section-padding bg-bg-section relative overflow-hidden"
    >
      {/* Subtle teal glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="container-max grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Bio Text (right side in RTL) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="text-primary font-medium text-sm tracking-wider mb-2 block">من هو أحمد رمّاح؟</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-text mb-6 leading-tight">
            <motion.span
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="block"
            >
              من الهندسة
            </motion.span>
            <motion.span
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="block text-primary"
            >
              إلى هندسة النفس
            </motion.span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-text-light text-lg leading-relaxed mb-6"
          >
            بدأ أحمد رمّاح مسيرته كمهندس، لكن شغفه بفهم النفس البشرية 
            قاده إلى عالم العلاج النفسي. اليوم، هو المعالج النفسي الوحيد 
            المعتمد كـ Master Trainer من معهد ICRL الأمريكي 
            في منطقة الشرق الأوسط وأفريقيا بأكملها.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-text-light text-lg leading-relaxed mb-8"
          >
            يجمع منهجه الفريد بين الدقة الهندسية والفهم العميق لعلم 
            النفس، مما يمنحه قدرة استثنائية على تحليل الأنماط السلوكية 
            وتقديم حلول عملية وفعّالة.
          </motion.p>

          {/* Stats badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap gap-6"
          >
            {badges.map((badge, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{badge.number}</div>
                <div className="text-sm text-text-light mt-1">{badge.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Terminal (left side in RTL) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <Terminal>
            <TermCommand text="whoami" delay={0.5} />
            <TermOutput text="→ Ahmed Ramah — Engineer turned Therapist" color="#58a6ff" delay={0.8} />
            <div className="h-2" />

            <TermCommand text="cat credentials.txt" delay={1.2} />
            <TermOutput text="✔ ICRL Master Trainer & Supervisor" color="#27c93f" delay={1.5} />
            <TermOutput text="✔ 1500+ psychological profiles analyzed" color="#27c93f" delay={1.7} />
            <TermOutput text="✔ Only certified in Middle East & Africa" color="#27c93f" delay={1.9} />
            <TermOutput text="✔ Engineering background (precision mindset)" color="#27c93f" delay={2.1} />
            <div className="h-2" />

            <TermCommand text="echo $MISSION" delay={2.4} />
            <TermOutput text='"Coding the subconscious for lasting change"' color="#ffa657" delay={2.7} />
            <div className="h-2" />

            <TermCommand text="ls tools/" delay={3.0} />
            <TermOutput text="ICRL_shapes/  coaching/  therapy/  training/" color="#8b949e" delay={3.3} />
            <div className="h-2" />

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 3.6, duration: 0.5 }}
              className="flex items-center"
            >
              <span className="text-[#27c93f]">$</span>
              <span className="text-[#e6edf3] mr-1"> _</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-4 bg-[#e6edf3]"
              />
            </motion.div>
          </Terminal>
        </motion.div>
      </div>
    </section>
  );
}
