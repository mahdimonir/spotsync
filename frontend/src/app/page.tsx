"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Zap, Shield, Cpu, ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* Load 3D scene client-only */
const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

/* ── Magnetic button ─────────────────────────────────────────── */
function MagneticLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    gsap.to(el, { x: dx * 0.32, y: dy * 0.32, duration: 0.4, ease: "power2.out" });
  };
  const onLeave = () => {
    if (ref.current) gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
  };
  return (
    <a ref={ref} href={href} className={className} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </a>
  );
}

/* ── Feature card with 3D tilt ───────────────────────────────── */
function TiltCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      rotateY: x * 12,
      rotateX: -y * 12,
      scale: 1.03,
      duration: 0.35,
      ease: "power2.out",
      transformPerspective: 900,
    });
  };

  const onLeave = () => {
    if (ref.current)
      gsap.to(ref.current, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: "elastic.out(1,0.5)" });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative rounded-2xl bg-white border border-[#ebebeb] p-8 shadow-[0_2px_24px_0_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_0_rgba(0,0,0,0.08)] transition-shadow cursor-default"
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-[15px] font-semibold text-[#0a0a0a] mb-2 tracking-[-0.01em]">{title}</h3>
      <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── Stat counter ────────────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 85%" },
    });
  }, []);
  return (
    <div ref={ref} className="text-center px-8 border-r border-[#ebebeb] last:border-0">
      <div className="text-[42px] font-bold tracking-[-0.04em] text-[#0a0a0a] leading-none">{value}</div>
      <div className="text-[12px] text-[#6b6b6b] mt-2 font-medium uppercase tracking-[0.08em]">{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Landing Page
═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  /* refs for GSAP */
  const heroTextRef  = useRef<HTMLDivElement>(null);
  const line1Ref     = useRef<HTMLSpanElement>(null);
  const line2Ref     = useRef<HTMLSpanElement>(null);
  const line3Ref     = useRef<HTMLSpanElement>(null);
  const subRef       = useRef<HTMLParagraphElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const scrollHintRef= useRef<HTMLDivElement>(null);
  const featuresRef  = useRef<HTMLDivElement>(null);
  const featureTitleRef = useRef<HTMLHeadingElement>(null);
  const processRef   = useRef<HTMLDivElement>(null);
  const sceneContainerRef = useRef<HTMLDivElement>(null);

  const handleHover = useCallback((name: string | null) => setHoveredSpot(name), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    /* ── Hero text entrance ── */
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        [line1Ref.current, line2Ref.current, line3Ref.current],
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.12 }
      )
        .fromTo(subRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
        .fromTo(ctaRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
        .fromTo(scrollHintRef.current, { opacity: 0 }, { opacity: 1, duration: 1 }, "-=0.2");

      /* Scroll hint bounce */
      gsap.to(scrollHintRef.current, {
        y: 8,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: "sine.inOut",
        delay: 2,
      });

      /* ── Feature title slide ── */
      if (featureTitleRef.current) {
        gsap.fromTo(featureTitleRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: featureTitleRef.current, start: "top 80%" }
          }
        );
      }

      /* ── Feature cards stagger ── */
      if (featuresRef.current) {
        gsap.fromTo(featuresRef.current.children,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "power3.out",
            scrollTrigger: { trigger: featuresRef.current, start: "top 80%" }
          }
        );
      }

      /* ── Process steps ── */
      if (processRef.current) {
        gsap.fromTo(processRef.current.children,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.8, stagger: 0.18, ease: "power3.out",
            scrollTrigger: { trigger: processRef.current, start: "top 80%" }
          }
        );
      }

      /* ── 3D scene parallax on scroll ── */
      if (sceneContainerRef.current) {
        gsap.to(sceneContainerRef.current, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: { trigger: sceneContainerRef.current, start: "top top", end: "bottom top", scrub: true }
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-white text-[#0a0a0a] overflow-x-hidden">

      {/* ── Sticky Navbar ──────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-white/80 backdrop-blur-xl border-b border-[#ebebeb]/80 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2 font-semibold text-[15px] tracking-[-0.01em]">
            <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#059669] text-white text-xs font-bold">S</span>
            SpotSync
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-[#6b6b6b] font-medium">
            <a href="#features" className="hover:text-[#0a0a0a] transition-colors">Features</a>
            <a href="#how" className="hover:text-[#0a0a0a] transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-[#0a0a0a] transition-colors">Stats</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-medium text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-[13px] font-semibold bg-[#0a0a0a] text-white px-4 py-2 rounded-full hover:bg-[#333] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          Hero — full-viewport split
      ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT: Text */}
        <div className="relative z-10 flex flex-col justify-center px-6 lg:px-16 pt-24 pb-16 lg:pt-0 lg:pb-0 max-w-2xl mx-auto lg:mx-0 lg:max-w-none">
          
          <div ref={heroTextRef}>
            {/* Label */}
            <div className="overflow-hidden mb-6">
              <span className="inline-flex items-center gap-1.5 bg-[#f0fdf4] text-[#059669] text-[11px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-[#bbf7d0]">
                <Zap className="w-3 h-3" />
                EV Charging + Smart Parking
              </span>
            </div>

            {/* Masked headline lines */}
            <h1 className="text-[clamp(42px,6vw,80px)] font-bold leading-[1.02] tracking-[-0.04em] text-[#0a0a0a]">
              <span className="overflow-hidden block">
                <span ref={line1Ref} className="block">Reserve.</span>
              </span>
              <span className="overflow-hidden block">
                <span ref={line2Ref} className="block text-[#059669]">Charge.</span>
              </span>
              <span className="overflow-hidden block">
                <span ref={line3Ref} className="block">Instantly.</span>
              </span>
            </h1>

            <p ref={subRef} className="mt-6 text-[16px] text-[#6b6b6b] leading-[1.7] max-w-md">
              SpotSync eliminates the EV charging bottleneck at airports and malls. Atomic database locks guarantee your spot — even under peak concurrent demand.
            </p>

            <div ref={ctaRef} className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticLink
                href="/register"
                className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white text-[14px] font-semibold px-6 py-3.5 rounded-full hover:bg-[#222] transition-all shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              >
                <span>Reserve Your Bay</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticLink>
              <a href="#features" className="text-[14px] font-medium text-[#6b6b6b] hover:text-[#0a0a0a] transition-colors flex items-center gap-1.5 group">
                <span>See how it works</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            {/* Hover bay indicator */}
            <div className={`mt-10 inline-flex items-center gap-3 transition-all duration-300 ${hoveredSpot ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`w-2 h-2 rounded-full ${hoveredSpot?.includes('EV') ? 'bg-[#059669]' : 'bg-red-500'} animate-pulse`} />
              <span className="text-[12px] text-[#6b6b6b] font-medium">
                {hoveredSpot ?? ""} — {hoveredSpot?.includes('EV') ? 'Available for charging' : 'Currently occupied'}
              </span>
            </div>
          </div>

          {/* Scroll hint */}
          <div ref={scrollHintRef} className="absolute bottom-10 left-6 lg:left-16 flex items-center gap-2 text-[11px] text-[#b0b0b0] font-medium tracking-[0.05em] uppercase">
            <ChevronDown className="w-4 h-4" />
            <span>Scroll to explore</span>
          </div>
        </div>

        {/* RIGHT: 3D Scene */}
        <div className="relative h-[50vh] lg:h-auto" ref={sceneContainerRef}>
          {/* Soft background gradient behind the scene */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f8fffe] via-[#f0fdf4] to-[#fafafa]" />
          <HeroScene onHover={handleHover} />

          {/* Floating stat chips */}
          <div className="absolute top-1/4 left-6 glass rounded-2xl px-4 py-3 shadow-lg pointer-events-none">
            <div className="text-[10px] text-[#6b6b6b] font-medium uppercase tracking-[0.08em]">Active Reservations</div>
            <div className="text-[22px] font-bold tracking-[-0.03em] text-[#0a0a0a] mt-0.5">1,284</div>
          </div>
          <div className="absolute bottom-1/4 right-6 glass rounded-2xl px-4 py-3 shadow-lg pointer-events-none">
            <div className="text-[10px] text-[#059669] font-semibold uppercase tracking-[0.08em] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              Live Occupancy
            </div>
            <div className="text-[22px] font-bold tracking-[-0.03em] text-[#0a0a0a] mt-0.5">78%</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Marquee strip
      ═══════════════════════════════════════════════════ */}
      <div className="border-y border-[#ebebeb] py-3.5 bg-[#fafafa] overflow-hidden select-none">
        <div
          className="flex gap-12 whitespace-nowrap text-[12px] font-medium text-[#b0b0b0] uppercase tracking-[0.08em]"
          style={{ animation: "marquee 28s linear infinite" }}
        >
          {[...Array(3)].flatMap((_, i) => [
            <span key={`ev-${i}`}>EV Charging</span>,
            <span key={`sp-${i}`} className="text-[#d0d0d0]">·</span>,
            <span key={`al-${i}`}>Atomic Locking</span>,
            <span key={`s2-${i}`} className="text-[#d0d0d0]">·</span>,
            <span key={`go-${i}`}>Go Backend</span>,
            <span key={`s3-${i}`} className="text-[#d0d0d0]">·</span>,
            <span key={`nb-${i}`}>Next.js 16</span>,
            <span key={`s4-${i}`} className="text-[#d0d0d0]">·</span>,
            <span key={`rw-${i}`}>Row-Level Locks</span>,
            <span key={`s5-${i}`} className="text-[#d0d0d0]">·</span>,
            <span key={`rj-${i}`}>JWT Auth</span>,
            <span key={`s6-${i}`} className="text-[#d0d0d0]">·</span>,
            <span key={`gm-${i}`}>GORM</span>,
            <span key={`s7-${i}`} className="text-[#d0d0d0]">·</span>,
            <span key={`ne-${i}`}>NeonDB</span>,
            <span key={`s8-${i}`} className="text-[#d0d0d0]">·</span>,
          ])}
        </div>
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
        `}</style>
      </div>

      {/* ═══════════════════════════════════════════════════
          Features
      ═══════════════════════════════════════════════════ */}
      <section id="features" className="py-32 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="mb-16 max-w-xl">
          <h2
            ref={featureTitleRef}
            className="text-[clamp(32px,4vw,52px)] font-bold leading-[1.1] tracking-[-0.03em] text-[#0a0a0a]"
          >
            Built for airports.<br />
            <span className="text-[#059669]">Proven at scale.</span>
          </h2>
          <p className="mt-4 text-[15px] text-[#6b6b6b] leading-relaxed">
            Every reservation is backed by a GORM transaction with row-level locking — guaranteeing atomicity even with hundreds of simultaneous bookings.
          </p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <TiltCard
            icon={<div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center"><Cpu className="w-5 h-5 text-[#059669]" /></div>}
            title="Atomic Transaction Locks"
            desc="PostgreSQL FOR UPDATE row locks prevent any two drivers from claiming the same spot — even at the exact same millisecond under heavy load."
          />
          <TiltCard
            icon={<div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center"><Zap className="w-5 h-5 text-blue-500" /></div>}
            title="EV Charging Zones"
            desc="Segmented zone types — General, Covered, and EV Charging — with live capacity tracking and per-hour pricing exposed via a clean REST API."
          />
          <TiltCard
            icon={<div className="w-10 h-10 rounded-xl bg-[#fdf4ff] flex items-center justify-center"><Shield className="w-5 h-5 text-purple-500" /></div>}
            title="Role-Based Access"
            desc="Middleware guards separate Admin operations (zone CRUD, global audit) from Driver actions (browse, book, cancel) using JWT bearer authentication."
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          How It Works — numbered steps
      ═══════════════════════════════════════════════════ */}
      <section id="how" className="py-24 bg-[#f8f8f8] border-y border-[#ebebeb]">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold tracking-[-0.03em] text-center mb-20">
            Three steps to your bay.
          </h2>
          <div ref={processRef} className="space-y-0">
            {[
              { n: "01", title: "Create your account", desc: "Register as a Driver or Admin in seconds. Your JWT session is issued instantly." },
              { n: "02", title: "Browse available zones", desc: "See real-time capacities, zone types, and pricing across all bays." },
              { n: "03", title: "Reserve atomically", desc: "One click — a single PostgreSQL transaction locks and secures your spot. No double-booking, ever." },
            ].map(({ n, title, desc }, i) => (
              <div key={n} className={`flex gap-8 py-10 ${i < 2 ? 'border-b border-[#e5e5e5]' : ''}`}>
                <div className="text-[clamp(36px,5vw,64px)] font-bold tracking-[-0.05em] text-[#e5e5e5] leading-none select-none w-20 shrink-0">{n}</div>
                <div className="pt-1">
                  <h3 className="text-[18px] font-semibold text-[#0a0a0a] mb-2 tracking-[-0.01em]">{title}</h3>
                  <p className="text-[14px] text-[#6b6b6b] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          Stats
      ═══════════════════════════════════════════════════ */}
      <section id="stats" className="py-24 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 divide-[#ebebeb]">
          <Stat value="99.9%" label="Reservation Accuracy" />
          <Stat value="<10ms" label="Lock Handshake" />
          <Stat value="100%" label="JWT Integrity" />
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="mx-4 mb-16 rounded-3xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#0a0a0a] px-8 py-20 text-center overflow-hidden relative">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10">
          <h2 className="text-[clamp(28px,4vw,52px)] font-bold tracking-[-0.04em] text-neutral-900 mb-4">
            Your EV spot is waiting.
          </h2>
          <p className="text-[15px] text-[#6b6b6b] mb-10 max-w-md mx-auto">
            Stop circling. Start charging. Reserve your bay now with a guaranteed atomic lock.
          </p>
          <MagneticLink
            href="/register"
            className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white text-[14px] font-semibold px-8 py-4 rounded-full transition-all shadow-[0_4px_24px_rgba(5,150,105,0.2)] hover:shadow-[0_8px_40px_rgba(5,150,105,0.3)]"
          >
            <span>Get Started — Free</span>
            <ArrowRight className="w-4 h-4" />
          </MagneticLink>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#ebebeb] py-10 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#b0b0b0]">
          <div className="flex items-center gap-2 font-medium text-[#6b6b6b]">
            <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[#059669] text-white text-[9px] font-bold">S</span>
            SpotSync © 2026
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-[#6b6b6b] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#6b6b6b] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#6b6b6b] transition-colors">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
