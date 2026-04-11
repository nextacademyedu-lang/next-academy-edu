import React from 'react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import styles from './page.module.css';
import { buildPageMetadata } from '@/lib/seo/metadata';

type PrivacySection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/privacy',
    titleAr: 'سياسة الخصوصية',
    titleEn: 'Privacy Policy',
    descriptionAr: 'سياسة الخصوصية الخاصة بمنصة Next Academy وكيفية التعامل مع البيانات.',
    descriptionEn: 'Next Academy privacy policy and how user data is handled.',
  });
}

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const sections: PrivacySection[] = isAr
    ? [
        {
          id: 'information-collection',
          title: 'جمع المعلومات',
          paragraphs: [
            'نجمع البيانات التي تقدمها لنا مباشرة عند إنشاء حساب، التسجيل في برنامج، أو التواصل مع فريق الدعم. وقد تشمل هذه البيانات الاسم، البريد الإلكتروني، رقم الهاتف، اسم الشركة، والمسمى الوظيفي.',
            'كما نجمع بعض البيانات التقنية تلقائياً عند استخدام المنصة مثل عنوان IP، نوع المتصفح، ومؤشرات التفاعل لتحسين الأداء وجودة الخدمة.',
          ],
        },
        {
          id: 'data-usage',
          title: 'استخدام البيانات',
          paragraphs: ['نستخدم البيانات التي نجمعها من أجل:'],
          bullets: [
            'تشغيل خدماتنا وصيانتها وتحسين جودتها.',
            'معالجة المدفوعات وإرسال الإشعارات المرتبطة بها.',
            'إرسال التنبيهات التقنية والتحديثات والرسائل الإدارية.',
            'الرد على الاستفسارات وطلبات الدعم.',
            'التواصل بشأن البرامج والخدمات والعروض ذات الصلة.',
          ],
        },
        {
          id: 'third-parties',
          title: 'مشاركة البيانات مع أطراف ثالثة',
          paragraphs: [
            'لا نقوم ببيع بياناتك الشخصية. وقد نشارك جزءاً من البيانات مع مزودين موثوقين يساعدوننا في تشغيل المنصة أو تقديم الخدمة، وذلك وفق التزامات تعاقدية للحفاظ على السرية والأمان.',
          ],
        },
        {
          id: 'security',
          title: 'أمن البيانات',
          paragraphs: [
            'نطبق إجراءات أمنية مناسبة لحماية البيانات من الوصول غير المصرح به أو التعديل أو الكشف أو الإتلاف. كما تتم معالجة المدفوعات عبر قنوات مشفرة ومن خلال مزود دفع متوافق مع معايير الأمان.',
          ],
        },
        {
          id: 'rights',
          title: 'حقوقك',
          paragraphs: [
            'بحسب بلد الإقامة، قد يكون لك حق الوصول إلى بياناتك أو تصحيحها أو طلب حذفها، وقد يحق لك الاعتراض على بعض أنشطة المعالجة أو طلب نقل البيانات. للتواصل بخصوص هذه الحقوق: privacy@nextacademyedu.com',
          ],
        },
      ]
    : [
        {
          id: 'information-collection',
          title: 'Information Collection',
          paragraphs: [
            'We collect information that you provide directly to us when you create an account, enroll in a program, or contact support. This may include your name, email address, phone number, company name, and job title.',
            'We also collect certain technical information automatically, such as IP address, browser type, and usage interactions to improve platform quality and reliability.',
          ],
        },
        {
          id: 'data-usage',
          title: 'Data Usage',
          paragraphs: ['We use collected information to:'],
          bullets: [
            'Provide, maintain, and improve our services.',
            'Process transactions and send related notices.',
            'Send technical updates and operational messages.',
            'Respond to support requests and user inquiries.',
            'Communicate relevant offers, products, and events.',
          ],
        },
        {
          id: 'third-parties',
          title: 'Third-Party Sharing',
          paragraphs: [
            'We do not sell personal information. We may share limited data with trusted service providers who support platform operations, under contractual obligations for confidentiality and security.',
          ],
        },
        {
          id: 'security',
          title: 'Data Security',
          paragraphs: [
            'We apply reasonable safeguards to protect data from unauthorized access, alteration, disclosure, or destruction. Payments are processed through encrypted channels and compliant payment providers.',
          ],
        },
        {
          id: 'rights',
          title: 'Your Rights',
          paragraphs: [
            'Depending on your location, you may have rights to access, correct, delete, or restrict processing of your data, and request portability where applicable. Contact us at privacy@nextacademyedu.com.',
          ],
        },
      ];

  const title = isAr ? 'سياسة الخصوصية' : 'Privacy Policy';
  const updated = isAr ? 'آخر تحديث: أبريل 2026' : 'Last Updated: April 2026';
  const contentsLabel = isAr ? 'المحتويات' : 'Contents';

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lastUpdated}>{updated}</p>
          </div>

          <div className={styles.contentLayout}>
            <aside className={styles.sidebar}>
              <div className={styles.stickyNav}>
                <h3 className={styles.navTitle}>{contentsLabel}</h3>
                <ul className={styles.navList}>
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`}>
                        {index + 1}. {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <article className={styles.document}>
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className={styles.docSection}>
                  <h2>
                    {index + 1}. {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
