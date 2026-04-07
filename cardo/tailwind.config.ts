import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        delaGothicOne: ["var(--font-dela-gothic-one)"],
        generalSans: ["var(--font-general-sans)"],
        sansation: ["var(--font-sansation)"],
        notoSans: ["var(--font-noto-sans)"],
      },
    },
  },
  plugins: [],
} satisfies Config;
