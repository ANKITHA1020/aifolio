/**
 * Template Example Data Generator
 * Provides themed example portfolio data for each template type
 */

export interface ExamplePortfolio {
  title: string;
  template_type: string;
  components: Array<{
    component_type: string;
    content: Record<string, any>;
    order: number;
    is_visible: boolean;
  }>;
}

/**
 * Get example portfolio data for Classic template
 * Professional, traditional data for corporate roles
 */
export function getClassicExampleData(): ExamplePortfolio {
  return {
    title: "John Anderson",
    template_type: "classic",
    components: [
      {
        component_type: "header",
        content: {
          title: "John Anderson",
          subtitle: "Senior Business Analyst | Strategic Planning & Operations",
        },
        order: 1,
        is_visible: true,
      },
      {
        component_type: "about",
        content: {
          bio: "Experienced business analyst with over 10 years of expertise in strategic planning, process optimization, and cross-functional team leadership. Proven track record of driving operational efficiency and delivering data-driven solutions that enhance business performance. Strong background in financial analysis, market research, and stakeholder management across diverse industries.",
        },
        order: 2,
        is_visible: true,
      },
      {
        component_type: "skills",
        content: {
          skills: [
            "Strategic Planning",
            "Data Analysis",
            "Process Optimization",
            "Stakeholder Management",
            "Financial Modeling",
          ],
        },
        order: 3,
        is_visible: true,
      },
      {
        component_type: "projects",
        content: {
          projects: [
            {
              id: 1,
              title: "Enterprise Process Redesign",
              description: "Led comprehensive redesign of core business processes resulting in 30% efficiency improvement and $2M annual cost savings.",
              short_description: "Process optimization project",
              technologies: ["Process Mapping", "Lean Six Sigma", "Change Management"],
            },
            {
              id: 2,
              title: "Market Expansion Strategy",
              description: "Developed and executed market entry strategy for three new geographic regions, achieving 150% revenue growth target within 18 months.",
              short_description: "Strategic market analysis",
              technologies: ["Market Research", "Competitive Analysis", "Financial Planning"],
            },
          ],
        },
        order: 4,
        is_visible: true,
      },
      {
        component_type: "contact",
        content: {
          email: "john.anderson@email.com",
          phone: "+1 (555) 123-4567",
          location: "New York, NY",
          linkedin: "https://linkedin.com/in/johnanderson",
          website: "https://johnanderson.com",
        },
        order: 5,
        is_visible: true,
      },
    ],
  };
}

/**
 * Get example portfolio data for Designer template
 * Creative portfolio data with visual projects and artistic skills
 */
