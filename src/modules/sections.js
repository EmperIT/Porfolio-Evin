import introduceImage from "../images/introduce.png";
import profileImage from "../images/profile.png";
import awgProjectImage from "../images/projects/bgAwg.png";
import thaiyenProjectImage from "../images/projects/bgTY.png";
import bmbsoftProjectImage from "../images/projects/bgBmbsoft.png";
import awgLogo from "../images/projects/logoAwg.png";
import thaiyenLogo from "../images/projects/logoTY.png";
import bmbsoftLogo from "../images/projects/bmbsoftvn_logo.svg";
import freecodeCampLogo from "../images/certificate/freecodeCamp.png";
import hackerRankCertImage from "../images/certificate/fe_hr.png";
import agileScrumCertImage from "../images/certificate/agile.png";
import freecodeCampCertImage from "../images/certificate/js_freecodecamp.png";
import hackerRankLogo from "../images/certificate/hackerank.png";
import techbaseLogo from "../images/certificate/techbase.png";

export const allImages = [
  introduceImage,
  profileImage,
  awgProjectImage,
  thaiyenProjectImage,
  bmbsoftProjectImage,
  awgLogo,
  thaiyenLogo,
  bmbsoftLogo,
  freecodeCampLogo,
  hackerRankCertImage,
  agileScrumCertImage,
  freecodeCampCertImage,
  hackerRankLogo,
  techbaseLogo
];

export const sectionOrder = [
  "introduce",
  "about",
  "experience",
  "projects",
  "license",
  "skills",
];

