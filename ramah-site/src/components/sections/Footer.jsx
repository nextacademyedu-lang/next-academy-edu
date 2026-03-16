export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white py-12 px-6">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg font-[var(--font-heading)]">ر</span>
              </div>
              <span className="text-lg font-medium">أحمد رمّاح</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              ICRL Master Trainer & Supervisor. 
              التغيير الحقيقي يبدأ من الداخل.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-accent">روابط سريعة</h3>
            <div className="space-y-2">
              {[
                { label: 'الرئيسية', href: '#hero' },
                { label: 'من أنا', href: '#about' },
                { label: 'ICRL', href: '#icrl' },
                { label: 'الخدمات', href: '#services' },
                { label: 'تواصل معي', href: '#contact' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-white/50 text-sm hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Quick */}
          <div>
            <h3 className="font-bold mb-4 text-accent">تواصل</h3>
            <div className="space-y-2 text-white/50 text-sm">
              <p dir="ltr">ahmed@ramah.com</p>
              <p dir="ltr">+20 100 000 0000</p>
              <p>القاهرة، مصر</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} أحمد رمّاح. جميع الحقوق محفوظة.
          </p>
          <p className="text-white/20 text-xs">
            Built with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