export function getDesignerExampleData(): ExamplePortfolio {
  return {
    title: "Sarah Martinez",
    template_type: "designer",
    components: [
      {
        component_type: "header",
        content: {
          title: "Sarah Martinez",
          subtitle: "Creative Director | Brand Identity & Visual Design",
        },
        order: 1,
        is_visible: true,
      },
      {
        component_type: "about",
        content: {
          bio: "Award-winning creative director specializing in brand identity, visual design, and digital experiences. With a passion for storytelling through design, I create compelling visual narratives that resonate with audiences and drive brand engagement. My work spans across print, digital, and motion design, always with a focus on innovation and aesthetic excellence.",
        },
        order: 2,
        is_visible: true,
      },
      {
        component_type: "skills",
        content: {
          skills: [
            "Brand Identity",
            "UI/UX Design",
            "Typography",
            "Illustration",
            "Art Direction",
          ],
        },
        order: 3,
        is_visible: true,
      },
      {
        component_type: "projects",
        content: {
          projects: [
            {
              id: 1,
              title: "Luxury Fashion Brand Rebrand",
              description: "Complete visual identity redesign for premium fashion brand, including logo, packaging, and digital presence. Resulted in 40% increase in brand recognition.",
              short_description: "Brand identity redesign",
              technologies: ["Branding", "Packaging Design", "Digital Design"],
            },
            {
              id: 2,
              title: "Interactive Art Installation",
              description: "Conceptualized and designed large-scale interactive installation combining digital and physical elements, featured in three major design exhibitions.",
              short_description: "Interactive design project",
              technologies: ["3D Design", "Motion Graphics", "Interactive Media"],
            },
          ],
          images: [
            { url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800", alt: "Design project 1" },
            { url: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800", alt: "Design project 2" },
            { url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800", alt: "Design project 3" },
          ],
        },
        order: 4,
        is_visible: true,
      },
      {
        component_type: "contact",
        content: {
          email: "sarah.martinez@email.com",
          phone: "+1 (555) 234-5678",
          location: "Los Angeles, CA",
          linkedin: "https://linkedin.com/in/sarahmartinez",
          website: "https://sarahmartinez.design",
        },
        order: 5,
        is_visible: true,
      },
    ],
  };
}

/**
 * Get example portfolio data for Developer template
 * Technical data with code projects, GitHub links, and code snippets
 */
export function getDeveloperExampleData(): ExamplePortfolio {
  return {
    title: "Alex Chen",
    template_type: "developer",
    components: [
      {
        component_type: "header",
        content: {
          title: "Alex Chen",
          subtitle: "Full-Stack Developer | React • Node.js • Python",
        },
        order: 1,
        is_visible: true,
      },
      {
        component_type: "about",
        content: {
          bio: "Passionate full-stack developer with expertise in building scalable web applications and cloud infrastructure. Specialized in modern JavaScript frameworks, microservices architecture, and DevOps practices. Open source contributor and tech enthusiast who loves solving complex problems with elegant code solutions.",
        },
        order: 2,
        is_visible: true,
      },
      {
        component_type: "skills",
        content: {
          skills: [
            "React",
            "Node.js",
            "Python",
            "TypeScript",
            "AWS",
            "Docker",
            "PostgreSQL",
          ],
        },
        order: 3,
        is_visible: true,
      },
      {
        component_type: "projects",
        content: {
          projects: [
            {
              id: 1,
              title: "Real-Time Collaboration Platform",
              description: "Built a scalable real-time collaboration platform using React, Node.js, and WebSockets. Supports 1000+ concurrent users with sub-100ms latency.",
              short_description: "Real-time web application",
              github_url: "https://github.com/alexchen/collab-platform",
              live_url: "https://collab-platform.demo",
              technologies: ["React", "Node.js", "WebSockets", "Redis", "PostgreSQL"],
            },
            {
              id: 2,
              title: "Microservices E-Commerce API",
              description: "Designed and implemented a microservices-based e-commerce backend with 15+ services, handling 10K+ requests per minute with 99.9% uptime.",
              short_description: "Microservices architecture",
              github_url: "https://github.com/alexchen/ecommerce-api",
              technologies: ["Python", "FastAPI", "Docker", "Kubernetes", "RabbitMQ"],
            },
          ],
          code_snippets: [
            {
              language: "typescript",
              code: `// Real-time event handler
export const useRealtimeSync = (roomId: string) => {
  const [state, setState] = useState<SyncState>(initialState);
  
  useEffect(() => {
    const ws = new WebSocket(\`wss://api.example.com/rooms/\${roomId}\`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setState(prev => applyUpdate(prev, update));
    };
    
    return () => ws.close();
  }, [roomId]);
  
  return state;
};`,
              description: "Real-time synchronization hook using WebSockets",
              filename: "useRealtimeSync.ts",
            },
            {
              language: "python",
              code: `# Async task processor
async def process_order(order_id: int):
    async with db.transaction():
        order = await Order.get(order_id)
        await validate_inventory(order)
        await charge_payment(order)
        await update_inventory(order)
        await send_notification(order)
    return order`,
              description: "Asynchronous order processing with transaction management",
              filename: "order_processor.py",
            },
          ],
        },
        order: 4,
        is_visible: true,
      },
      {
        component_type: "contact",
        content: {
          email: "alex.chen@email.com",
          location: "San Francisco, CA",
          github: "https://github.com/alexchen",
          linkedin: "https://linkedin.com/in/alexchen",
          website: "https://alexchen.dev",
        },
        order: 5,
        is_visible: true,
      },
    ],
  };
}

/**
 * Get example portfolio data for Minimalist template
 * Clean, minimal data with essential information only
 */
export function getMinimalistExampleData(): ExamplePortfolio {
  return {
    title: "Emma Wilson",
    template_type: "minimalist",
    components: [
      {
        component_type: "header",
        content: {
          title: "Emma Wilson",
          subtitle: "Product Manager",
        },
        order: 1,
        is_visible: true,
      },
      {
        component_type: "about",
        content: {
          bio: "Product manager focused on building meaningful products that solve real problems. I work at the intersection of technology, design, and business strategy.",
        },
        order: 2,
        is_visible: true,
      },
      {
        component_type: "skills",
        content: {
          skills: [
            "Product Strategy",
            "User Research",
            "Agile Methodology",
            "Data Analysis",
          ],
        },
        order: 3,
        is_visible: true,
      },
      {
        component_type: "projects",
        content: {
          projects: [
            {
              id: 1,
              title: "Mobile Banking App",
              description: "Led product development for mobile banking application serving 500K+ users.",
              short_description: "Mobile banking product",
            },
            {
              id: 2,
              title: "SaaS Analytics Platform",
              description: "Built analytics platform from concept to launch, achieving 10K+ active users in first year.",
              short_description: "Analytics platform",
            },
          ],
        },
        order: 4,
        is_visible: true,
      },
      {
        component_type: "contact",
        content: {
          email: "emma.wilson@email.com",
          linkedin: "https://linkedin.com/in/emmawilson",
        },
        order: 5,
        is_visible: true,
      },
    ],
  };
}

/**
 * Get example portfolio data for Modern template
 * Contemporary data with modern roles and bold presentation
 */
export function getModernExampleData(): ExamplePortfolio {
  return {
    title: "Jordan Taylor",
    template_type: "modern",
    components: [
      {
        component_type: "header",
        content: {
          title: "Jordan Taylor",
          subtitle: "Digital Strategist | Innovation & Growth",
        },
        order: 1,
        is_visible: true,
      },
      {
        component_type: "about",
        content: {
          bio: "Innovation-driven digital strategist with a passion for transforming businesses through technology and creative thinking. I specialize in developing growth strategies, leading digital transformation initiatives, and building high-performing teams. My approach combines data-driven insights with creative problem-solving to deliver exceptional results.",
        },
        order: 2,
        is_visible: true,
      },
      {
        component_type: "skills",
        content: {
          skills: [
            "Digital Strategy",
            "Growth Marketing",
            "Innovation Management",
            "Team Leadership",
            "Data Analytics",
          ],
        },
        order: 3,
        is_visible: true,
      },
      {
        component_type: "projects",
        content: {
          projects: [
            {
              id: 1,
              title: "Startup Growth Acceleration",
              description: "Developed and executed growth strategy for early-stage startup, achieving 300% user growth and $5M Series A funding within 12 months.",
              short_description: "Growth strategy execution",
              technologies: ["Growth Hacking", "Digital Marketing", "Analytics"],
            },
            {
              id: 2,
              title: "Enterprise Digital Transformation",
              description: "Led digital transformation initiative for Fortune 500 company, modernizing legacy systems and processes, resulting in 50% operational efficiency improvement.",
              short_description: "Digital transformation",
              technologies: ["Change Management", "Process Innovation", "Technology Integration"],
            },
          ],
        },
        order: 4,
        is_visible: true,
      },
      {
        component_type: "contact",
        content: {
          email: "jordan.taylor@email.com",
          phone: "+1 (555) 345-6789",
          location: "Austin, TX",
          linkedin: "https://linkedin.com/in/jordantaylor",
          website: "https://jordantaylor.com",
        },
        order: 5,
        is_visible: true,
      },
    ],
  };
}

/**
 * Get example data for a specific template type
 */
export function getExampleDataForTemplate(templateType: string): ExamplePortfolio {
  switch (templateType.toLowerCase()) {
    case "classic":
      return getClassicExampleData();
    case "designer":
      return getDesignerExampleData();
    case "developer":
      return getDeveloperExampleData();
    case "minimalist":
      return getMinimalistExampleData();
    case "modern":
      return getModernExampleData();
    default:
      return getModernExampleData();
  }
}

