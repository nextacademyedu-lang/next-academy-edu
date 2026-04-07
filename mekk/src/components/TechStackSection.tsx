"use client";

import React, { useMemo } from "react";
import "./TechStack.css"; // تأكد من استيراد ملف الـ CSS

// مكون الدائرة الصغيرة
const Circle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`z-10 flex size-12 items-center justify-center rounded-full shadow-sm circle-container ${className}`}>
    <div className="size-6 flex items-center justify-center">
      {children}
    </div>
  </div>
);

export default function TechStackSection() {
  // تعريف المسارات بين الدوائر (من، إلى، درجة الانحناء)
  // الحسابات دي مبنية على الـ Layout اللي تحت
  const beams = [
    { id: "1-4", d: "M 100,50 Q 150,50 250,100", reverse: false }, // Google Drive -> OpenAI
    { id: "2-4", d: "M 100,100 L 250,100", reverse: false },        // Notion -> OpenAI
    { id: "3-4", d: "M 100,150 Q 150,150 250,100", reverse: false }, // WhatsApp -> OpenAI
    { id: "5-4", d: "M 400,50 Q 350,50 250,100", reverse: true },    // Google Docs -> OpenAI
    { id: "6-4", d: "M 400,100 L 250,100", reverse: true },          // Zapier -> OpenAI
    { id: "7-4", d: "M 400,150 Q 350,150 250,100", reverse: true },  // Messenger -> OpenAI
  ];

  return (
    <section className="relative flex h-[400px] w-full items-center justify-center overflow-hidden bg-white p-10">
      {/* طبقة الـ SVG للأشعة */}
      <svg
        className="absolute inset-0 size-full pointer-events-none"
        viewBox="0 0 500 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#3b82f6" /> {/* لون الشعاع أزرق */}
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {beams.map((beam) => (
          <g key={beam.id}>
            {/* الخط الباهت الثابت */}
            <path d={beam.d} className="beam-path" strokeOpacity="0.2" />
            {/* الخط المتحرك */}
            <path d={beam.d} className="beam-animated" />
          </g>
        ))}
      </svg>

      {/* توزيع الدوائر */}
      <div className="flex size-full max-h-[250px] max-w-lg flex-col items-stretch justify-between gap-10 z-10">
        <div className="flex flex-row items-center justify-between">
          <Circle><Icons.googleDrive /></Circle>
          <Circle><Icons.googleDocs /></Circle>
        </div>
        
        <div className="flex flex-row items-center justify-between">
          <Circle><Icons.notion /></Circle>
          {/* الدائرة المركزية */}
          <Circle className="size-16 border-2 border-blue-500">
            <Icons.openai />
          </Circle>
          <Circle><Icons.zapier /></Circle>
        </div>

        <div className="flex flex-row items-center justify-between">
          <Circle><Icons.whatsapp /></Circle>
          <Circle><Icons.messenger /></Circle>
        </div>
      </div>
    </section>
  );
}

// الـ Icons اللي انت بعتها (اختصرتها هنا للوضوح، استعمل الـ SVG كاملة عندك)
const Icons = {
  googleDrive: () => <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="drive" />,
  googleDocs: () => <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg" alt="docs" />,
  notion: () => <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="notion" />,
  openai: () => <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" alt="openai" />,
  zapier: () => <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Zapier_logo.svg" alt="zapier" />,
  whatsapp: () => <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="whatsapp" />,
  messenger: () => <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="messenger" />,
};