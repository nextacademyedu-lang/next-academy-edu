import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const TESTIMONIALS = [
  {
    name: 'سارة أحمد',
    role: 'مديرة تسويق',
    text: 'جلسات أحمد غيّرت نظرتي لنفسي تماماً. منهج ICRL ساعدني أفهم ليه بتصرف بطريقة معينة في المواقف الصعبة. شكراً أحمد!',
    rating: 5,
  },
  {
    name: 'محمد خالد',
    role: 'رائد أعمال',
    text: 'كنت بعاني من قرارات متهورة في شغلي. بعد ما اتعرفت على شكلي في ICRL، بقيت أفهم نفسي أحسن وأخد قرارات أهدى.',
    rating: 5,
  },
  {
    name: 'فاطمة علي',
    role: 'معلمة',
    text: 'ورشة العمل الجماعية كانت تجربة مذهلة. الفريق كله بقى يفهم بعضه أحسن واتحسن التواصل بينا بشكل ملحوظ.',
    rating: 5,
  },
  {
    name: 'عمر حسن',
    role: 'طبيب',
    text: 'أحمد بيجمع بين العلم والتطبيق بطريقة فريدة. حسيت إن كل جلسة بتضيفلي فهم جديد لنفسي وللناس حواليا.',
    rating: 5,
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [active, setActive] = useState(0);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonials" ref={ref} className="section-padding bg-bg relative overflow-hidden">
      <div className="container-max">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm tracking-wider mb-2 block">آراء العملاء</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-text mb-4">
            <motion.span
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : {}}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              ماذا يقولون <span className="text-primary">عني</span>
            </motion.span>
          </h2>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[240px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.06)] border border-gray-100/50 text-center"
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-text text-lg md:text-xl leading-relaxed mb-6 font-medium">
                  "{TESTIMONIALS[active].text}"
                </p>

                {/* Author */}
                <div className="flex flex-col items-center gap-1">
                  {/* Avatar placeholder */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg mb-2">
                    {TESTIMONIALS[active].name.charAt(0)}
                  </div>
                  <span className="font-bold text-text">{TESTIMONIALS[active].name}</span>
                  <span className="text-sm text-text-light">{TESTIMONIALS[active].role}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === active
                    ? 'bg-primary w-8'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
