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
        component_type: "hero_banner",
        content: {
          title: "John Anderson",
          subtitle: "Senior Business Analyst | Strategic Planning & Operations",
          cta_buttons: [
            { text: "View Projects", url: "#projects", variant: "primary" },
            { text: "Contact Me", url: "#contact", variant: "secondary" },
          ],
        },
        order: 1,
        is_visible: true,
      },
      {
        component_type: "about_me_card",
        content: {
          name: "John Anderson",
          title: "Senior Business Analyst",
          bio: "Experienced business analyst with over 10 years of expertise in strategic planning, process optimization, and cross-functional team leadership. Proven track record of driving operational efficiency and delivering data-driven solutions that enhance business performance. Strong background in financial analysis, market research, and stakeholder management across diverse industries.",
          social_links: {
            linkedin: "https://linkedin.com/in/johnanderson",
            email: "john.anderson@email.com",
            website: "https://johnanderson.com",
          },
        },
        order: 2,
        is_visible: true,
      },
      {
        component_type: "skills_cloud",
        content: {
          skills: [
            "Strategic Planning",
            "Data Analysis",
            "Process Optimization",
            "Stakeholder Management",
            "Financial Modeling",
            "Market Research",
            "Business Intelligence",
            "Project Management",
            "Risk Assessment",
            "Change Management",
            "Performance Metrics",
            "Cost-Benefit Analysis",
            "SWOT Analysis",
            "Agile Methodology",
            "Cross-functional Leadership",
          ],
          display_mode: "cloud",
        },
        order: 3,
        is_visible: true,
      },
      {
        component_type: "project_grid",
        content: {
          projects: [
            {
              id: 1,
              title: "Enterprise Process Redesign",
              description: "Led comprehensive redesign of core business processes resulting in 30% efficiency improvement and $2M annual cost savings. Collaborated with cross-functional teams to identify bottlenecks, streamline workflows, and implement automation solutions across 5 departments.",
              short_description: "Process optimization project",
              technologies: ["Process Mapping", "Lean Six Sigma", "Change Management", "Automation"],
              category: "Business Strategy",
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            },
            {
              id: 2,
              title: "Market Expansion Strategy",
              description: "Developed and executed market entry strategy for three new geographic regions, achieving 150% revenue growth target within 18 months. Conducted extensive market research, competitive analysis, and risk assessment to ensure successful market penetration.",
              short_description: "Strategic market analysis",
              technologies: ["Market Research", "Competitive Analysis", "Financial Planning", "Risk Assessment"],
              category: "Strategy",
              image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
            },
            {
              id: 3,
              title: "Digital Transformation Initiative",
              description: "Orchestrated digital transformation program for legacy enterprise systems, modernizing technology stack and improving operational efficiency by 45%. Managed $5M budget and coordinated with 20+ stakeholders across IT, operations, and business units.",
              short_description: "Digital transformation program",
              technologies: ["Digital Strategy", "System Integration", "Change Management", "Stakeholder Management"],
              category: "Transformation",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
            },
            {
              id: 4,
              title: "Cost Optimization Analysis",
              description: "Performed comprehensive cost-benefit analysis across multiple business units, identifying $3.5M in annual savings opportunities. Developed implementation roadmap and ROI projections that secured executive approval for cost reduction initiatives.",
              short_description: "Cost optimization project",
              technologies: ["Financial Analysis", "Cost-Benefit Analysis", "ROI Modeling", "Process Improvement"],
              category: "Finance",
              image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
            },
            {
              id: 5,
              title: "Customer Experience Enhancement",
              description: "Designed and implemented customer experience improvement program that increased customer satisfaction scores by 35% and reduced churn rate by 22%. Utilized data analytics to identify pain points and developed targeted solutions.",
              short_description: "Customer experience program",
              technologies: ["Customer Analytics", "Process Design", "Performance Metrics", "Quality Improvement"],
              category: "Customer Experience",
              image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
            },
            {
              id: 6,
              title: "Supply Chain Optimization",
              description: "Analyzed and optimized supply chain operations, reducing lead times by 28% and inventory costs by $1.8M annually. Implemented demand forecasting models and supplier relationship management strategies.",
              short_description: "Supply chain improvement",
              technologies: ["Supply Chain Management", "Demand Forecasting", "Vendor Management", "Process Optimization"],
              category: "Operations",
              image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
            },
          ],
          show_filters: true,
          filter_categories: ["Business Strategy", "Strategy", "Transformation", "Finance", "Customer Experience", "Operations"],
        },
        order: 4,
        is_visible: true,
      },
      {
        component_type: "experience_timeline",
        content: {
          experiences: [
            {
              title: "Senior Business Analyst",
              company: "Global Tech Solutions",
              startDate: "2020",
              endDate: "Present",
              description: "Lead strategic planning initiatives and process optimization projects across multiple business units. Manage cross-functional teams of 15+ members and oversee $10M+ annual budget for transformation initiatives. Successfully delivered 20+ projects with average ROI of 250%.",
            },
            {
              title: "Business Analyst",
              company: "Enterprise Corp",
              startDate: "2016",
              endDate: "2020",
              description: "Analyzed business processes and implemented efficiency improvements resulting in 25% cost reduction. Collaborated with stakeholders to identify improvement opportunities and developed data-driven recommendations. Led process redesign projects that improved customer satisfaction by 30%.",
            },
            {
              title: "Junior Business Analyst",
              company: "Consulting Group",
              startDate: "2014",
              endDate: "2016",
              description: "Supported senior analysts in conducting market research, financial analysis, and process documentation. Assisted in developing business cases and preparing executive presentations. Gained expertise in data analysis tools and methodologies.",
            },
            {
              title: "Business Intern",
              company: "Financial Services Inc.",
              startDate: "2013",
              endDate: "2014",
              description: "Completed rotational internship program across finance, operations, and strategy departments. Contributed to quarterly business reviews and supported ad-hoc analysis projects. Developed foundational skills in business analysis and financial modeling.",
            },
          ],
        },
        order: 5,
        is_visible: true,
      },
      {
        component_type: "services_section",
        content: {
          services: [
            {
              title: "Strategic Planning",
              description: "Develop comprehensive business strategies aligned with organizational goals. Create long-term roadmaps, define key performance indicators, and establish frameworks for strategic decision-making.",
              icon: "target",
            },
            {
              title: "Process Optimization",
              description: "Identify and implement process improvements for enhanced efficiency. Utilize Lean Six Sigma methodologies to eliminate waste, reduce cycle times, and improve quality.",
              icon: "zap",
            },
            {
              title: "Data Analysis",
              description: "Transform complex data into actionable business insights. Build analytical models, create dashboards, and provide data-driven recommendations to support decision-making.",
              icon: "bar-chart",
            },
            {
              title: "Change Management",
              description: "Guide organizations through transformational change initiatives. Develop change strategies, manage stakeholder communications, and ensure smooth adoption of new processes.",
              icon: "users",
            },
            {
              title: "Financial Analysis",
              description: "Conduct comprehensive financial analysis including cost-benefit analysis, ROI modeling, and budget optimization. Provide financial insights to support strategic investments.",
              icon: "dollar-sign",
            },
          ],
        },
        order: 6,
        is_visible: true,
      },
      {
        component_type: "achievements_counters",
        content: {
          counters: [
            { label: "Projects Completed", value: 75 },
            { label: "Years Experience", value: 12 },
            { label: "Clients Served", value: 35 },
            { label: "Cost Savings Generated", value: 12, suffix: "M" },
            { label: "Efficiency Improvements", value: 45, suffix: "%" },
          ],
        },
        order: 7,
        is_visible: true,
      },
      {
        component_type: "testimonials_carousel",
        content: {
          testimonials: [
            {
              name: "David Thompson",
              role: "VP of Operations, Global Tech Solutions",
              content: "John's strategic insights and analytical approach have been instrumental in transforming our operations. His ability to identify opportunities and drive change is exceptional.",
              rating: 5,
            },
            {
              name: "Jennifer Martinez",
              role: "CEO, Enterprise Corp",
              content: "Working with John was a game-changer for our organization. His process optimization initiatives saved us millions and significantly improved our operational efficiency.",
              rating: 5,
            },
            {
              name: "Michael Roberts",
              role: "Director of Strategy, Consulting Group",
              content: "John combines deep analytical skills with strong business acumen. His recommendations are always data-driven and actionable, making him an invaluable partner.",
              rating: 5,
            },
          ],
        },
        order: 8,
        is_visible: true,
      },
      {
        component_type: "blog_preview_grid",
        content: {
          posts: [
            {
              id: 1,
              title: "The Future of Business Analysis in the Digital Age",
              excerpt: "Exploring how digital transformation is reshaping the role of business analysts and the skills needed to succeed in an increasingly data-driven world.",
              author: "John Anderson",
              published_date: "2025-01-15",
              read_time: "5 min read",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
            },
            {
              id: 2,
              title: "5 Key Strategies for Process Optimization",
              excerpt: "Learn the essential strategies for identifying inefficiencies and implementing sustainable process improvements that deliver measurable results.",
              author: "John Anderson",
              published_date: "2025-01-08",
              read_time: "7 min read",
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
            },
            {
              id: 3,
              title: "Data-Driven Decision Making: A Practical Guide",
              excerpt: "Discover how to leverage data analytics to make informed business decisions and drive organizational success through evidence-based strategies.",
              author: "John Anderson",
              published_date: "2024-12-20",
              read_time: "6 min read",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
            },
            {
              id: 4,
              title: "Mastering Change Management in Large Organizations",
              excerpt: "Insights on navigating organizational change, managing stakeholder expectations, and ensuring successful adoption of new processes and technologies.",
              author: "John Anderson",
              published_date: "2024-12-10",
              read_time: "8 min read",
              image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600",
            },
          ],
          posts_per_row: 3,
        },
        order: 9,
        is_visible: true,
      },
      {
        component_type: "contact_form",
        content: {
          title: "Contact Info",
          description: "Let's discuss how I can help transform your business operations and drive strategic growth.",
          contact_info: {
            email: "john.anderson@email.com",
            phone: "+1 (555) 123-4567",
            location: "New York, NY, United States",
            linkedin: "https://linkedin.com/in/johnanderson",
            website: "https://johnanderson.com",
          },
        },
        order: 10,
        is_visible: true,
      },
      {
        component_type: "footer",
        content: {
          copyright_text: "© 2025 John Anderson. All rights reserved.",
          links: [
            { text: "About", url: "#about" },
            { text: "Projects", url: "#projects" },
            { text: "Services", url: "#services" },
            { text: "Blog", url: "#blog" },
            { text: "Contact", url: "#contact" },
          ],
          social_links: {
            linkedin: "https://linkedin.com/in/johnanderson",
            email: "john.anderson@email.com",
            website: "https://johnanderson.com",
          },
        },
        order: 11,
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
        component_type: "hero_banner",
        content: {
          title: "Sarah Martinez",
          subtitle: "Creative Director | Brand Identity & Visual Design",
          cta_buttons: [
            { text: "View Portfolio", url: "#projects", variant: "primary" },
            { text: "Get In Touch", url: "#contact", variant: "secondary" },
          ],
        },
        order: 1,
        is_visible: true,
      },
      {
        component_type: "about_me_card",
        content: {
          name: "Sarah Martinez",
          title: "Creative Director",
          bio: "Award-winning creative director specializing in brand identity, visual design, and digital experiences. With a passion for storytelling through design, I create compelling visual narratives that resonate with audiences and drive brand engagement. My work spans across print, digital, and motion design, always with a focus on innovation and aesthetic excellence.",
          social_links: {
            linkedin: "https://linkedin.com/in/sarahmartinez",
            email: "sarah.martinez@email.com",
            website: "https://sarahmartinez.design",
          },
        },
        order: 2,
        is_visible: true,
      },
      {
        component_type: "skills_cloud",
        content: {
          skills: [
            "Brand Identity",
            "UI/UX Design",
            "Typography",
            "Illustration",
            "Art Direction",
            "Motion Graphics",
            "Packaging Design",
            "Visual Storytelling",
            "Print Design",
            "Digital Design",
            "Color Theory",
            "Layout Design",
            "Creative Direction",
            "Concept Development",
            "Design Systems",
          ],
          display_mode: "cloud",
        },
        order: 3,
        is_visible: true,
      },
      {
        component_type: "project_grid",
        content: {
          projects: [
            {
              id: 1,
              title: "Luxury Fashion Brand Rebrand",
              description: "Complete visual identity redesign for premium fashion brand, including logo, packaging, and digital presence. Resulted in 40% increase in brand recognition and 25% boost in sales. Created comprehensive brand guidelines and applied across all touchpoints.",
              short_description: "Brand identity redesign",
              technologies: ["Branding", "Packaging Design", "Digital Design", "Brand Strategy"],
              category: "Branding",
              image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
            },
            {
              id: 2,
              title: "Interactive Art Installation",
              description: "Conceptualized and designed large-scale interactive installation combining digital and physical elements, featured in three major design exhibitions. Created immersive experience that engaged 50K+ visitors and received critical acclaim from design publications.",
              short_description: "Interactive design project",
              technologies: ["3D Design", "Motion Graphics", "Interactive Media", "Installation Art"],
              category: "Installation",
              image: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800",
            },
            {
              id: 3,
              title: "Tech Startup UI/UX Redesign",
              description: "Redesigned entire user interface and experience for SaaS platform, improving user engagement by 60% and reducing bounce rate by 45%. Conducted extensive user research and created design system for scalable growth.",
              short_description: "UI/UX redesign project",
              technologies: ["UI/UX Design", "User Research", "Prototyping", "Design Systems"],
              category: "Digital",
              image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
            },
            {
              id: 4,
              title: "Sustainable Packaging Collection",
              description: "Designed eco-friendly packaging solutions for consumer goods brand, reducing environmental impact by 30% while maintaining premium aesthetic. Won Design Excellence Award for innovation in sustainable design.",
              short_description: "Sustainable packaging design",
              technologies: ["Packaging Design", "Sustainable Design", "Material Innovation", "Brand Identity"],
              category: "Packaging",
              image: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800",
            },
            {
              id: 5,
              title: "Editorial Magazine Layout",
              description: "Created distinctive editorial layouts for quarterly lifestyle magazine, establishing unique visual language that increased readership by 35%. Designed 12 issues with consistent yet evolving aesthetic.",
              short_description: "Editorial design project",
              technologies: ["Editorial Design", "Typography", "Layout Design", "Print Production"],
              category: "Editorial",
              image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
            },
            {
              id: 6,
              title: "Motion Graphics Campaign",
              description: "Produced animated motion graphics series for global advertising campaign, reaching 10M+ viewers across digital platforms. Created cohesive visual narrative that increased brand awareness by 50%.",
              short_description: "Motion graphics campaign",
              technologies: ["Motion Graphics", "Animation", "Video Production", "Brand Campaign"],
              category: "Motion",
              image: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800",
            },
          ],
          show_filters: true,
          filter_categories: ["Branding", "Installation", "Digital", "Packaging", "Editorial", "Motion"],
        },
        order: 4,
        is_visible: true,
      },
      {
        component_type: "experience_timeline",
        content: {
          experiences: [
            {
              title: "Creative Director",
              company: "Design Studio Inc.",
              startDate: "2019",
              endDate: "Present",
              description: "Lead creative direction for brand identity projects and digital experiences. Manage team of 12 designers and oversee all creative output. Established design processes that increased project efficiency by 40% and client satisfaction by 35%.",
            },
            {
              title: "Senior Designer",
              company: "Creative Agency",
              startDate: "2015",
              endDate: "2019",
              description: "Designed visual identities and digital experiences for clients across various industries. Led design projects for Fortune 500 companies and startups, delivering award-winning creative solutions. Mentored junior designers and contributed to agency's creative vision.",
            },
            {
              title: "Graphic Designer",
              company: "Marketing Firm",
              startDate: "2012",
              endDate: "2015",
              description: "Created visual designs for print and digital marketing campaigns. Developed brand identities, designed marketing materials, and collaborated with copywriters and account managers. Built strong foundation in typography, layout, and color theory.",
            },
            {
              title: "Junior Designer",
              company: "Local Design Studio",
              startDate: "2010",
              endDate: "2012",
              description: "Supported senior designers on various projects including logo design, print layouts, and digital graphics. Learned industry-standard design software and design principles. Contributed to team projects and gained hands-on experience.",
            },
          ],
        },
        order: 5,
        is_visible: true,
      },
      {
        component_type: "services_section",
        content: {
          services: [
            {
              title: "Brand Identity",
              description: "Create compelling brand identities that resonate with target audiences. Develop comprehensive brand systems including logos, color palettes, typography, and brand guidelines that establish strong visual presence.",
              icon: "palette",
            },
            {
              title: "UI/UX Design",
              description: "Design intuitive and beautiful user experiences for digital products. Conduct user research, create wireframes and prototypes, and deliver pixel-perfect interfaces that enhance user engagement and satisfaction.",
              icon: "layout",
            },
            {
              title: "Visual Design",
              description: "Craft stunning visual designs for print and digital media. Create engaging layouts, illustrations, and graphics that communicate messages effectively and capture audience attention.",
              icon: "image",
            },
            {
              title: "Art Direction",
              description: "Provide creative direction for campaigns and projects. Guide visual storytelling, establish creative vision, and ensure cohesive execution across all design touchpoints.",
              icon: "eye",
            },
            {
              title: "Motion Graphics",
              description: "Produce dynamic motion graphics and animations that bring brands to life. Create engaging video content, animated logos, and interactive experiences that captivate audiences.",
              icon: "film",
            },
          ],
        },
        order: 6,
        is_visible: true,
      },
      {
        component_type: "achievements_counters",
        content: {
          counters: [
            { label: "Awards Won", value: 18 },
            { label: "Projects Completed", value: 120 },
            { label: "Happy Clients", value: 65 },
            { label: "Years Experience", value: 14 },
            { label: "Design Exhibitions", value: 8 },
          ],
        },
        order: 7,
        is_visible: true,
      },
      {
        component_type: "testimonials_carousel",
        content: {
          testimonials: [
            {
              name: "Michael Johnson",
              role: "CEO, Tech Startup",
              content: "Sarah's creative vision transformed our brand identity completely. The results exceeded our expectations and helped us stand out in a crowded market. Her ability to understand our vision and translate it into stunning visuals is remarkable.",
              rating: 5,
            },
            {
              name: "Emily Davis",
              role: "Marketing Director, Fashion Brand",
              content: "Working with Sarah was a pleasure. Her attention to detail and creative approach is unmatched. The rebrand she created for us increased brand recognition by 40% and received overwhelming positive feedback from our customers.",
              rating: 5,
            },
            {
              name: "Robert Chen",
              role: "Founder, Design Agency",
              content: "Sarah's work consistently pushes creative boundaries while maintaining strategic focus. Her designs are not just beautiful—they're effective. She's a true creative leader who elevates every project she touches.",
              rating: 5,
            },
          ],
        },
        order: 8,
        is_visible: true,
      },
      {
        component_type: "blog_preview_grid",
        content: {
          posts: [
            {
              id: 1,
              title: "The Art of Brand Storytelling Through Design",
              excerpt: "Explore how visual design can tell compelling brand stories that connect with audiences on an emotional level and drive meaningful engagement.",
              author: "Sarah Martinez",
              published_date: "2025-01-12",
              read_time: "6 min read",
              image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
            },
            {
              id: 2,
              title: "Sustainable Design: Creating Beautiful and Responsible Solutions",
              excerpt: "Discover how designers can create stunning visual solutions while prioritizing environmental responsibility and sustainable practices.",
              author: "Sarah Martinez",
              published_date: "2025-01-05",
              read_time: "8 min read",
              image: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=600",
            },
            {
              id: 3,
              title: "Typography Trends: What's Next in 2025",
              excerpt: "A deep dive into emerging typography trends, from variable fonts to experimental typefaces, and how they're shaping modern design.",
              author: "Sarah Martinez",
              published_date: "2024-12-28",
              read_time: "7 min read",
              image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
            },
            {
              id: 4,
              title: "Building Design Systems That Scale",
              excerpt: "Learn how to create comprehensive design systems that maintain consistency while allowing for creative flexibility across large organizations.",
              author: "Sarah Martinez",
              published_date: "2024-12-15",
              read_time: "9 min read",
              image: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=600",
            },
          ],
          posts_per_row: 3,
        },
        order: 9,
        is_visible: true,
      },
      {
        component_type: "contact_form",
        content: {
          title: "Contact Info",
          description: "Let's create something beautiful together. Reach out to discuss your next design project.",
          contact_info: {
            email: "sarah.martinez@email.com",
            phone: "+1 (555) 234-5678",
            location: "Los Angeles, CA, United States",
            linkedin: "https://linkedin.com/in/sarahmartinez",
            website: "https://sarahmartinez.design",
          },
        },
        order: 10,
        is_visible: true,
      },
      {
        component_type: "footer",
        content: {
          copyright_text: "© 2025 Sarah Martinez. All rights reserved.",
          links: [
            { text: "Portfolio", url: "#projects" },
            { text: "About", url: "#about" },
            { text: "Services", url: "#services" },
            { text: "Blog", url: "#blog" },
            { text: "Contact", url: "#contact" },
          ],
          social_links: {
            linkedin: "https://linkedin.com/in/sarahmartinez",
            website: "https://sarahmartinez.design",
            email: "sarah.martinez@email.com",
          },
        },
        order: 11,
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
        component_type: "hero_banner",
        content: {
          title: "Alex Chen",
          subtitle: "Full-Stack Developer | React • Node.js • Python",
          cta_buttons: [
            { text: "View Projects", url: "#projects", variant: "primary" },
            { text: "GitHub", url: "https://github.com/alexchen", variant: "secondary" },
          ],
        },
        order: 1,
        is_visible: true,
      },
      {
        component_type: "about_me_card",
        content: {
          name: "Alex Chen",
          title: "Full-Stack Developer",
          bio: "Passionate full-stack developer with expertise in building scalable web applications and cloud infrastructure. Specialized in modern JavaScript frameworks, microservices architecture, and DevOps practices. Open source contributor and tech enthusiast who loves solving complex problems with elegant code solutions.",
          social_links: {
            github: "https://github.com/alexchen",
            linkedin: "https://linkedin.com/in/alexchen",
            website: "https://alexchen.dev",
          },
        },
        order: 2,
        is_visible: true,
      },
      {
        component_type: "skills_cloud",
        content: {
          skills: [
            "React",
            "Node.js",
            "Python",
            "TypeScript",
            "AWS",
            "Docker",
            "PostgreSQL",
            "Kubernetes",
            "GraphQL",
            "MongoDB",
            "Redis",
            "Microservices",
            "CI/CD",
            "Terraform",
            "JavaScript",
          ],
          display_mode: "cloud",
        },
        order: 3,
        is_visible: true,
      },
      {
        component_type: "project_grid",
        content: {
          projects: [
            {
              id: 1,
              title: "Real-Time Collaboration Platform",
              description: "Built a scalable real-time collaboration platform using React, Node.js, and WebSockets. Supports 1000+ concurrent users with sub-100ms latency. Implemented conflict resolution algorithms and optimized for low-latency communication across global regions.",
              short_description: "Real-time web application",
              github_url: "https://github.com/alexchen/collab-platform",
              live_url: "https://collab-platform.demo",
              technologies: ["React", "Node.js", "WebSockets", "Redis", "PostgreSQL", "TypeScript"],
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
            },
            {
              id: 2,
              title: "Microservices E-Commerce API",
              description: "Designed and implemented a microservices-based e-commerce backend with 15+ services, handling 10K+ requests per minute with 99.9% uptime. Built with event-driven architecture, implemented distributed tracing, and achieved horizontal scalability.",
              short_description: "Microservices architecture",
              github_url: "https://github.com/alexchen/ecommerce-api",
              technologies: ["Python", "FastAPI", "Docker", "Kubernetes", "RabbitMQ", "MongoDB"],
              image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
            },
            {
              id: 3,
              title: "Cloud Infrastructure Automation",
              description: "Developed infrastructure-as-code solution using Terraform and Ansible, automating deployment of multi-region cloud infrastructure. Reduced deployment time from days to minutes and improved reliability with automated testing and rollback capabilities.",
              short_description: "Infrastructure automation",
              github_url: "https://github.com/alexchen/infra-automation",
              technologies: ["Terraform", "Ansible", "AWS", "CI/CD", "Python", "Bash"],
              image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
            },
            {
              id: 4,
              title: "Machine Learning API Service",
              description: "Built production-ready ML inference API service serving deep learning models with auto-scaling capabilities. Implemented model versioning, A/B testing framework, and real-time monitoring. Handles 5K+ predictions per second with 50ms average latency.",
              short_description: "ML inference platform",
              github_url: "https://github.com/alexchen/ml-api",
              live_url: "https://ml-api.demo",
              technologies: ["Python", "FastAPI", "TensorFlow", "Docker", "Kubernetes", "Redis"],
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
            },
            {
              id: 5,
              title: "Distributed Task Queue System",
              description: "Created high-performance distributed task queue system using Redis and RabbitMQ, supporting millions of tasks per day. Implemented priority queues, retry mechanisms, and task scheduling with sub-second precision.",
              short_description: "Task queue system",
              github_url: "https://github.com/alexchen/task-queue",
              technologies: ["Python", "Redis", "RabbitMQ", "Celery", "PostgreSQL", "Docker"],
              image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
            },
            {
              id: 6,
              title: "GraphQL API Gateway",
              description: "Designed and implemented GraphQL API gateway aggregating data from multiple microservices. Built with Apollo Federation, implemented query optimization, and achieved 80% reduction in over-fetching compared to REST endpoints.",
              short_description: "GraphQL gateway",
              github_url: "https://github.com/alexchen/graphql-gateway",
              technologies: ["GraphQL", "Apollo", "Node.js", "TypeScript", "Docker", "Kubernetes"],
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
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
            {
              language: "typescript",
              code: `// GraphQL resolver with data loader
export const userResolver = {
  Query: {
    user: async (_, { id }, { dataLoaders }) => {
      return dataLoaders.user.load(id);
    }
  },
  User: {
    posts: async (user, _, { dataLoaders }) => {
      return dataLoaders.postsByUser.load(user.id);
    }
  }
};`,
              description: "GraphQL resolver with DataLoader for N+1 query optimization",
              filename: "userResolver.ts",
            },
          ],
          show_filters: true,
          filter_categories: ["Web Application", "Microservices", "Infrastructure", "Machine Learning", "Backend", "API"],
        },
        order: 4,
        is_visible: true,
      },
      {
        component_type: "experience_timeline",
        content: {
          experiences: [
            {
              title: "Senior Full-Stack Developer",
              company: "Tech Innovations Inc.",
              startDate: "2021",
              endDate: "Present",
              description: "Lead development of scalable web applications using React, Node.js, and cloud infrastructure. Architected microservices platform handling 50M+ requests monthly. Mentored team of 8 developers and established coding standards and best practices.",
            },
            {
              title: "Full-Stack Developer",
              company: "StartupXYZ",
              startDate: "2018",
              endDate: "2021",
              description: "Built and maintained multiple web applications serving 100K+ users. Developed RESTful APIs, implemented real-time features, and optimized database queries. Contributed to open-source projects and maintained 99.9% uptime.",
            },
            {
              title: "Backend Developer",
              company: "Software Solutions",
              startDate: "2016",
              endDate: "2018",
              description: "Developed backend services using Python and Node.js. Built APIs, designed database schemas, and implemented authentication systems. Gained expertise in cloud services and containerization technologies.",
            },
            {
              title: "Junior Developer",
              company: "Web Agency",
              startDate: "2015",
              endDate: "2016",
              description: "Worked on frontend and backend development projects. Learned modern JavaScript frameworks, version control, and collaborative development practices. Contributed to client projects and internal tools.",
            },
          ],
        },
        order: 5,
        is_visible: true,
      },
      {
        component_type: "services_section",
        content: {
          services: [
            {
              title: "Web Development",
              description: "Build scalable and performant web applications using modern technologies. Create responsive, accessible interfaces with React, Vue, or Angular, and optimize for performance and SEO.",
              icon: "code",
            },
            {
              title: "Cloud Architecture",
              description: "Design and implement cloud-based solutions for optimal performance. Architect scalable systems on AWS, Azure, or GCP with focus on reliability, security, and cost optimization.",
              icon: "cloud",
            },
            {
              title: "API Development",
              description: "Create robust RESTful and GraphQL APIs for seamless integrations. Design APIs with proper authentication, rate limiting, versioning, and comprehensive documentation.",
              icon: "server",
            },
            {
              title: "DevOps & CI/CD",
              description: "Set up automated deployment pipelines and infrastructure as code. Implement CI/CD workflows, containerization, and monitoring solutions for reliable software delivery.",
              icon: "settings",
            },
            {
              title: "System Architecture",
              description: "Design distributed systems and microservices architectures. Plan for scalability, reliability, and maintainability while considering performance and cost constraints.",
              icon: "layers",
            },
          ],
        },
        order: 6,
        is_visible: true,
      },
      {
        component_type: "achievements_counters",
        content: {
          counters: [
            { label: "Open Source Projects", value: 35 },
            { label: "GitHub Stars", value: 2500 },
            { label: "Contributions", value: 1200 },
            { label: "Years Coding", value: 10 },
            { label: "Projects Deployed", value: 50 },
          ],
        },
        order: 7,
        is_visible: true,
      },
      {
        component_type: "testimonials_carousel",
        content: {
          testimonials: [
            {
              name: "Jessica Park",
              role: "CTO, Tech Innovations Inc.",
              content: "Alex is an exceptional developer who consistently delivers high-quality solutions. His expertise in cloud architecture and microservices has been instrumental in scaling our platform to handle millions of users.",
              rating: 5,
            },
            {
              name: "Mark Thompson",
              role: "Engineering Lead, StartupXYZ",
              content: "Working with Alex was a great experience. He's not just a skilled coder but also a great problem solver. His contributions to our codebase significantly improved our system's performance and reliability.",
              rating: 5,
            },
            {
              name: "Lisa Wang",
              role: "Product Manager, Software Solutions",
              content: "Alex's technical expertise and attention to detail are outstanding. He always goes above and beyond to ensure the code is clean, well-documented, and maintainable. A true professional.",
              rating: 5,
            },
          ],
        },
        order: 8,
        is_visible: true,
      },
      {
        component_type: "blog_preview_grid",
        content: {
          posts: [
            {
              id: 1,
              title: "Building Scalable Microservices: Lessons Learned",
              excerpt: "Sharing insights from building microservices architecture that handles millions of requests, including design patterns, challenges, and best practices.",
              author: "Alex Chen",
              published_date: "2025-01-10",
              read_time: "12 min read",
              image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600",
            },
            {
              id: 2,
              title: "Optimizing React Performance: A Deep Dive",
              excerpt: "Exploring advanced React optimization techniques including code splitting, memoization, and virtual DOM optimization strategies.",
              author: "Alex Chen",
              published_date: "2025-01-03",
              read_time: "10 min read",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
            },
            {
              id: 3,
              title: "GraphQL vs REST: When to Use What",
              excerpt: "A comprehensive comparison of GraphQL and REST APIs, discussing use cases, trade-offs, and when each approach makes sense.",
              author: "Alex Chen",
              published_date: "2024-12-25",
              read_time: "8 min read",
              image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600",
            },
            {
              id: 4,
              title: "Infrastructure as Code: Terraform Best Practices",
              excerpt: "Best practices for managing cloud infrastructure with Terraform, including module design, state management, and CI/CD integration.",
              author: "Alex Chen",
              published_date: "2024-12-18",
              read_time: "11 min read",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
            },
          ],
          posts_per_row: 3,
        },
        order: 9,
        is_visible: true,
      },
      {
        component_type: "contact_form",
        content: {
          title: "Contact Info",
          description: "Let's build something amazing together. Reach out to discuss your next project.",
          contact_info: {
            email: "alex.chen@email.com",
            phone: "+1 (555) 345-6789",
            location: "San Francisco, CA, United States",
            github: "https://github.com/alexchen",
            linkedin: "https://linkedin.com/in/alexchen",
            website: "https://alexchen.dev",
          },
        },
        order: 10,
        is_visible: true,
      },
      {
        component_type: "footer",
        content: {
          copyright_text: "© 2025 Alex Chen. All rights reserved.",
          links: [
            { text: "Projects", url: "#projects" },
            { text: "Blog", url: "#blog" },
            { text: "About", url: "#about" },
            { text: "Contact", url: "#contact" },
          ],
          social_links: {
            github: "https://github.com/alexchen",
            linkedin: "https://linkedin.com/in/alexchen",
            website: "https://alexchen.dev",
            email: "alex.chen@email.com",
          },
        },
        order: 11,
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
            "Roadmap Planning",
            "Stakeholder Management",
            "A/B Testing",
            "Metrics & KPIs",
            "User Experience",
            "Market Analysis",
            "Feature Prioritization",
            "Cross-functional Collaboration",
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
              description: "Led product development for mobile banking application serving 500K+ users. Increased user engagement by 45% through feature optimization and improved onboarding flow.",
              short_description: "Mobile banking product",
              technologies: ["Product Management", "User Research", "Agile"],
            },
            {
              id: 2,
              title: "SaaS Analytics Platform",
              description: "Built analytics platform from concept to launch, achieving 10K+ active users in first year. Defined product vision, managed roadmap, and coordinated cross-functional team of 15 members.",
              short_description: "Analytics platform",
              technologies: ["Product Strategy", "Data Analytics", "SaaS"],
            },
            {
              id: 3,
              title: "E-Commerce Mobile Experience",
              description: "Redesigned mobile shopping experience resulting in 30% increase in conversion rate and 25% reduction in cart abandonment. Conducted extensive user research and A/B testing.",
              short_description: "E-commerce mobile redesign",
              technologies: ["UX Research", "Conversion Optimization", "Mobile"],
            },
            {
              id: 4,
              title: "Enterprise Collaboration Tool",
              description: "Launched enterprise collaboration platform serving 50K+ users across 200+ organizations. Managed product roadmap, feature prioritization, and stakeholder communications.",
              short_description: "Enterprise collaboration",
              technologies: ["Enterprise SaaS", "Product Roadmap", "B2B"],
            },
            {
              id: 5,
              title: "Healthcare Telemedicine Platform",
              description: "Led product development for telemedicine platform connecting patients with healthcare providers. Improved patient satisfaction scores by 40% and reduced appointment wait times.",
              short_description: "Telemedicine platform",
              technologies: ["Healthcare Tech", "Product Development", "User Experience"],
            },
          ],
        },
        order: 4,
        is_visible: true,
      },
      {
        component_type: "experience_timeline",
        content: {
          experiences: [
            {
              title: "Product Manager",
              company: "Innovation Labs",
              startDate: "2020",
              endDate: "Present",
              description: "Lead product strategy and development for mobile and web applications. Manage product roadmap, coordinate cross-functional teams, and drive product decisions based on data and user insights. Launched 3 major products with combined user base of 1M+.",
            },
            {
              title: "Associate Product Manager",
              company: "Tech Corp",
              startDate: "2018",
              endDate: "2020",
              description: "Managed product roadmap and collaborated with engineering teams on feature delivery. Conducted user research, analyzed metrics, and prioritized features. Contributed to product strategy and helped increase user retention by 35%.",
            },
            {
              title: "Product Analyst",
              company: "Startup Inc.",
              startDate: "2016",
              endDate: "2018",
              description: "Analyzed product metrics, conducted user research, and supported product decisions. Created dashboards, performed A/B tests, and provided data-driven insights to product team. Gained expertise in analytics tools and user research methods.",
            },
            {
              title: "Business Analyst",
              company: "Consulting Firm",
              startDate: "2014",
              endDate: "2016",
              description: "Supported product and business initiatives through data analysis and research. Documented requirements, analyzed market trends, and prepared business cases. Developed foundation in product thinking and business strategy.",
            },
          ],
        },
        order: 5,
        is_visible: true,
      },
      {
        component_type: "services_section",
        content: {
          services: [
            {
              title: "Product Strategy",
              description: "Develop comprehensive product strategies aligned with business goals. Define product vision, create roadmaps, and establish success metrics.",
              icon: "target",
            },
            {
              title: "User Research",
              description: "Conduct user research to inform product decisions and improvements. Gather insights through interviews, surveys, and usability testing.",
              icon: "users",
            },
            {
              title: "Product Development",
              description: "Lead product development from concept to launch. Coordinate with engineering, design, and business teams to deliver successful products.",
              icon: "rocket",
            },
            {
              title: "Data Analysis",
              description: "Analyze product metrics and user behavior to drive data-informed decisions. Create dashboards and reports to track product performance.",
              icon: "bar-chart",
            },
          ],
        },
        order: 6,
        is_visible: true,
      },
      {
        component_type: "achievements_counters",
        content: {
          counters: [
            { label: "Products Launched", value: 8 },
            { label: "Users Served", value: 1, suffix: "M+" },
            { label: "Years Experience", value: 10 },
            { label: "Team Members Led", value: 25 },
          ],
        },
        order: 7,
        is_visible: true,
      },
      {
        component_type: "testimonials_carousel",
        content: {
          testimonials: [
            {
              name: "James Mitchell",
              role: "CEO, Innovation Labs",
              content: "Emma's product leadership has been instrumental in our success. Her ability to balance user needs with business objectives is exceptional, and she consistently delivers products that users love.",
              rating: 5,
            },
            {
              name: "Rachel Kim",
              role: "Engineering Director, Tech Corp",
              content: "Working with Emma is always a pleasure. Her clear communication, data-driven approach, and strategic thinking make her an outstanding product manager. She truly understands both users and technology.",
              rating: 5,
            },
          ],
        },
        order: 8,
        is_visible: true,
      },
      {
        component_type: "contact_form",
        content: {
          title: "Contact Info",
          description: "Let's discuss your next product challenge.",
          contact_info: {
            email: "emma.wilson@email.com",
            phone: "+1 (555) 456-7890",
            location: "Seattle, WA, United States",
            linkedin: "https://linkedin.com/in/emmawilson",
          },
        },
        order: 9,
        is_visible: true,
      },
      {
        component_type: "footer",
        content: {
          copyright_text: "© 2025 Emma Wilson. All rights reserved.",
          links: [
            { text: "About", url: "#about" },
            { text: "Projects", url: "#projects" },
            { text: "Contact", url: "#contact" },
          ],
          social_links: {
            linkedin: "https://linkedin.com/in/emmawilson",
            email: "emma.wilson@email.com",
          },
        },
        order: 10,
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
        component_type: "hero_banner",
        content: {
          title: "Jordan Taylor",
          subtitle: "Digital Strategist | Innovation & Growth",
          cta_buttons: [
            { text: "Explore Work", url: "#projects", variant: "primary" },
            { text: "Let's Connect", url: "#contact", variant: "secondary" },
          ],
        },
        order: 1,
        is_visible: true,
      },
      {
        component_type: "about_me_card",
        content: {
          name: "Jordan Taylor",
          title: "Digital Strategist",
          bio: "Innovation-driven digital strategist with a passion for transforming businesses through technology and creative thinking. I specialize in developing growth strategies, leading digital transformation initiatives, and building high-performing teams. My approach combines data-driven insights with creative problem-solving to deliver exceptional results.",
          social_links: {
            linkedin: "https://linkedin.com/in/jordantaylor",
            email: "jordan.taylor@email.com",
            website: "https://jordantaylor.com",
          },
        },
        order: 2,
        is_visible: true,
      },
      {
        component_type: "skills_cloud",
        content: {
          skills: [
            "Digital Strategy",
            "Growth Marketing",
            "Innovation Management",
            "Team Leadership",
            "Data Analytics",
            "Brand Development",
            "Content Strategy",
            "Market Research",
            "Business Development",
            "Strategic Planning",
            "Digital Transformation",
            "Performance Marketing",
            "Customer Acquisition",
            "Revenue Optimization",
            "Change Management",
          ],
          display_mode: "cloud",
        },
        order: 3,
        is_visible: true,
      },
      {
        component_type: "project_grid",
        content: {
          projects: [
            {
              id: 1,
              title: "Startup Growth Acceleration",
              description: "Developed and executed growth strategy for early-stage startup, achieving 300% user growth and $5M Series A funding within 12 months. Implemented data-driven marketing campaigns, optimized conversion funnels, and built scalable growth systems.",
              short_description: "Growth strategy execution",
              technologies: ["Growth Hacking", "Digital Marketing", "Analytics", "Conversion Optimization"],
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
            },
            {
              id: 2,
              title: "Enterprise Digital Transformation",
              description: "Led digital transformation initiative for Fortune 500 company, modernizing legacy systems and processes, resulting in 50% operational efficiency improvement. Managed $20M budget and coordinated 50+ team members across multiple departments.",
              short_description: "Digital transformation",
              technologies: ["Change Management", "Process Innovation", "Technology Integration", "Digital Strategy"],
              image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
            },
            {
              id: 3,
              title: "E-Commerce Revenue Optimization",
              description: "Optimized e-commerce platform resulting in 60% increase in revenue and 35% improvement in customer lifetime value. Implemented personalization engine, improved checkout flow, and launched loyalty program.",
              short_description: "Revenue optimization",
              technologies: ["E-Commerce", "Data Analytics", "Personalization", "Customer Retention"],
              image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
            },
            {
              id: 4,
              title: "SaaS Product Launch Strategy",
              description: "Developed and executed go-to-market strategy for SaaS product, achieving 10K+ signups in first quarter and 40% conversion rate from trial to paid. Created content marketing engine and referral program.",
              short_description: "SaaS product launch",
              technologies: ["Product Marketing", "Content Strategy", "Growth Hacking", "SaaS"],
              image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            },
            {
              id: 5,
              title: "Brand Rejuvenation Campaign",
              description: "Led comprehensive brand rejuvenation campaign for established company, increasing brand awareness by 80% and market share by 25%. Redesigned brand identity, launched new marketing channels, and repositioned brand in market.",
              short_description: "Brand transformation",
              technologies: ["Brand Strategy", "Marketing", "Content Creation", "Brand Development"],
              image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
            },
            {
              id: 6,
              title: "International Market Expansion",
              description: "Developed and executed market entry strategy for three international markets, achieving $15M in first-year revenue. Conducted market research, built local partnerships, and adapted marketing strategies for cultural differences.",
              short_description: "International expansion",
              technologies: ["Market Research", "Business Development", "International Strategy", "Partnership Development"],
              image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
            },
          ],
          show_filters: true,
          filter_categories: ["Growth", "Transformation", "E-Commerce", "SaaS", "Branding", "International"],
        },
        order: 4,
        is_visible: true,
      },
      {
        component_type: "experience_timeline",
        content: {
          experiences: [
            {
              title: "Digital Strategist",
              company: "Growth Partners",
              startDate: "2021",
              endDate: "Present",
              description: "Lead digital transformation initiatives and growth strategies for enterprise clients. Manage portfolio of 15+ clients with combined revenue of $500M+. Built high-performing team of 20 strategists and consistently exceed client growth targets by average of 150%.",
            },
            {
              title: "Marketing Strategist",
              company: "Digital Agency",
              startDate: "2018",
              endDate: "2021",
              description: "Developed and executed digital marketing strategies resulting in 200% growth for clients. Led campaigns for Fortune 500 companies, managed $10M+ marketing budgets, and built data-driven marketing frameworks. Increased client retention rate to 95%.",
            },
            {
              title: "Growth Marketing Manager",
              company: "Tech Startup",
              startDate: "2016",
              endDate: "2018",
              description: "Built growth marketing function from scratch, scaling user base from 10K to 500K in 18 months. Implemented growth hacking techniques, optimized conversion funnels, and launched viral referral program. Reduced customer acquisition cost by 60%.",
            },
            {
              title: "Marketing Analyst",
              company: "Consulting Group",
              startDate: "2014",
              endDate: "2016",
              description: "Analyzed marketing performance, conducted market research, and supported strategic initiatives. Created dashboards, performed competitive analysis, and provided insights to drive marketing decisions. Gained expertise in analytics and marketing tools.",
            },
          ],
        },
        order: 5,
        is_visible: true,
      },
      {
        component_type: "services_section",
        content: {
          services: [
            {
              title: "Digital Strategy",
              description: "Develop comprehensive digital strategies to drive business growth. Create roadmaps, define KPIs, and establish frameworks for digital transformation that align with business objectives.",
              icon: "trending-up",
            },
            {
              title: "Growth Marketing",
              description: "Execute data-driven marketing campaigns for rapid user acquisition. Build scalable growth systems, optimize conversion funnels, and implement growth hacking techniques to accelerate business growth.",
              icon: "zap",
            },
            {
              title: "Innovation Consulting",
              description: "Guide organizations through digital transformation and innovation. Identify opportunities, develop innovation strategies, and help organizations adapt to changing market conditions.",
              icon: "lightbulb",
            },
            {
              title: "Brand Development",
              description: "Develop and strengthen brand identity and positioning. Create brand strategies, design brand experiences, and build brand equity that resonates with target audiences.",
              icon: "star",
            },
            {
              title: "Revenue Optimization",
              description: "Optimize revenue streams and improve profitability. Analyze pricing strategies, optimize sales processes, and implement systems to maximize customer lifetime value.",
              icon: "dollar-sign",
            },
          ],
        },
        order: 6,
        is_visible: true,
      },
      {
        component_type: "achievements_counters",
        content: {
          counters: [
            { label: "Growth Projects", value: 45 },
            { label: "Client Success Rate", value: 98, suffix: "%" },
            { label: "Years Experience", value: 11 },
            { label: "Revenue Generated", value: 100, suffix: "M" },
            { label: "Team Members Led", value: 35 },
          ],
        },
        order: 7,
        is_visible: true,
      },
      {
        component_type: "testimonials_carousel",
        content: {
          testimonials: [
            {
              name: "Robert Smith",
              role: "CEO, Startup Inc.",
              content: "Jordan's strategic insights helped us achieve 300% growth in just 12 months. Their ability to identify opportunities and execute growth strategies is truly exceptional. Working with Jordan was a game-changer for our business.",
              rating: 5,
            },
            {
              name: "Lisa Anderson",
              role: "CMO, Enterprise Co.",
              content: "Working with Jordan transformed our digital presence. The results speak for themselves—we saw significant improvements in brand awareness, customer engagement, and revenue. Jordan's strategic thinking and execution are outstanding.",
              rating: 5,
            },
            {
              name: "David Chen",
              role: "VP of Growth, Tech Company",
              content: "Jordan is one of the best strategists I've worked with. Their data-driven approach combined with creative thinking consistently delivers exceptional results. Jordan helped us scale from startup to market leader.",
              rating: 5,
            },
          ],
        },
        order: 8,
        is_visible: true,
      },
      {
        component_type: "blog_preview_grid",
        content: {
          posts: [
            {
              id: 1,
              title: "The Future of Growth Marketing: Trends to Watch",
              excerpt: "Exploring emerging trends in growth marketing, from AI-powered personalization to community-driven growth, and how they're reshaping customer acquisition strategies.",
              author: "Jordan Taylor",
              published_date: "2025-01-14",
              read_time: "9 min read",
              image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
            },
            {
              id: 2,
              title: "Digital Transformation: A Strategic Guide",
              excerpt: "A comprehensive guide to digital transformation, covering strategy development, implementation frameworks, and common pitfalls to avoid when modernizing business operations.",
              author: "Jordan Taylor",
              published_date: "2025-01-07",
              read_time: "11 min read",
              image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600",
            },
            {
              id: 3,
              title: "Building High-Performing Growth Teams",
              excerpt: "Insights on building and managing growth teams that drive results, including team structure, hiring strategies, and creating a culture of experimentation and data-driven decision making.",
              author: "Jordan Taylor",
              published_date: "2024-12-30",
              read_time: "8 min read",
              image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600",
            },
            {
              id: 4,
              title: "Revenue Optimization: Beyond Pricing",
              excerpt: "Exploring advanced revenue optimization strategies beyond pricing, including customer segmentation, upsell/cross-sell tactics, and retention strategies that maximize lifetime value.",
              author: "Jordan Taylor",
              published_date: "2024-12-22",
              read_time: "10 min read",
              image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600",
            },
          ],
          posts_per_row: 3,
        },
        order: 9,
        is_visible: true,
      },
      {
        component_type: "contact_form",
        content: {
          title: "Contact Info",
          description: "Let's discuss how we can accelerate your growth and transform your business.",
          contact_info: {
            email: "jordan.taylor@email.com",
            phone: "+1 (555) 345-6789",
            location: "Austin, TX, United States",
            linkedin: "https://linkedin.com/in/jordantaylor",
            website: "https://jordantaylor.com",
          },
        },
        order: 10,
        is_visible: true,
      },
      {
        component_type: "footer",
        content: {
          copyright_text: "© 2025 Jordan Taylor. All rights reserved.",
          links: [
            { text: "About", url: "#about" },
            { text: "Services", url: "#services" },
            { text: "Projects", url: "#projects" },
            { text: "Blog", url: "#blog" },
            { text: "Contact", url: "#contact" },
          ],
          social_links: {
            linkedin: "https://linkedin.com/in/jordantaylor",
            website: "https://jordantaylor.com",
            email: "jordan.taylor@email.com",
          },
        },
        order: 11,
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

