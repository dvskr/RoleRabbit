'use client';

import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    useInView,
    useMotionValue,
    useVelocity,
    useAnimationFrame,
  } from "framer-motion";
  import { useRef, useState, useEffect } from "react";
  import {
    Sparkles,
    Zap,
    Target,
    TrendingUp,
    Users,
    Shield,
    Rocket,
    CheckCircle2,
    ArrowRight,
    Star,
    Globe,
    Briefcase,
    Brain,
    ChevronRight,
    BarChart3,
    Clock,
    Layers,
    Code,
    Palette,
    MessageSquare,
    Check,
    Linkedin,
    Facebook,
    Instagram,
    Github,
    Youtube,
    Mail,
  } from "lucide-react";
  
  interface LandingPageProps {
    onEnterApp?: () => void;
  }
  
  export function LandingPage({ onEnterApp }: LandingPageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start start", "end end"],
    });
  
    return (
      <div
        ref={containerRef}
        className="landing-page relative bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden"
      >
        {/* Animated gradient mesh background */}
        <AnimatedMeshGradient scrollProgress={scrollYProgress} />
  
        {/* Floating particles */}
        <FloatingParticles />
  
        {/* Navigation */}
        <Navigation onEnterApp={onEnterApp} />
  
        {/* Hero Section */}
        <HeroSection
          onEnterApp={onEnterApp}
          scrollProgress={scrollYProgress}
        />
  
        {/* Sliding Feature Showcase */}
        <SlidingFeatureShowcase />
  
        {/* Social Proof */}
        <SocialProof />
  
        {/* Features Grid */}
        <FeaturesGrid />
  
        {/* Stats Section */}
        <StatsSection />
  
        {/* Use Cases */}
        <UseCasesSection />
  
        {/* Dashboard Preview Scroll */}
        <DashboardPreviewScroll />
  
        {/* Pricing Section */}
        <PricingSection />
  
        {/* Testimonials */}
        <TestimonialsSection />
  
        {/* Footer */}
        <Footer />
      </div>
    );
  }
  
  // Animated Mesh Gradient Background
  function AnimatedMeshGradient({
    scrollProgress,
  }: {
    scrollProgress: any;
  }) {
    const y1 = useTransform(
      scrollProgress,
      [0, 1],
      ["0%", "100%"],
    );
    const y2 = useTransform(
      scrollProgress,
      [0, 1],
      ["0%", "-100%"],
    );
    const opacity = useTransform(
      scrollProgress,
      [0, 0.5, 1],
      [0.3, 0.15, 0.3],
    );
  
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          style={{ y: y2, opacity }}
          className="absolute top-1/3 -right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          style={{ y: y1, opacity }}
          className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
        />
  
        {/* Animated grid overlay */}
        <motion.div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px),
                             linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
            y: useTransform(
              scrollProgress,
              [0, 1],
              ["0%", "10%"],
            ),
          }}
        />
      </div>
    );
  }
  
  // Floating Particles
  function FloatingParticles() {
    const particles = Array.from({ length: 30 });
  
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-teal-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: 20 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}
      </div>
    );
  }
  
  // X (Twitter) Icon Component - Double-line outlined style
  function XIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        {/* Top-left to bottom-right diagonal - double line with gap */}
        <path
          d="M6.7 5.7L17.7 16.7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5.3 4.3L16.3 15.3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Top-right to bottom-left diagonal - double line with gap */}
        <path
          d="M16.3 5.7L5.3 16.7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M17.7 4.3L6.7 15.3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Navigation with scroll effect
  function Navigation({
    onEnterApp,
  }: {
    onEnterApp?: () => void;
  }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("");
  
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 50);
  
        // Track active section
        const sections = ["features", "pricing", "testimonials"];
        const scrollPosition = window.scrollY + 100; // Offset for navbar
  
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (
              scrollPosition >= offsetTop &&
              scrollPosition < offsetTop + offsetHeight
            ) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      };
  
      window.addEventListener("scroll", handleScroll);
      handleScroll(); // Check on mount
      return () =>
        window.removeEventListener("scroll", handleScroll);
    }, []);
  
    const handleNavClick = (sectionId: string) => {
      console.log("handleNavClick called with:", sectionId);
      const element = document.getElementById(sectionId);
      console.log("Element found:", element);
  
      if (element) {
        // Get navbar height
        const navHeight = 80;
  
        // Get element position
        const elementPosition =
          element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - navHeight;
  
        console.log("Scrolling to:", offsetPosition);
  
        // Smooth scroll to position
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        console.error("Element not found with id:", sectionId);
      }
    };
  
    return (
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-4 pb-4 px-4"
      >
        <div className="max-w-7xl w-full mx-auto px-6">
          <div className="rounded-full backdrop-blur-xl border border-white/[0.15] shadow-xl">
            <div className="px-6 py-3.5 flex items-center justify-between">
    
              {/* Center Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {["Features", "Pricing", "Testimonials"].map(
                  (item, i) => {
                    const sectionId = item.toLowerCase();
                    const isActive = activeSection === sectionId;
    
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          console.log("BUTTON CLICKED:", item);
                          handleNavClick(sectionId);
                        }}
                        className="relative py-2 px-4 cursor-pointer bg-transparent border-none outline-none"
                      >
                        <span className="text-base font-medium text-gray-300 hover:text-gray-200 transition-colors">
                          {item}
                        </span>
    
                        {/* Vibrant green underline - always visible */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 rounded-full" />
                      </button>
                    );
                  },
                )}
              </div>
    
              {/* Right Buttons */}
              <div className="flex items-center gap-4">
                <motion.a
                  href="/login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-base text-white font-semibold hover:text-gray-200 transition-colors px-5 py-2 rounded-lg bg-gray-800/80 border border-gray-500/50 hover:border-gray-400/70 cursor-pointer"
                >
                  Sign In
                </motion.a>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={onEnterApp}
                  className="text-base px-6 py-2.5 rounded-lg bg-white text-gray-800 hover:bg-gray-50 transition-all font-semibold"
                >
                  Get Started Free
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    );
  }
  
  // Magnetic Button Component
  function MagneticButton({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) {
    const ref = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
  
    const handleMouse = (
      e: React.MouseEvent<HTMLButtonElement>,
    ) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } =
        e.currentTarget.getBoundingClientRect();
      const x = (clientX - (left + width / 2)) * 0.3;
      const y = (clientY - (top + height / 2)) * 0.3;
      setPosition({ x, y });
    };
  
    const reset = () => setPosition({ x: 0, y: 0 });
  
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        animate={position}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        }}
        className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:shadow-lg hover:shadow-teal-500/50 transition-all text-sm overflow-hidden group"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={false}
        />
        {children}
      </motion.button>
    );
  }
  
  // Hero Section with large centered rabbit logo
  function HeroSection({
    onEnterApp,
    scrollProgress,
  }: {
    onEnterApp?: () => void;
    scrollProgress: any;
  }) {
    const y = useTransform(scrollProgress, [0, 0.3], [0, 200]);
    const opacity = useTransform(
      scrollProgress,
      [0, 0.3],
      [1, 0],
    );
    const scale = useTransform(
      scrollProgress,
      [0, 0.3],
      [1, 0.95],
    );
  
    return (
      <section className="relative min-h-[55vh] flex items-center justify-center pt-20 pb-12 overflow-hidden">
        <motion.div
          style={{ y, opacity, scale }}
          className="relative max-w-6xl mx-auto px-6 text-center z-10"
        >
  
          {/* Animated headline with text reveal */}
          <div className="mb-6 overflow-hidden">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight"
            >
              {["Land", "your", "dream", "job,"].map(
                (word, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.5 + i * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="inline-block mr-4"
                  >
                    {word}
                  </motion.span>
                ),
              )}
              <br />
              <motion.span
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.9,
                  type: "spring",
                  stiffness: 100,
                }}
                className="inline-block bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
              >
                <AnimatedGradientText text="faster than ever" />
              </motion.span>
            </motion.h1>
          </div>
  
          {/* Description with stagger */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            AI-powered job tracking, intelligent insights, and
            seamless application management.
            <br className="hidden md:block" />
            Everything you need to accelerate your career journey.
          </motion.p>
  
          {/* CTA Buttons with hover effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <motion.button
              onClick={onEnterApp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-lg font-medium shadow-lg shadow-teal-500/25 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ type: "tween", duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </span>
            </motion.button>
  
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 transition-all text-lg font-medium flex items-center gap-2"
            >
              <Globe size={20} />
              View Demo
            </motion.button>
          </motion.div>
  
          {/* Trust indicators with slide in */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          >
            {[
              {
                icon: CheckCircle2,
                text: "No credit card required",
              },
              { icon: CheckCircle2, text: "Free forever plan" },
              { icon: Shield, text: "Enterprise-grade security" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <item.icon size={16} className="text-teal-400" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
  
        {/* Animated decorative elements */}
        <AnimatedOrbs />
      </section>
    );
  }
  
  // Animated gradient text
  function AnimatedGradientText({ text }: { text: string }) {
    return (
      <motion.span
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: "200% 200%",
          backgroundImage:
            "linear-gradient(90deg, #2dd4bf, #22d3ee, #3b82f6, #2dd4bf)",
        }}
        className="bg-clip-text text-transparent"
      >
        {text}
      </motion.span>
    );
  }
  
  // Animated floating orbs
  function AnimatedOrbs() {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-72 h-72 rounded-full"
            style={{
              background: `radial-gradient(circle, ${
                i === 0
                  ? "rgba(20, 184, 166, 0.15)"
                  : i === 1
                    ? "rgba(34, 211, 238, 0.15)"
                    : "rgba(59, 130, 246, 0.15)"
              } 0%, transparent 70%)`,
              filter: "blur(40px)",
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: [
                Math.random() * 400 - 200,
                Math.random() * 400 - 200,
                Math.random() * 400 - 200,
              ],
              y: [
                Math.random() * 400 - 200,
                Math.random() * 400 - 200,
                Math.random() * 400 - 200,
              ],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }
  
  // Sliding Feature Showcase - Shows all app features
  function SlidingFeatureShowcase() {
    const features = [
      {
        title: "Dashboard Overview",
        description: "Track all your applications at a glance",
        icon: BarChart3,
        gradient: "from-teal-500 to-cyan-500",
        mockup: "dashboard",
      },
      {
        title: "Job Tracking",
        description: "Organize applications with smart filters",
        icon: Target,
        gradient: "from-purple-500 to-pink-500",
        mockup: "tracking",
      },
      {
        title: "Analytics & Insights",
        description: "Visualize your job search progress",
        icon: TrendingUp,
        gradient: "from-blue-500 to-indigo-500",
        mockup: "analytics",
      },
      {
        title: "AI Resume Builder",
        description: "Create professional resumes instantly",
        icon: Brain,
        gradient: "from-orange-500 to-red-500",
        mockup: "resume",
      },
      {
        title: "Interview Prep",
        description: "Practice with AI-powered questions",
        icon: MessageSquare,
        gradient: "from-green-500 to-emerald-500",
        mockup: "interview",
      },
      {
        title: "Network Manager",
        description: "Connect with industry professionals",
        icon: Users,
        gradient: "from-yellow-500 to-orange-500",
        mockup: "network",
      },
      {
        title: "Document Storage",
        description: "Organize resumes and cover letters",
        icon: Layers,
        gradient: "from-pink-500 to-rose-500",
        mockup: "documents",
      },
      {
        title: "Calendar Integration",
        description: "Never miss an interview",
        icon: Clock,
        gradient: "from-cyan-500 to-blue-500",
        mockup: "calendar",
      },
    ];
  
    // Duplicate features for infinite scroll
    const duplicatedFeatures = [
      ...features,
      ...features,
      ...features,
    ];
  
    return (
      <section className="relative py-16 overflow-hidden border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 mb-3">
              Powerful features that transform your job search
            </p>
            <h2 className="text-3xl md:text-4xl text-white">
              All your career tools in one place
            </h2>
          </motion.div>
        </div>
  
        {/* First row - slides left */}
        <div className="relative mb-2.5">
          <motion.div
            animate={{
              x: [0, -1920],
            }}
            transition={{
              x: {
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            className="flex gap-3"
          >
            {duplicatedFeatures.map((feature, index) => (
              <SlidingFeatureCard
                key={`row1-${index}`}
                feature={feature}
                index={index}
              />
            ))}
          </motion.div>
        </div>
  
        {/* Second row - slides right */}
        <div className="relative">
          <motion.div
            animate={{
              x: [-1920, 0],
            }}
            transition={{
              x: {
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            className="flex gap-3"
          >
            {duplicatedFeatures
              .slice()
              .reverse()
              .map((feature, index) => (
                <SlidingFeatureCard
                  key={`row2-${index}`}
                  feature={feature}
                  index={index}
                  reverse
                />
              ))}
          </motion.div>
        </div>
  
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10" />
      </section>
    );
  }
  
  function SlidingFeatureCard({
    feature,
    index,
    reverse,
  }: {
    feature: any;
    index: number;
    reverse?: boolean;
  }) {
    const Icon = feature.icon;
  
    return (
      <div className="flex-shrink-0 w-44 rounded-lg bg-[#0f0f0f] border border-white/[0.08] p-3 cursor-pointer overflow-hidden hover:border-white/[0.12] transition-colors">
        <div className="flex flex-col">
          {/* Icon */}
          <div
            className={`inline-flex p-1.5 rounded bg-gradient-to-br ${feature.gradient} mb-2 w-fit`}
          >
            <Icon size={14} className="text-white" />
          </div>
  
          {/* Title & Description */}
          <h3 className="text-xs mb-1 text-white truncate">
            {feature.title}
          </h3>
          <p className="text-[10px] text-gray-500 mb-2 line-clamp-2 leading-tight">
            {feature.description}
          </p>
  
          {/* Mockup Preview */}
          <div className="rounded bg-black/60 border border-white/[0.06] p-2 overflow-hidden h-[70px]">
            <FeatureMockup
              type={feature.mockup}
              gradient={feature.gradient}
            />
          </div>
        </div>
      </div>
    );
  }
  
  function FeatureMockup({
    type,
    gradient,
  }: {
    type: string;
    gradient: string;
  }) {
    // Different mockup visualizations for different features - minimal style
    switch (type) {
      case "dashboard":
        return (
          <div className="space-y-0.5 h-full">
            <div className="flex gap-0.5">
              <div
                className={`h-5 flex-1 rounded-sm bg-gradient-to-r ${gradient} opacity-25`}
              />
              <div
                className={`h-5 flex-1 rounded-sm bg-gradient-to-r ${gradient} opacity-25`}
              />
            </div>
            <div
              className={`h-8 rounded-sm bg-gradient-to-r ${gradient} opacity-20`}
            />
          </div>
        );
  
      case "tracking":
        return (
          <div className="space-y-0.5 h-full">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-3.5 rounded-sm bg-gradient-to-r ${gradient}`}
                style={{ opacity: 0.3 - i * 0.05 }}
              />
            ))}
          </div>
        );
  
      case "analytics":
        return (
          <div className="h-full flex items-end gap-0.5">
            {[40, 65, 45, 85, 55, 70, 60].map((height, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-sm bg-gradient-to-t ${gradient} opacity-30`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        );
  
      case "resume":
        return (
          <div className="space-y-1 h-full">
            <div className="flex items-center gap-1">
              <div
                className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} opacity-35 flex-shrink-0`}
              />
              <div className="flex-1 space-y-0.5 min-w-0">
                <div className="h-0.5 bg-white/15 rounded w-3/4" />
                <div className="h-0.5 bg-white/10 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 bg-white/10 rounded"
                  style={{ width: `${85 - i * 10}%` }}
                />
              ))}
            </div>
          </div>
        );
  
      case "interview":
        return (
          <div className="space-y-1 h-full">
            <div
              className={`p-1.5 rounded bg-gradient-to-r ${gradient} opacity-20`}
            >
              <div className="h-0.5 bg-white/25 rounded w-5/6 mb-0.5" />
              <div className="h-0.5 bg-white/20 rounded w-4/6" />
            </div>
            <div className="flex justify-end">
              <div className="p-1.5 rounded bg-white/[0.08] max-w-[75%]">
                <div className="h-0.5 bg-white/25 rounded w-full mb-0.5" />
                <div className="h-0.5 bg-white/20 rounded w-3/4" />
              </div>
            </div>
          </div>
        );
  
      case "network":
        return (
          <div className="grid grid-cols-3 gap-0.5 h-full">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-sm bg-gradient-to-br ${gradient}`}
                style={{ opacity: 0.3 - (i % 3) * 0.05 }}
              />
            ))}
          </div>
        );
  
      case "documents":
        return (
          <div className="grid grid-cols-3 gap-0.5 h-full">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`aspect-[3/4] rounded-sm bg-gradient-to-br ${gradient} opacity-20`}
              />
            ))}
          </div>
        );
  
      case "calendar":
        return (
          <div className="grid grid-cols-7 gap-0.5">
            {[...Array(35)].map((_, i) => {
              const isHighlighted = [5, 12, 18, 24].includes(i);
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-sm ${
                    isHighlighted
                      ? `bg-gradient-to-br ${gradient} opacity-35`
                      : "bg-white/[0.06]"
                  }`}
                />
              );
            })}
          </div>
        );
  
      default:
        return (
          <div
            className={`h-full rounded bg-gradient-to-br ${gradient} opacity-20`}
          />
        );
    }
  }
  
  // Social Proof with animation
  function SocialProof() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
  
    const companies = [
      { name: "Google", color: "from-blue-500 to-green-500" },
      { name: "Meta", color: "from-blue-600 to-purple-600" },
      { name: "Amazon", color: "from-orange-500 to-yellow-500" },
      { name: "Microsoft", color: "from-blue-500 to-cyan-500" },
      { name: "Apple", color: "from-gray-400 to-gray-200" },
      { name: "Netflix", color: "from-red-600 to-red-500" },
    ];
  
    return (
      <section
        ref={ref}
        className="relative py-24 px-6 overflow-hidden"
      >
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/[0.02] to-transparent" />
  
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-sm tracking-wider uppercase text-gray-500 mb-3">
              Trusted by ambitious professionals at
            </p>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
          </motion.div>
  
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {companies.map((company, i) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={
                  isInView ? { opacity: 1, y: 0, scale: 1 } : {}
                }
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                }}
                className="group relative"
              >
                {/* Glassmorphic card */}
                <div className="relative h-24 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] backdrop-blur-sm flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.06]">
                  {/* Gradient glow on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${company.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 blur-xl`}
                  />
  
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
                    }}
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: 0,
                      ease: "easeInOut",
                    }}
                  />
  
                  {/* Company name */}
                  <motion.span
                    className={`relative text-xl font-semibold bg-gradient-to-br ${company.color} bg-clip-text text-transparent opacity-40 group-hover:opacity-100 transition-all duration-300`}
                  >
                    {company.name}
                  </motion.span>
  
                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/0 group-hover:border-white/10 rounded-tl-2xl transition-all duration-300" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/0 group-hover:border-white/10 rounded-br-2xl transition-all duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
  
          {/* Bottom decorative line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
          />
        </div>
      </section>
    );
  }
  
  // Features Grid with advanced hover effects
  function FeaturesGrid() {
    const features = [
      {
        icon: Brain,
        title: "AI-Powered Insights",
        description:
          "Get intelligent recommendations tailored to your career goals and experience.",
        color: "from-purple-500 to-pink-500",
      },
      {
        icon: Zap,
        title: "Lightning Fast",
        description:
          "Apply to multiple jobs in seconds with smart autofill and templates.",
        color: "from-yellow-500 to-orange-500",
      },
      {
        icon: Target,
        title: "Smart Tracking",
        description:
          "Never miss an opportunity with intelligent job application tracking.",
        color: "from-teal-500 to-cyan-500",
      },
      {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description:
          "Visualize your progress with beautiful charts and metrics.",
        color: "from-blue-500 to-indigo-500",
      },
      {
        icon: Shield,
        title: "Secure & Private",
        description:
          "Your data is encrypted and secure. We never sell your information.",
        color: "from-green-500 to-emerald-500",
      },
      {
        icon: Layers,
        title: "All-in-One Platform",
        description:
          "Resume builder, cover letters, portfolio—everything in one place.",
        color: "from-red-500 to-pink-500",
      },
    ];
  
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
  
    return (
      <section
        id="features"
        ref={ref}
        className="relative py-20 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 text-white leading-normal break-words px-4">
                Everything you need to succeed
              </h2>
              <p className="text-lg md:text-xl text-gray-400">
                Powerful tools designed for modern job seekers
              </p>
            </motion.div>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                feature={feature}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  function FeatureCard({ feature, index, isInView }: any) {
    const Icon = feature.icon;
    const ref = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({
      x: 0,
      y: 0,
    });
    const [isHovered, setIsHovered] = useState(false);
  
    const handleMouseMove = (
      e: React.MouseEvent<HTMLDivElement>,
    ) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };
  
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{
          delay: index * 0.1,
          type: "spring",
          stiffness: 100,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all overflow-hidden"
      >
        {/* Spotlight effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(20, 184, 166, 0.06), transparent 40%)`,
          }}
        />
  
        {/* Gradient border effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: `linear-gradient(135deg, transparent 0%, ${
              isHovered
                ? "rgba(20, 184, 166, 0.1)"
                : "transparent"
            } 100%)`,
          }}
        />
  
        <div className="relative z-10">
          <motion.div
            className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon size={24} className="text-white" />
          </motion.div>
  
          <h3 className="text-2xl mb-3">{feature.title}</h3>
          <p className="text-gray-400 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </motion.div>
    );
  }
  
  // Interactive 3D Showcase
  function InteractiveShowcase() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
  
    const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
    const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);
  
    const handleMouseMove = (
      e: React.MouseEvent<HTMLDivElement>,
    ) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };
  
    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };
  
    return (
      <section
        ref={ref}
        className="relative py-32 px-6 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl mb-6">
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Beautifully crafted
              </span>
              <br />
              for maximum impact
            </h2>
          </motion.div>
  
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative mx-auto max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="relative p-12 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Floating cards */}
              <motion.div
                style={{ transform: "translateZ(50px)" }}
                className="grid grid-cols-3 gap-4 mb-8"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ scale: 1.05, z: 100 }}
                    className="aspect-square rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-white/10 p-4 flex items-center justify-center"
                  >
                  </motion.div>
                ))}
              </motion.div>
  
              {/* Animated stats */}
              <motion.div
                style={{ transform: "translateZ(75px)" }}
                className="grid grid-cols-3 gap-4"
              >
                {["50K+ Users", "1M+ Jobs", "95% Success"].map(
                  (stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={
                        isInView ? { opacity: 1, y: 0 } : {}
                      }
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="text-center p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="text-2xl bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        {stat}
                      </div>
                    </motion.div>
                  ),
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }
  
  // Infinite Feature Scroll - Horizontal scrolling dashboard widgets
  function InfiniteFeatureScroll() {
    const widgets = [
      {
        title: "Quick Actions",
        description: "One-click access to common tasks",
        color: "from-teal-500/20 to-cyan-500/20",
        border: "border-teal-500/30",
        content: (
          <div className="space-y-2">
            {[
              "Create Application",
              "Schedule Interview",
              "Update Resume",
              "Send Follow-up",
            ].map((action, i) => (
              <div
                key={i}
                className="px-3 py-2 bg-white/5 rounded-lg text-sm flex items-center gap-2"
              >
                <Zap size={14} className="text-teal-400" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Progress Metrics",
        description: "Track your application success",
        color: "from-purple-500/20 to-pink-500/20",
        border: "border-purple-500/30",
        content: (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Applications</span>
                <span className="text-purple-400">24/30</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Interviews</span>
                <span className="text-pink-400">8/10</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Upcoming Events",
        description: "Never miss an opportunity",
        color: "from-blue-500/20 to-indigo-500/20",
        border: "border-blue-500/30",
        content: (
          <div className="space-y-2">
            {[
              {
                title: "Interview - Google",
                time: "Today, 2:00 PM",
              },
              {
                title: "Follow-up - Meta",
                time: "Tomorrow, 10:00 AM",
              },
              {
                title: "Application Deadline",
                time: "Dec 15, 2025",
              },
            ].map((event, i) => (
              <div key={i} className="p-2 bg-white/5 rounded-lg">
                <div className="text-sm font-medium">
                  {event.title}
                </div>
                <div className="text-xs text-gray-500">
                  {event.time}
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Activity Feed",
        description: "Recent actions and updates",
        color: "from-green-500/20 to-emerald-500/20",
        border: "border-green-500/30",
        content: (
          <div className="space-y-2">
            {[
              {
                icon: CheckCircle2,
                text: "Application submitted to Tesla",
                color: "text-green-400",
              },
              {
                icon: Star,
                text: "Interview scheduled with Apple",
                color: "text-yellow-400",
              },
              {
                icon: TrendingUp,
                text: "Profile viewed by Amazon",
                color: "text-blue-400",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm"
                >
                  <Icon size={14} className={item.color} />
                  <span className="text-gray-400">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        ),
      },
      {
        title: "AI Insights",
        description: "Smart recommendations",
        color: "from-orange-500/20 to-red-500/20",
        border: "border-orange-500/30",
        content: (
          <div className="space-y-3">
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-start gap-2">
                <Brain
                  size={16}
                  className="text-orange-400 mt-1"
                />
                <div>
                  <div className="text-sm font-medium mb-1">
                    Resume Tip
                  </div>
                  <div className="text-xs text-gray-400">
                    Add "Python" to match 5 more jobs
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="flex items-start gap-2">
                <Sparkles
                  size={16}
                  className="text-red-400 mt-1"
                />
                <div>
                  <div className="text-sm font-medium mb-1">
                    Opportunity
                  </div>
                  <div className="text-xs text-gray-400">
                    3 new jobs match your profile
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Job Analytics",
        description: "Visualize your progress",
        color: "from-cyan-500/20 to-blue-500/20",
        border: "border-cyan-500/30",
        content: (
          <div className="h-full flex items-end justify-between gap-2 px-2 pb-2">
            {[65, 85, 45, 95, 75, 60, 80].map((height, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                  style={{ height: `${height}%` }}
                />
                <div className="text-[10px] text-gray-500">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "To-Do List",
        description: "Stay organized",
        color: "from-yellow-500/20 to-orange-500/20",
        border: "border-yellow-500/30",
        content: (
          <div className="space-y-2">
            {[
              { task: "Update LinkedIn profile", done: true },
              {
                task: "Prepare for Google interview",
                done: false,
              },
              { task: "Send thank you email", done: false },
              { task: "Review job descriptions", done: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    item.done
                      ? "border-yellow-500 bg-yellow-500/20"
                      : "border-white/20"
                  }`}
                >
                  {item.done && (
                    <CheckCircle2
                      size={10}
                      className="text-yellow-400"
                    />
                  )}
                </div>
                <span
                  className={`text-sm ${item.done ? "line-through text-gray-500" : "text-gray-300"}`}
                >
                  {item.task}
                </span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Premium Features",
        description: "Unlock advanced tools",
        color: "from-pink-500/20 to-rose-500/20",
        border: "border-pink-500/30",
        content: (
          <div className="space-y-2">
            {[
              {
                icon: Sparkles,
                text: "AI Cover Letter Generator",
                premium: true,
              },
              {
                icon: Brain,
                text: "Interview Question Predictor",
                premium: true,
              },
              {
                icon: TrendingUp,
                text: "Salary Insights",
                premium: false,
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-pink-400" />
                    <span className="text-sm">
                      {feature.text}
                    </span>
                  </div>
                  {feature.premium && (
                    <div className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded text-[10px]">
                      PRO
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ),
      },
    ];
  
    // Triple the widgets for seamless loop
    const tripleWidgets = [...widgets, ...widgets, ...widgets];
  
    return (
      <section className="relative py-16 overflow-hidden border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 mb-3">
              Customize your dashboard with intelligent components
            </p>
            <h2 className="text-3xl md:text-4xl text-white">
              Powerful widgets at your fingertips
            </h2>
          </motion.div>
        </div>
  
        {/* Scrolling widgets */}
        <div className="relative">
          <motion.div
            animate={{
              x: [0, -2400],
            }}
            transition={{
              x: {
                duration: 60,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            className="flex gap-4"
          >
            {tripleWidgets.map((widget, index) => (
              <div
                key={index}
                className={`flex-shrink-0 w-72 rounded-xl bg-gradient-to-br ${widget.color} border ${widget.border} p-5 cursor-pointer`}
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-base mb-1 text-white">
                      {widget.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {widget.description}
                    </p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {widget.content}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
  
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10" />
      </section>
    );
  }
  
  // Stats Section with counting animation
  function StatsSection() {
    const stats = [
      { value: 50000, suffix: "+", label: "Active Users" },
      { value: 1000000, suffix: "+", label: "Jobs Tracked" },
      { value: 95, suffix: "%", label: "Success Rate" },
      {
        value: 4.9,
        suffix: "/5",
        label: "User Rating",
        decimals: 1,
      },
    ];
  
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
  
    return (
      <section
        ref={ref}
        className="relative py-20 px-6 border-y border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <AnimatedStat
                key={index}
                stat={stat}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  function AnimatedStat({ stat, index, isInView }: any) {
    const [count, setCount] = useState(0);
  
    useEffect(() => {
      if (!isInView) return;
  
      const duration = 2000;
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
  
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setCount(stat.value);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, duration / steps);
  
      return () => clearInterval(timer);
    }, [isInView, stat.value]);
  
    const displayValue = stat.decimals
      ? count.toFixed(stat.decimals)
      : Math.floor(count).toLocaleString();
  
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{
          delay: index * 0.1,
          type: "spring",
          stiffness: 100,
        }}
        className="text-center group cursor-default"
      >
        <motion.div
          className="text-5xl md:text-6xl mb-2 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
          whileHover={{ scale: 1.1 }}
        >
          {displayValue}
          {stat.suffix}
        </motion.div>
        <div className="text-gray-400">{stat.label}</div>
      </motion.div>
    );
  }
  
  // Use Cases with parallax
  function UseCasesSection() {
    const useCases = [
      {
        icon: Briefcase,
        title: "For Job Seekers",
        description:
          "Track applications, prepare for interviews, and land your dream role faster.",
        features: [
          "Application tracking",
          "Interview prep",
          "Resume builder",
          "Cover letter AI",
        ],
        gradient: "from-teal-500/10 to-cyan-500/10",
      },
      {
        icon: TrendingUp,
        title: "For Career Switchers",
        description:
          "Navigate career transitions with confidence and strategic planning.",
        features: [
          "Skill gap analysis",
          "Learning roadmap",
          "Portfolio builder",
          "Networking tools",
        ],
        gradient: "from-purple-500/10 to-pink-500/10",
      },
      {
        icon: Code,
        title: "For Freelancers",
        description:
          "Manage multiple clients and opportunities in one organized place.",
        features: [
          "Client tracking",
          "Proposal templates",
          "Time tracking",
          "Invoice management",
        ],
        gradient: "from-blue-500/10 to-indigo-500/10",
      },
    ];
  
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
  
    return (
      <section ref={ref} className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl mb-4">
              Built for every journey
            </h2>
            <p className="text-xl text-gray-400">
              Whether you're job hunting, switching careers, or
              freelancing
            </p>
          </motion.div>
  
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <UseCaseCard
                key={index}
                useCase={useCase}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  function UseCaseCard({ useCase, index, isInView }: any) {
    const Icon = useCase.icon;
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: -10 }}
        animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{
          delay: index * 0.2,
          type: "spring",
          stiffness: 100,
        }}
        whileHover={{ y: -10, transition: { duration: 0.2 } }}
        className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 overflow-hidden"
      >
        {/* Animated background gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />
  
        <div className="relative z-10">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.2 }}
            transition={{ duration: 0.6 }}
            className="inline-flex p-4 rounded-xl bg-white/5 border border-white/10 mb-6"
          >
            <Icon size={28} className="text-teal-400" />
          </motion.div>
  
          <h3 className="text-2xl mb-3">{useCase.title}</h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            {useCase.description}
          </p>
  
          <ul className="space-y-3">
            {useCase.features.map(
              (feature: string, i: number) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: index * 0.2 + 0.1 * i }}
                  className="flex items-center gap-3 text-sm text-gray-400"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle2
                      size={16}
                      className="text-teal-400 flex-shrink-0"
                    />
                  </motion.div>
                  {feature}
                </motion.li>
              ),
            )}
          </ul>
        </div>
      </motion.div>
    );
  }
  
  // Dashboard Preview Scroll - Shows full dashboard views
  function DashboardPreviewScroll() {
    const dashboardViews = [
      {
        title: "Main Dashboard",
        description: "Your central command center",
        theme: "dark",
        preview: (
          <div className="w-full h-full bg-[#0f1419] rounded-lg p-4 space-y-3 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm truncate">
                  Dashboard
                </span>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/30" />
              </div>
            </div>
  
            {/* Metrics */}
            <div className="grid grid-cols-4 gap-2">
              {[
                {
                  label: "Applications",
                  value: "24",
                  color: "teal",
                },
                {
                  label: "Interviews",
                  value: "8",
                  color: "purple",
                },
                { label: "Offers", value: "2", color: "green" },
                {
                  label: "Response",
                  value: "65%",
                  color: "blue",
                },
              ].map((metric, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg bg-${metric.color}-500/10 border border-${metric.color}-500/20 overflow-hidden`}
                >
                  <div
                    className={`text-lg text-${metric.color}-400 mb-0.5 truncate`}
                  >
                    {metric.value}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
  
            {/* Chart */}
            <div className="h-24 bg-white/5 rounded-lg p-2 flex items-end gap-1">
              {[60, 80, 45, 90, 70, 85, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-teal-500 to-cyan-500 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        ),
      },
      {
        title: "Applications View",
        description: "Track all your job applications",
        theme: "dark",
        preview: (
          <div className="w-full h-full bg-[#0f1419] rounded-lg p-4 space-y-2 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm truncate">
                Active Applications
              </h3>
              <button className="px-2 py-1 bg-teal-500/20 rounded text-xs text-teal-400 flex-shrink-0">
                + New
              </button>
            </div>
            {[
              {
                company: "Google",
                role: "Software Engineer",
                status: "Interview",
                color: "green",
              },
              {
                company: "Meta",
                role: "Product Manager",
                status: "Applied",
                color: "blue",
              },
              {
                company: "Amazon",
                role: "UX Designer",
                status: "Offer",
                color: "purple",
              },
              {
                company: "Apple",
                role: "Data Scientist",
                status: "Rejected",
                color: "red",
              },
            ].map((app, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors overflow-hidden"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-xs flex-shrink-0">
                    {app.company[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {app.company}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {app.role}
                    </div>
                  </div>
                </div>
                <div
                  className={`px-1.5 py-0.5 bg-${app.color}-500/20 rounded text-[10px] text-${app.color}-400 flex-shrink-0`}
                >
                  {app.status}
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Analytics Dashboard",
        description: "Deep insights into your job search",
        theme: "dark",
        preview: (
          <div className="w-full h-full bg-[#0f1419] rounded-lg p-4 space-y-3 overflow-hidden">
            <h3 className="text-sm mb-2 truncate">
              Performance Metrics
            </h3>
  
            {/* Progress bars */}
            <div className="space-y-2">
              {[
                {
                  label: "Application Rate",
                  value: 85,
                  color: "from-teal-500 to-cyan-500",
                },
                {
                  label: "Response Rate",
                  value: 65,
                  color: "from-purple-500 to-pink-500",
                },
                {
                  label: "Interview Rate",
                  value: 40,
                  color: "from-blue-500 to-indigo-500",
                },
              ].map((metric, i) => (
                <div key={i} className="overflow-hidden">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-400 truncate">
                      {metric.label}
                    </span>
                    <span className="text-white flex-shrink-0">
                      {metric.value}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
  
            {/* Mini chart */}
            <div className="h-20 flex items-end gap-1 mt-3">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-teal-500/50 to-cyan-500/50 rounded-t"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </div>
        ),
      },
      {
        title: "Profile Settings",
        description: "Customize your experience",
        theme: "dark",
        preview: (
          <div className="w-full h-full bg-[#0f1419] rounded-lg p-4 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-lg flex-shrink-0">
                JD
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  John Doe
                </div>
                <div className="text-xs text-gray-500 truncate">
                  john.doe@email.com
                </div>
              </div>
            </div>
  
            <div className="space-y-2">
              {[
                { label: "Email Notifications", enabled: true },
                { label: "Dark Mode", enabled: true },
                { label: "AI Suggestions", enabled: true },
                { label: "Weekly Reports", enabled: false },
              ].map((setting, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg overflow-hidden"
                >
                  <span className="text-xs truncate">
                    {setting.label}
                  </span>
                  <div
                    className={`w-8 h-4 rounded-full ${setting.enabled ? "bg-teal-500" : "bg-gray-600"} relative flex-shrink-0`}
                  >
                    <div
                      className={`absolute top-0.5 ${setting.enabled ? "right-0.5" : "left-0.5"} w-3 h-3 bg-white rounded-full transition-all`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title: "Calendar View",
        description: "Schedule and manage interviews",
        theme: "dark",
        preview: (
          <div className="w-full h-full bg-[#0f1419] rounded-lg p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm truncate">December 2025</h3>
              <div className="flex gap-1 flex-shrink-0">
                <button className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px]">
                  ←
                </button>
                <button className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px]">
                  →
                </button>
              </div>
            </div>
  
            <div className="grid grid-cols-7 gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map(
                (day, i) => (
                  <div
                    key={i}
                    className="text-center text-[10px] text-gray-500 py-0.5"
                  >
                    {day}
                  </div>
                ),
              )}
              {Array.from({ length: 35 }).map((_, i) => {
                const hasEvent = [5, 12, 18, 24].includes(i);
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded flex items-center justify-center text-[10px] ${
                      hasEvent
                        ? "bg-teal-500/20 border border-teal-500/50 text-teal-400"
                        : "bg-white/5 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        ),
      },
      {
        title: "Documents Center",
        description: "All your career documents",
        theme: "dark",
        preview: (
          <div className="w-full h-full bg-[#0f1419] rounded-lg p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm truncate">My Documents</h3>
              <button className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-400 flex-shrink-0">
                Upload
              </button>
            </div>
  
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Resume.pdf", type: "PDF", color: "red" },
                {
                  name: "Cover_Letter.docx",
                  type: "DOC",
                  color: "blue",
                },
                {
                  name: "Portfolio.pdf",
                  type: "PDF",
                  color: "purple",
                },
                {
                  name: "Transcript.pdf",
                  type: "PDF",
                  color: "green",
                },
                {
                  name: "References.pdf",
                  type: "PDF",
                  color: "orange",
                },
                {
                  name: "Certificates.zip",
                  type: "ZIP",
                  color: "yellow",
                },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center border border-white/10 hover:border-white/20 transition-colors cursor-pointer overflow-hidden"
                >
                  <div
                    className={`w-8 h-8 rounded bg-${doc.color}-500/20 flex items-center justify-center text-[10px] text-${doc.color}-400 mb-1 flex-shrink-0`}
                  >
                    {doc.type}
                  </div>
                  <div className="text-[10px] text-center truncate w-full">
                    {doc.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ];
  
    // Duplicate for infinite scroll
    const duplicatedViews = [
      ...dashboardViews,
      ...dashboardViews,
    ];
  
    return (
      <section className="relative py-16 px-6 overflow-hidden border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 mb-3">
              Explore every corner of your new career companion
            </p>
            <h2 className="text-3xl md:text-4xl text-white">
              See RoleRabbit in action
            </h2>
          </motion.div>
        </div>
  
        {/* Scrolling dashboard views */}
        <div className="relative">
          <motion.div
            animate={{
              x: [0, -3600],
            }}
            transition={{
              x: {
                duration: 80,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            className="flex gap-5"
          >
            {duplicatedViews.map((view, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[560px] cursor-pointer"
              >
                <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#0f0f0f]">
                  {/* Preview window */}
                  <div className="h-[360px] p-2 overflow-hidden">
                    {view.preview}
                  </div>
  
                  {/* Info bar */}
                  <div className="p-5 border-t border-white/[0.06]">
                    <h3 className="text-base mb-1 text-white">
                      {view.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {view.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
  
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10" />
      </section>
    );
  }
  
  // Pricing Section
  function PricingSection() {
    const [billingCycle, setBillingCycle] = useState<
      "monthly" | "annual"
    >("monthly");
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
  
    const plans = [
      {
        name: "Free",
        subtitle: "Perfect for getting started",
        price: { monthly: 0, annual: 0 },
        period: "forever",
        features: [
          "Basic resume builder",
          "1 portfolio",
          "Track up to 10 jobs",
          "Basic templates",
          "Community access",
          "Ads included",
        ],
        cta: "Start Free",
        popular: false,
        gradient: false,
      },
      {
        name: "Pro",
        subtitle: "For serious job seekers",
        price: { monthly: 14.99, annual: 10.49 },
        period: "month",
        features: [
          "Everything in Free",
          "No ads",
          "Full AI features",
          "Unlimited resumes",
          "Unlimited portfolios",
          "Unlimited job tracking",
          "Priority support",
          "Advanced analytics",
        ],
        cta: "Start Pro Trial",
        popular: true,
        gradient: true,
      },
      {
        name: "Premium",
        subtitle: "Maximum career acceleration",
        price: { monthly: 19.99, annual: 13.99 },
        period: "month",
        features: [
          "Everything in Pro",
          "AI auto-apply",
          "Personal career coach",
          "Custom integrations",
          "Dedicated support",
          "Early access to features",
          "Priority job matching",
        ],
        cta: "Start Premium Trial",
        popular: false,
        gradient: false,
      },
    ];
  
    return (
      <section
        id="pricing"
        ref={ref}
        className="relative py-24 px-6 border-b border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto">
          {/* Billing Toggle - Centered at top */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="flex justify-center mb-16"
          >
            <div className="inline-flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.08] rounded-full backdrop-blur-sm">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingCycle === "annual"
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Annual
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] rounded-full font-semibold">
                  Save 30%
                </span>
              </button>
            </div>
          </motion.div>
  
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl p-8 h-full flex flex-col ${
                  plan.popular
                    ? "bg-white/[0.03] border-2 border-teal-500/50 shadow-2xl shadow-teal-500/20"
                    : "bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12]"
                } transition-all duration-300`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full text-xs font-semibold text-white shadow-lg shadow-teal-500/40">
                      Most Popular
                    </div>
                  </div>
                )}
  
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-500">
                    {plan.subtitle}
                  </p>
                </div>
  
                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-lg text-gray-400">
                      $
                    </span>
                    <span className="text-5xl">
                      {billingCycle === "monthly"
                        ? plan.price.monthly
                        : plan.price.annual}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      /
                      {plan.price.monthly === 0
                        ? plan.period
                        : "month"}
                    </span>
                  </div>
                  {billingCycle === "annual" &&
                    plan.price.monthly > 0 && (
                      <p className="text-xs text-gray-500">
                        Billed annually
                      </p>
                    )}
                </div>
  
                {/* Features */}
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check
                        size={16}
                        className={`mt-0.5 flex-shrink-0 ${plan.popular ? "text-teal-400" : "text-emerald-500"}`}
                      />
                      <span className="text-gray-300 leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
  
                {/* CTA Button */}
                <button
                  className={`w-full py-4 rounded-xl font-semibold text-center transition-all duration-300 ${
                    plan.gradient
                      ? "bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-500 hover:from-teal-600 hover:via-teal-500 hover:to-cyan-600 text-black shadow-2xl shadow-teal-500/50 hover:shadow-[0_0_40px_rgba(20,184,166,0.7)] hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-[#0a0a0a] hover:bg-[#151515] text-white border-2 border-white/[0.06] hover:border-white/[0.12] shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  <span className="inline-block">{plan.cta}</span>
                </button>
              </motion.div>
            ))}
          </div>
  
          {/* Footer Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-gray-500 mt-16"
          >
            All plans include 14-day money-back guarantee • No
            credit card required for Free plan
          </motion.p>
        </div>
      </section>
    );
  }
  
  // Testimonials with carousel effect
  function TestimonialsSection() {
    const testimonials = [
      {
        quote:
          "RoleRabbit helped me land 3 interviews in my first week. The AI insights are incredible.",
        author: "Sarah Chen",
        role: "Software Engineer @ Google",
        avatar: "SC",
        rating: 5,
      },
      {
        quote:
          "Finally, a tool that understands the modern job search. Game changer for my career.",
        author: "Michael Torres",
        role: "Product Manager @ Meta",
        avatar: "MT",
        rating: 5,
      },
      {
        quote:
          "The automation saved me hours every week. I can focus on what matters—interviews.",
        author: "Emily Park",
        role: "UX Designer @ Apple",
        avatar: "EP",
        rating: 5,
      },
    ];
  
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
  
    return (
      <section
        id="testimonials"
        ref={ref}
        className="relative py-32 px-6 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent" />
  
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl mb-4">
              Loved by professionals
            </h2>
            <p className="text-xl text-gray-400">
              Join thousands who accelerated their careers
            </p>
          </motion.div>
  
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                index={index}
                isInView={isInView}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  function TestimonialCard({
    testimonial,
    index,
    isInView,
  }: any) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, rotateY: -20 }}
        animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
        transition={{
          delay: index * 0.15,
          type: "spring",
          stiffness: 80,
        }}
        whileHover={{ y: -10, scale: 1.02 }}
        className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm group"
      >
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
  
        <div className="relative">
          {/* Stars */}
          <div className="flex gap-1 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: index * 0.15 + i * 0.05 }}
              >
                <Star
                  size={16}
                  className="fill-teal-400 text-teal-400"
                />
              </motion.div>
            ))}
          </div>
  
          <p className="text-gray-300 mb-6 leading-relaxed text-lg">
            "{testimonial.quote}"
          </p>
  
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center"
            >
              {testimonial.avatar}
            </motion.div>
            <div>
              <div className="font-medium">
                {testimonial.author}
              </div>
              <div className="text-sm text-gray-500">
                {testimonial.role}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Final CTA with animated background
  function FinalCTA({ onEnterApp }: { onEnterApp?: () => void }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
  
    return (
      <section
        ref={ref}
        className="relative py-32 px-6 overflow-hidden"
      >
        {/* Animated gradient background */}
        <motion.div
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #14b8a6, #22d3ee, #3b82f6, #14b8a6)",
            backgroundSize: "200% 200%",
          }}
        />
  
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <motion.h2
              className="text-6xl md:text-7xl mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
            >
              Ready to{" "}
              <motion.span
                animate={{
                  backgroundPosition: [
                    "0% 50%",
                    "100% 50%",
                    "0% 50%",
                  ],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                  backgroundImage:
                    "linear-gradient(90deg, #2dd4bf, #22d3ee, #3b82f6, #2dd4bf)",
                }}
                className="bg-clip-text text-transparent"
              >
                leap forward
              </motion.span>
              ?
            </motion.h2>
  
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-400 mb-12"
            >
              Join thousands accelerating their career journey
              with RoleRabbit
            </motion.p>
  
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={onEnterApp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-6 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-xl font-medium shadow-2xl shadow-teal-500/50 overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "tween", duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  Get Started Free
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    <Rocket size={24} />
                  </motion.div>
                </span>
              </motion.button>
            </motion.div>
  
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="text-sm text-gray-500 mt-6"
            >
              No credit card required • Free forever plan • Cancel
              anytime
            </motion.p>
          </motion.div>
        </div>
      </section>
    );
  }
  
  // Footer with animations
  function Footer() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
  
    return (
      <footer
        ref={ref}
        className="relative border-t border-white/5 py-16 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-8">
  
            {/* Social Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-3"
            >
              {[
                {
                  Icon: XIcon,
                  label: "X (Twitter)",
                  color:
                    "hover:text-sky-400 hover:border-sky-500/50",
                },
                {
                  Icon: Linkedin,
                  label: "LinkedIn",
                  color:
                    "hover:text-blue-500 hover:border-blue-500/50",
                },
                {
                  Icon: Facebook,
                  label: "Facebook",
                  color:
                    "hover:text-blue-600 hover:border-blue-600/50",
                },
                {
                  Icon: Instagram,
                  label: "Instagram",
                  color:
                    "hover:text-pink-500 hover:border-pink-500/50",
                },
                {
                  Icon: Github,
                  label: "GitHub",
                  color: "hover:text-white hover:border-white/50",
                },
                {
                  Icon: Youtube,
                  label: "YouTube",
                  color:
                    "hover:text-red-500 hover:border-red-500/50",
                },
                {
                  Icon: Mail,
                  label: "Email",
                  color:
                    "hover:text-emerald-500 hover:border-emerald-500/50",
                },
              ].map(({ Icon, label, color }, i) => (
                <motion.a
                  key={i}
                  href="#"
                  aria-label={label}
                  whileHover={{ scale: 1.15, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                  }}
                  className={`w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:bg-white/[0.08] transition-all duration-300 ${color}`}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </motion.div>
  
            {/* Copyright */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm text-gray-500"
            >
              © 2025 RoleRabbit. All rights reserved.
            </motion.p>
          </div>
        </div>
      </footer>
    );
  }

  // Default export for Next.js page
  export default function BrandNewLandingPage() {
    const handleEnterApp = () => {
      window.location.href = '/dashboard';
    };

    return <LandingPage onEnterApp={handleEnterApp} />;
  }