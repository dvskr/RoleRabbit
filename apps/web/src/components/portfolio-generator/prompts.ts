export interface PromptTemplate {
  category: string;
  prompts: {
    title: string;
    description: string;
    prompt: string;
    useCase: string;
  }[];
}

export const portfolioPrompts: PromptTemplate[] = [
  {
    category: "Hero Section",
    prompts: [
      {
        title: "Tech Professional Intro",
        description: "Create a modern tech professional hero section",
        prompt: "I'm a software engineer with 5+ years of experience building scalable web applications. I specialize in full-stack JavaScript development using React, Node.js, and modern cloud technologies.",
        useCase: "Tech professionals, developers, engineers"
      },
      {
        title: "Creative Designer Intro",
        description: "Craft a creative and artistic introduction",
        prompt: "I'm a UX/UI designer passionate about creating intuitive digital experiences that blend aesthetics with functionality. With a background in graphic design and human-centered design, I transform complex concepts into beautiful, user-friendly interfaces.",
        useCase: "Designers, creatives, artists"
      },
      {
        title: "Executive Professional Intro",
        description: "Professional executive-level introduction",
        prompt: "I'm a strategic business leader with 15+ years of experience driving growth in Fortune 500 companies. I excel at building high-performance teams and delivering results through data-driven decision-making.",
        useCase: "Executives, managers, leaders"
      },
      {
        title: "Data Scientist Intro",
        description: "Create a data-driven professional introduction",
        prompt: "I'm a data scientist with expertise in machine learning, statistical analysis, and predictive modeling. I turn complex data into actionable insights that drive business growth and innovation.",
        useCase: "Data scientists, analysts, researchers"
      },
      {
        title: "Marketing Professional Intro",
        description: "Engaging marketing professional intro",
        prompt: "I'm a digital marketing strategist who creates campaigns that drive growth and engagement. With expertise in SEO, content marketing, and social media, I help brands connect with their audience effectively.",
        useCase: "Marketers, social media managers, content creators"
      }
    ]
  },
  {
    category: "Skills & Technologies",
    prompts: [
      {
        title: "Frontend Stack",
        description: "Highlight modern frontend technologies",
        prompt: "My core competencies include React, TypeScript, Tailwind CSS, Next.js, and modern frontend architecture patterns. I specialize in building responsive, accessible, and performant user interfaces.",
        useCase: "Frontend developers, UI engineers"
      },
      {
        title: "Full-Stack Skills",
        description: "Comprehensive full-stack skill set",
        prompt: "I'm proficient in the full technology stack: React and Vue on the frontend, Node.js and Python on the backend, PostgreSQL and MongoDB for databases, and AWS/Azure for cloud infrastructure.",
        useCase: "Full-stack developers"
      },
      {
        title: "Design & Development",
        description: "Combine design and technical skills",
        prompt: "I bridge design and development with expertise in Figma, Adobe Creative Suite, React, JavaScript, and CSS animations. I create visually stunning interfaces that are both beautiful and functional.",
        useCase: "Designer-developers, UI/UX engineers"
      },
      {
        title: "DevOps & Infrastructure",
        description: "DevOps and infrastructure expertise",
        prompt: "I specialize in DevOps practices including Docker, Kubernetes, CI/CD pipelines, Terraform, and cloud infrastructure on AWS and Google Cloud Platform.",
        useCase: "DevOps engineers, SREs"
      }
    ]
  },
  {
    category: "Projects & Experience",
    prompts: [
      {
        title: "AI & Machine Learning Projects",
        description: "Showcase AI/ML projects",
        prompt: "I've built machine learning models for fraud detection, recommendation systems, and natural language processing. Projects include sentiment analysis tools, predictive analytics dashboards, and chatbot implementations.",
        useCase: "Data scientists, ML engineers, AI researchers"
      },
      {
        title: "E-Commerce Platforms",
        description: "E-commerce and marketplace projects",
        prompt: "I've developed scalable e-commerce platforms handling 100K+ daily transactions, implemented payment gateways, inventory management systems, and real-time analytics dashboards.",
        useCase: "Web developers, e-commerce specialists"
      },
      {
        title: "SaaS Applications",
        description: "Software-as-a-Service products",
        prompt: "I've built SaaS platforms with subscription management, multi-tenancy architecture, real-time collaboration features, and comprehensive analytics. These products serve 50K+ active users.",
        useCase: "Product engineers, SaaS developers"
      },
      {
        title: "Mobile Applications",
        description: "Native and cross-platform mobile apps",
        prompt: "I've developed iOS and Android applications using React Native and Flutter, implementing features like offline-first architecture, push notifications, biometric authentication, and in-app purchases.",
        useCase: "Mobile developers, app creators"
      },
      {
        title: "Open Source Contributions",
        description: "Open source and community work",
        prompt: "I'm an active open source contributor with 10K+ GitHub stars across my projects. I maintain popular libraries, contribute to major frameworks, and mentor junior developers through documentation and tutorials.",
        useCase: "Open source developers, maintainers"
      }
    ]
  },
  {
    category: "About & Story",
    prompts: [
      {
        title: "Career Journey",
        description: "Share your career story",
        prompt: "I started as a self-taught developer, building websites for local businesses while studying computer science. After graduation, I joined a startup where I grew from a junior developer to leading a team of 10 engineers.",
        useCase: "Career changers, self-taught developers"
      },
      {
        title: "Impact-Driven Professional",
        description: "Focus on impact and mission",
        prompt: "I'm passionate about using technology to solve real-world problems. Whether it's building applications that improve healthcare access or creating tools that help small businesses grow, I believe technology should serve humanity.",
        useCase: "Social impact, mission-driven professionals"
      },
      {
        title: "Continuous Learner",
        description: "Showcase learning mindset",
        prompt: "Technology evolves rapidly, and I'm committed to staying at the forefront. I regularly take online courses, attend conferences, and contribute to the community. Currently learning about quantum computing and its applications.",
        useCase: "Lifelong learners, curious professionals"
      },
      {
        title: "Team Collaboration",
        description: "Emphasize teamwork and collaboration",
        prompt: "I thrive in collaborative environments where diverse perspectives lead to innovative solutions. I've successfully led cross-functional teams of designers, developers, and product managers to ship products loved by millions of users.",
        useCase: "Team leaders, collaborators, project managers"
      }
    ]
  },
  {
    category: "Achievements & Metrics",
    prompts: [
      {
        title: "Measurable Impact",
        description: "Quantify your achievements",
        prompt: "In my previous role, I increased conversion rates by 35%, reduced page load times by 60%, and improved user satisfaction scores from 7.2 to 9.1. I'm proud of the measurable impact my work has on both users and business metrics.",
        useCase: "Results-driven professionals"
      },
      {
        title: "Scale & Growth",
        description: "Handle scale and growth",
        prompt: "I've architected systems that handle millions of requests per day, scaled applications to support 10x user growth, and implemented solutions that reduced infrastructure costs by 40% while improving performance.",
        useCase: "Scalability experts, growth engineers"
      },
      {
        title: "Awards & Recognition",
        description: "Showcase awards and recognition",
        prompt: "My work has been recognized with the 'Innovation of the Year' award, featured in TechCrunch and Product Hunt, and selected as a case study by Google's Developer Relations team.",
        useCase: "Award-winning professionals"
      }
    ]
  },
  {
    category: "Personal Branding",
    prompts: [
      {
        title: "Thought Leadership",
        description: "Establish as thought leader",
        prompt: "I regularly speak at tech conferences, write technical blogs with 100K+ monthly readers, and host a podcast about modern web development. I'm passionate about sharing knowledge and helping others grow.",
        useCase: "Content creators, speakers, educators"
      },
      {
        title: "Community Builder",
        description: "Build and lead communities",
        prompt: "I organize monthly tech meetups with 500+ members, mentor early-career developers, and contribute to community-driven projects that impact thousands of developers worldwide.",
        useCase: "Community leaders, organizers"
      },
      {
        title: "Personal Brand",
        description: "Build strong personal brand",
        prompt: "I've built a personal brand known for clear communication, technical excellence, and collaborative leadership. My online presence reflects my values of integrity, innovation, and impact.",
        useCase: "Personal brand builders"
      }
    ]
  },
  {
    category: "Call to Action",
    prompts: [
      {
        title: "Collaboration Focus",
        description: "Emphasize working together",
        prompt: "I'm always open to collaborating on exciting projects, sharing ideas with fellow creators, and exploring opportunities to make a meaningful impact together.",
        useCase: "Collaborators, networkers"
      },
      {
        title: "Hiring/Recruiting",
        description: "Open to opportunities",
        prompt: "I'm currently open to new opportunities, particularly in innovative startups or companies that are solving meaningful problems with cutting-edge technology.",
        useCase: "Job seekers, freelancers"
      },
      {
        title: "Consulting Services",
        description: "Offer consulting services",
        prompt: "I offer consulting services for architecture reviews, technical audits, team training, and project rescues. Let's discuss how I can help accelerate your technical goals.",
        useCase: "Consultants, freelancers"
      }
    ]
  }
];

