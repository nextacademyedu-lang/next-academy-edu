"use client";

import React from "react";
import PortfolioHero from "@/components/portfolio/PortfolioHero";
import ProjectsShowcase from "@/components/portfolio/ProjectsShowcase";
import PortfolioStatement from "@/components/portfolio/PortfolioStatement";
import PortfolioCaseStudies from "@/components/portfolio/PortfolioCaseStudies";
import StatsSection from "@/components/StatsSection";
import { PROJECTS, CASE_STUDIES } from "@/lib/constants";
import styles from "./PortfolioClient.module.css";

export default function PortfolioClient() {
    return (
        <main className={styles.page}>
            {/* 1. Hook — Typography-heavy dark hero */}
            <PortfolioHero />

            {/* 2. Visual Proof — Alternating Bento Grid + Horizontal Scroll */}
            <ProjectsShowcase
                items={PROJECTS.items}
                bentoSize={5}
                scrollSize={4}
            />

            {/* 3. Bold Statement CTA */}
            <PortfolioStatement />

            {/* 4. Deep Logic — Light mode case studies */}
            <PortfolioCaseStudies items={CASE_STUDIES.items} />

            {/* 5. Authority — Stats / "BUILD ENGINES" */}
            <StatsSection />
        </main>
    );
}