export const sectionContent = {
  introduce: {
    kicker: "01",
    title: "I'm Nguyen Minh Truong (Evin)",
    body: "Crafting modern, interactive web experiences. If you want to know me better, let's explore me.",
    rightLabel: "Role",
    rightBody: "",
    rightImage: introduceImage,
  },
  about: {
    kicker: "02",
    leftLabel: "Some information",
    title: "About me",
    body: "I started from a strong foundation in **Computer Science**, where I was trained to think in systems, logic, and performance. Over time, I realized my true strength is turning complex ideas into **user-centric products** that people can actually feel and use.\n\nIn the past year, I have focused deeply on **Frontend Development** and product execution. I enjoy the balance between visual quality and engineering discipline, especially when building **high-performance systems** for real business workflows.\n\nMy current focus is **scalable architecture**, **clean maintainable code**, and **performance optimization**. Long term, I aim to build large-scale platforms that stay smooth, reliable, and ready to grow with business demands.",
    rightLabel: "Contact me",
    rightBody: "Connect with me through the links below.",
    profileImage,
    contactItems: [
      {
        key: "email",
        label: "Email",
        tooltip: "Email",
        href: "mailto:minhtruongb16@gmail.com",
        icon: "mail",
      },
      {
        key: "github",
        label: "GitHub",
        tooltip: "GitHub",
        href: "https://github.com/EmperIT",
        icon: "github",
      },
      {
        key: "cv",
        label: "Resume",
        tooltip: "Resume",
        href: "https://drive.google.com/drive/folders/1KBpVwOV_fGl0_sxeGw2uGahu3xK3X-yx?usp=drive_link",
        icon: "cv",
      },
      {
        key: "linkedin",
        label: "LinkedIn",
        tooltip: "LinkedIn",
        href: "https://www.linkedin.com/in/evin-nguyen-t91204/",
        icon: "linkedin",
      },
      {
        key: "phone",
        label: "Phone",
        tooltip: "Phone",
        href: "tel:0334053171",
        icon: "phone",
      },
    ],
  },
  experience: {
    kicker: "03",
    leftLabel: "Experience",
    title: "My Experience Journal",
    body: "From academic foundations to real product delivery, each stage reflects a stronger level of ownership and execution.",
    rightLabel: "Timeline focus",
    rightBody:
      "The timeline below shows what I actually worked on, how I grew, and the type of impact I created at each step.",
    timeline: [
      {
        date: "12/2025",
        title: "Fresher Frontend Developer at Bmbsoft",
        detail:
          "Contributed to CMS, App projects in a production team environment.",
        highlights: [
          "Worked with CMS ecosystems like WordPress and Shopify for business management and commerce use cases.",
          "Built and supported ERP-facing features connected to operational workflows across web platforms.",
          "Handled standout real-time and mobile-notification cases in a coffee sales app, including SignalR and FCM event flows.",
        ],
      },
      {
        date: "08/2025",
        title: "Freelance Project at Tan Dai Hung",
        detail:
          "Delivered a Management ERP focused on warehouse operations from requirements to deployment.",
        highlights: [
          "Built key warehouse management flows: inbound and outbound processing, stock tracking, and inventory status handling.",
          "Mapped business workflows into ERP modules with clear role-based operations and practical screen flows.",
          "Maintained delivery quality through iterative feedback with stakeholders and stable release updates.",
        ],
      },
      {
        date: "2024",
        title: "Shifted Toward Software Development",
        detail:
          "Moved from theory-heavy learning to building end-to-end software products.",
        highlights: [
          "Focused on JavaScript, React, Flutter to build both web and mobile platforms with modern frontend architecture, and reusable component design.",
          "Built personal and team projects with real UI flows instead of isolated exercises.",
          "Started prioritizing clean code, maintainability, and user-centered implementation.",
        ],
      },
      {
        date: "2022 - 2026",
        title: "Computer Science Major - Ton Duc Thang University",
        detail:
          "Built core CS fundamentals and a disciplined engineering mindset. Graduated with a GPA of 8.0.",
        highlights: [
          "Studied data structures, algorithms, OOP, databases, and operating systems.",
          "Practiced problem-solving with C/C++, Java, Python through lab assignments and mini projects.",
          "Learned how to break complex problems into maintainable program modules.",
        ],
      },
    ],
  },
  projects: {
    kicker: "04",
    leftLabel: "Projects",
    title: "Featured Projects",
    body: "My featured projects which showcase my skills and experience. Hover the image to reveal the project link and grab a quick overview, then click See details to explore the scope and execution.",
    rightLabel: "Project panels",
    rightBody:
      "Project cards start collapsed to keep the panel clean. Open a card to view summary, key features, stack, and live domain.",
    projects: [
      {
        id: "awg",
        name: "AWG - American Wire Group",
        image: awgProjectImage,
        logo: awgLogo,
        role: "Frontend Developer",
        company: "Bmbsoft",
        domainUrl: "https://www.buyawg.com",
        stack: ["Shopify"],
        summary:
          "Built and customized a B2B Shopify commerce experience for American Wire Group to serve utility, renewable energy, BESS, and emergency sectors. The project focused on transforming a technical catalog into a faster, business-friendly buying journey for account-based customers.",
        detail:
          "I handled frontend theme implementation for high-volume catalog pages, product detail structures, and reusable commerce components so users could evaluate technical products quickly and complete procurement steps with less friction.",
        highlights: [
          "Multi-market storefront segmented by industry use case and business need.",
          "Detailed product pages with variants, swatches, media, and technical information blocks.",
          "Advanced discovery with search, filters, category navigation, and collection layouts for large catalogs.",
          "Quick order, bulk order, cart/checkout support, quote requests, and B2B account flows.",
        ],
      },
      {
        id: "thaiyen",
        name: "Thai Yen Ecommerce Internal",
        image: thaiyenProjectImage,
        logo: thaiyenLogo,
        role: "Frontend Developer",
        company: "Bmbsoft",
        domainUrl: "https://www.apple.com/vn/search/thái-yên?src=globalnav",
        stack: ["React Native", "React.js", "SignalR", "FCM"],
        summary:
          "Developed an internal omnichannel commerce platform for THAIYEN CAFE, connecting a web admin system and mobile ordering app. The goal was to unify operations, improve real-time order handling, and strengthen customer retention through loyalty-driven flows.",
        detail:
          "I implemented frontend modules across web and mobile interfaces, integrated real-time communication pipelines, and optimized key ordering paths to help admin, shipper, and customer sides stay synchronized throughout daily operations.",
        highlights: [
          "Centralized dashboard for stores, products, customers, employees, and role permissions.",
          "Real-time full order lifecycle from creation and processing to delivery status updates.",
          "Mobile app flow for product discovery, checkout, delivery/pickup, and payment completion.",
          "Loyalty engine with points, vouchers, notifications, and reporting by branch/channel/time.",
        ],
      },
      {
        id: "bmbsoft-landing",
        name: "Dynamic BMBSoft Landing Page",
        image: bmbsoftProjectImage,
        logo: bmbsoftLogo,
        role: "Frontend Developer",
        company: "Bmbsoft",
        domainUrl: "https://www.bmbsoft.com.vn/",
        stack: ["Next.js", "TypeScript", "Tailwind CSS", "WordPress"],
        summary:
          "Built a Backend-for-Frontend (BFF) layer using NextJs API Routes to securely proxy requests to a headless WordPress CMS.",
        detail:
          "Developed an image resolution layer with Cloudinary CDN, automated media synchronization, and optimized WordPress REST APIs with caching to improve core web vitals and request reliability.",
        highlights: [
          "Implemented lazy loading for CMS-driven page sections using a custom slug-and-section query mechanism.",
          "Developed automated media synchronization between WordPress and Cloudinary.",
          "Built optimized WordPress REST APIs using WP_Query and Advanced Custom Fields (ACF).",
          "Implemented API caching with WordPress Transients and automatic cache invalidation.",
        ],
      },
    ],
  },
  license: {
    kicker: "05",
    leftLabel: "License",
    title: "License and Certification",
    body: "Credentials and practical skills validated through assessments and professional training. Hover the image to open the credential link.",
    rightLabel: "Certification panels",
    rightBody:
      "Issued date and Credential ID are optional and shown when available.",
    certifications: [
      {
        id: "fcc-js-v9",
        name: "JavaScript Certification",
        issuer: "freeCodeCamp",
        issued: "04/2026",
        credentialId: "nguyenminhtruong-jsv9",
        skills: ["JavaScript"],
        link: "https://www.freecodecamp.org/certification/nguyenminhtruong/javascript-v9",
        logo: freecodeCampLogo,
        image: freecodeCampCertImage,
      },
      {
        id: "hackerrank-fe",
        name: "Certification of Accomplishment (Frontend Developer)",
        issuer: "HackerRank",
        issued: "04/2026",
        credentialId: "4D9A702285C1",
        skills: ["ReactJS"],
        link: "https://www.hackerrank.com/certificates/4d9a702285c1",
        logo: hackerRankLogo,
        image: hackerRankCertImage,
      },
      {
        id: "agile-scrum-techbase",
        name: "Agile Scrum Certifications",
        issuer: "Techbase VietNam Co., Ltd",
        issued: "04/2024",
        skills: ["Scrum", "Agile Application Development"],
        link: "#",
        logo: techbaseLogo,
        image: agileScrumCertImage,
      },
    ],
  },
  skills: {
    kicker: "06",
    leftLabel: "Skills",
    title: "My Skills Map",
    body: "A structured snapshot of the tools, platforms, and collaboration strengths I use to turn product ideas into working experiences across web, mobile, CMS, and AI-oriented systems.",
    rightLabel: "Stack overview",
    rightBody:
      "A quick scan of my technical range, delivery workflow, and team-facing strengths. Each cluster represents the environments where I can contribute with confidence.",
    groups: [
      {
        title: "Languages",
        note: "Core programming languages I use across application, scripting, and product development tasks.",
        items: [
          {
            name: "C",
            icon: "https://icongr.am/devicon/c-plain.svg?size=32&color=ffffff",
          },
          {
            name: "C#",
            icon: "https://icongr.am/devicon/csharp-plain.svg?size=32&color=ffffff",
          },
          {
            name: "Java",
            icon: "https://icongr.am/devicon/java-plain.svg?size=32&color=ffffff",
          },
          {
            name: "JavaScript",
            icon: "https://cdn.simpleicons.org/javascript/white",
          },
          {
            name: "TypeScript",
            icon: "https://cdn.simpleicons.org/typescript/white",
          },
          { name: "Python", icon: "https://cdn.simpleicons.org/python/white" },
          { name: "Dart", icon: "https://cdn.simpleicons.org/dart/white" },
          { name: "Kotlin", icon: "https://cdn.simpleicons.org/kotlin/white" },
          { name: "PHP", icon: "https://cdn.simpleicons.org/php/white" },
          { name: "Liquid", icon: "https://cdn.simpleicons.org/shopify/white" },
        ],
      },
      {
        title: "Web Development",
        note: "Frontend technologies for building responsive, modern, and production-ready web interfaces.",
        items: [
          { name: "ReactJS", icon: "https://cdn.simpleicons.org/react/white" },
          {
            name: "Next.js",
            icon: "https://cdn.simpleicons.org/nextdotjs/white",
          },
          { name: "Astro.js", icon: "https://cdn.simpleicons.org/astro/white" },
          { name: "HTML5", icon: "https://cdn.simpleicons.org/html5/white" },
          { name: "CSS3", icon: "https://cdn.simpleicons.org/css/white" },
          {
            name: "Tailwind CSS",
            icon: "https://cdn.simpleicons.org/tailwindcss/white",
          },
          { name: "Material UI", icon: "https://cdn.simpleicons.org/mui/white" },
          { name: "Ant Design", icon: "https://cdn.simpleicons.org/antdesign/white" },
          { name: "Bootstrap", icon: "https://cdn.simpleicons.org/bootstrap/white" },
        ],
      },
      {
        title: "Mobile Development",
        note: "Cross-platform and native mobile stacks for app delivery and real product workflows.",
        items: [
          {
            name: "Flutter",
            icon: "https://cdn.simpleicons.org/flutter/white",
          },
          {
            name: "React Native",
            icon: "https://cdn.simpleicons.org/react/white",
          },
          {
            name: "Android",
            icon: "https://cdn.simpleicons.org/android/white",
          },
        ],
      },
      {
        title: "State Management",
        note: "Patterns and libraries I use to keep application state scalable, predictable, and easy to maintain.",
        items: ["Redux", "Redux Persist", "Zustand", "Context API", "Provider", "Bloc"],
      },
      {
        title: "Database",
        note: "Databases I have worked with for data storage and management.",
        items: [
          { name: "SQL Server", icon: "https://icongr.am/simple/microsoftsqlserver.svg?size=32&color=ffffff" },
          { name: "MongoDB", icon: "https://cdn.simpleicons.org/mongodb/white" },
          { name: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql/white" },
        ],
      },
      {
        title: "CMS",
        note: "Platforms I have worked with for commerce, content operations, and business-oriented websites.",
        items: [
          {
            name: "WordPress",
            icon: "https://cdn.simpleicons.org/wordpress/white",
          },
          {
            name: "Shopify",
            icon: "https://cdn.simpleicons.org/shopify/white",
          },
        ],
      },
      {
        title: "Tools",
        note: "Core workflow tools I use for version control, API testing, documentation, and design handoff.",
        items: [
          { name: "Git", icon: "https://cdn.simpleicons.org/git/white" },
          { name: "GitHub", icon: "https://cdn.simpleicons.org/github/white" },
          {
            name: "Postman",
            icon: "https://cdn.simpleicons.org/postman/white",
          },
          {
            name: "Swagger",
            icon: "https://cdn.simpleicons.org/swagger/white",
          },
          { name: "Figma", icon: "https://cdn.simpleicons.org/figma/white" },
        ],
      },
      {
        title: "Soft Skills",
        note: "People and delivery strengths that help projects move clearly, on time, and with strong collaboration.",
        items: [
          "Presentation & communication",
          "Timeline planning",
          "Schedule organization",
          "Team coordination",
          "Teamwork",
          "Task prioritization",
          "Cross-functional collaboration",
          "Ownership mindset",
        ],
      },
      {
        title: "Other",
        note: "Broader technical knowledge that supports product thinking and future-facing engineering work.",
        items: ["Machine Learning", "Deep Learning", "NLP", "Big Data"],
      },
    ],
  },
};