// Quick prompts for common scenarios
export const quickPrompts = [
  {
    label: "Software Engineer",
    prompt: "I'm a software engineer passionate about building scalable applications. My expertise includes React, Node.js, TypeScript, and cloud technologies. I've contributed to projects serving millions of users."
  },
  {
    label: "UX Designer",
    prompt: "I'm a UX designer focused on creating user-centered experiences. I work with Figma, conduct user research, design interactive prototypes, and collaborate closely with developers to bring ideas to life."
  },
  {
    label: "Data Scientist",
    prompt: "I'm a data scientist specializing in machine learning and predictive analytics. I build models for recommendation systems, fraud detection, and business intelligence using Python, TensorFlow, and SQL."
  },
  {
    label: "Product Manager",
    prompt: "I'm a product manager who bridges business and technology. I've launched 10+ products, working with engineers and designers to solve user problems and achieve business goals."
  },
  {
    label: "DevOps Engineer",
    prompt: "I'm a DevOps engineer focused on automation, scalability, and reliability. I work with Docker, Kubernetes, CI/CD pipelines, and cloud infrastructure to deploy and manage applications at scale."
  },
  {
    label: "Frontend Developer",
    prompt: "I'm a frontend developer creating beautiful, performant web experiences. I'm skilled in React, TypeScript, CSS animations, and modern design systems. I focus on accessibility and user experience."
  },
  {
    label: "Full-Stack Developer",
    prompt: "I'm a full-stack developer building end-to-end solutions. From designing APIs to implementing responsive UIs, I bring projects from concept to production using modern JavaScript frameworks and cloud services."
  },
  {
    label: "Marketing Lead",
    prompt: "I'm a marketing leader driving growth through data-driven strategies. With expertise in SEO, content marketing, social media, and analytics, I help brands reach and engage their target audience effectively."
  }
];

// Advanced customization prompts
export const advancedPrompts = {
  websiteStructure: {
    modern: "Create a modern single-page application with smooth scroll animations, interactive hero section, animated skill cards, project showcases with hover effects, and a dynamic contact form.",
    minimal: "Design a clean, minimal portfolio with lots of white space, subtle animations, simple typography, and focus on content over effects.",
    creative: "Build a creative portfolio with bold typography, vibrant colors, parallax scrolling effects, interactive elements, and unique layout patterns."
  },
  colorSchemes: {
    tech: "Blue and purple gradient theme with dark backgrounds and neon accents",
    corporate: "Professional navy blue and gold with clean whites and subtle grays",
    creative: "Vibrant rainbow gradients with bold, saturated colors",
    minimal: "Monochromatic palette with subtle gray variations and accent colors"
  },
  features: {
    animations: "Add smooth scroll animations, fade-ins, slide-ins, hover effects, and micro-interactions throughout the portfolio",
    interactivity: "Create interactive elements like animated counters, skill progress bars, typing effects, and dynamic content loading",
    performance: "Optimize for performance with lazy loading, image optimization, code splitting, and minimal bundle size"
  }
};

