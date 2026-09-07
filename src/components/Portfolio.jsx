import React, { useState } from "react";
import "./portfolio/Portfolio.css";

const PROJECTS = [
  {
    title: "WebOS Simulator",
    tagline: "In-Browser Operating System with POSIX VFS & Process Manager",
    tech: ["React 19", "Vite", "Vitest", "POSIX VFS", "Web Storage"],
    metrics: "100% test coverage on core VFS; 60 FPS window compositor; 0 external UI libraries",
    description:
      "Engineered an event-driven desktop environment with hierarchical file system, terminal emulator, host OS file ingestion, and multi-instance window lifecycle management.",
    link: "https://github.com/manascodr/operating-system",
  },
  {
    title: "Distributed Key-Value Store",
    tagline: "High-Throughput Raft Consensus Storage Engine",
    tech: ["Go", "gRPC", "Protobuf", "Raft Consensus", "LSM-Tree"],
    metrics: "Sub-5ms write latency; linearizable reads; automated leader failover in <200ms",
    description:
      "Implemented a distributed fault-tolerant key-value store using the Raft consensus algorithm with write-ahead logging (WAL) and snapshotting.",
    link: "https://github.com",
  },
  {
    title: "Real-Time Collaborative Canvas",
    tagline: "CRDT-Powered Multiplayer Whiteboard",
    tech: ["TypeScript", "WebSockets", "Canvas API", "CRDTs (Yjs)", "WebRTC"],
    metrics: "Handles 100+ concurrent peers with zero merge conflicts at 60 FPS",
    description:
      "Architected conflict-free replicated data types (CRDTs) to sync complex vector geometries across distributed browser clients in real time.",
    link: "https://github.com",
  },
];

const SKILLS = [
  { category: "Frontend & Architecture", items: ["React 19", "TypeScript", "Next.js", "State Machines", "Canvas / WebGL", "Tailwind CSS / SCSS"] },
  { category: "Backend & Systems", items: ["Node.js", "Go", "Python", "REST & GraphQL", "gRPC / WebSockets", "PostgreSQL / Redis"] },
  { category: "Engineering Rigor & DevOps", items: ["Vitest / Jest", "Playwright E2E", "GitHub Actions CI/CD", "Docker", "Performance Profiling", "Linux / POSIX"] },
];

const Portfolio = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("manas.singh.dev@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="portfolio-shell">
      {/* Top Header Hero */}
      <div className="portfolio-hero">
        <div className="hero-avatar-wrap">
          <img src="/assets/icons/user.jpeg" alt="Manas Singh" className="hero-avatar" />
          <span className="status-badge" title="Open to Work">
            Available for Hire
          </span>
        </div>
        <div className="hero-info">
          <h2>Manas Singh</h2>
          <p className="hero-title">Full-Stack & Systems Software Engineer</p>
          <p className="hero-bio">
            Specializing in complex web applications, systems architecture, state orchestration, and high-performance user experiences.
          </p>
          <div className="hero-cta">
            <button className="btn-cta primary" onClick={handleCopyEmail}>
              {copied ? "✓ Email Copied!" : "📫 Copy Email"}
            </button>
            <a
              href="https://github.com/manascodr"
              target="_blank"
              rel="noreferrer"
              className="btn-cta secondary"
            >
              GitHub ↗
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="btn-cta secondary"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="portfolio-nav">
        <button
          className={activeSection === "overview" ? "active" : ""}
          onClick={() => setActiveSection("overview")}
        >
          🚀 Featured Projects
        </button>
        <button
          className={activeSection === "skills" ? "active" : ""}
          onClick={() => setActiveSection("skills")}
        >
          ⚡ Skills & Systems
        </button>
        <button
          className={activeSection === "experience" ? "active" : ""}
          onClick={() => setActiveSection("experience")}
        >
          💼 Experience & Impact
        </button>
        <button
          className={activeSection === "hire" ? "active" : ""}
          onClick={() => setActiveSection("hire")}
        >
          🎯 Why Hire Me?
        </button>
      </div>

      {/* Main Content Area */}
      <div className="portfolio-content">
        {activeSection === "overview" && (
          <div className="portfolio-section">
            <div className="section-heading">
              <h3>Featured Engineering Works</h3>
              <p>Highlights demonstrating architectural depth, performance optimization, and clean code.</p>
            </div>

            <div className="projects-grid">
              {PROJECTS.map((proj, idx) => (
                <div key={idx} className="project-card">
                  <div className="project-top">
                    <h4>{proj.title}</h4>
                    <span className="project-tagline">{proj.tagline}</span>
                  </div>
                  <p className="project-desc">{proj.description}</p>
                  <div className="project-metric">
                    <strong>Key Metric:</strong> {proj.metrics}
                  </div>
                  <div className="project-tech-tags">
                    {proj.tech.map((t) => (
                      <span key={t} className="tech-badge">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "skills" && (
          <div className="portfolio-section">
            <div className="section-heading">
              <h3>Technical Competencies</h3>
              <p>Pragmatic toolset built around scalability, type safety, and clean abstractions.</p>
            </div>

            <div className="skills-matrix">
              {SKILLS.map((sk, idx) => (
                <div key={idx} className="skill-card">
                  <h4>{sk.category}</h4>
                  <div className="skill-badges">
                    {sk.items.map((item) => (
                      <span key={item} className="skill-item">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "experience" && (
          <div className="portfolio-section">
            <div className="section-heading">
              <h3>Engineering Track Record</h3>
              <p>Experience building scalable web products and driving system improvements.</p>
            </div>

            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>Senior Software Engineer</h4>
                    <span className="timeline-date">2023 - Present</span>
                  </div>
                  <p className="timeline-company">High-Growth Tech Startup</p>
                  <ul className="timeline-points">
                    <li>Architected core frontend simulation and data visualization engines, reducing initial load latency by 42%.</li>
                    <li>Designed modular state management architectures with zero prop drilling and strict test isolation.</li>
                    <li>Mentored junior engineers and established CI/CD automation and automated testing standards.</li>
                  </ul>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>Software Engineer</h4>
                    <span className="timeline-date">2021 - 2023</span>
                  </div>
                  <p className="timeline-company">SaaS Platform</p>
                  <ul className="timeline-points">
                    <li>Built real-time collaborative features using WebSockets and client-side caching.</li>
                    <li>Authored automated test suites with Vitest and Playwright, achieving 90%+ branch coverage.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "hire" && (
          <div className="portfolio-section">
            <div className="section-heading">
              <h3>What I Bring to Your Engineering Team</h3>
              <p>A commitment to craftsmanship, developer velocity, and business impact.</p>
            </div>

            <div className="value-cards-grid">
              <div className="value-card">
                <span className="value-icon">🏗️</span>
                <h4>Systems Mindset</h4>
                <p>I don't just write UI components; I design systems with clear contracts, clean abstractions, and graceful error recovery.</p>
              </div>
              <div className="value-card">
                <span className="value-icon">⚡</span>
                <h4>Performance Obsessed</h4>
                <p>From 60 FPS compositing to bundle optimization and sub-millisecond data pipelines, performance is a first-class citizen.</p>
              </div>
              <div className="value-card">
                <span className="value-icon">🧪</span>
                <h4>Engineering Hygiene</h4>
                <p>Every piece of core logic is tested, linted, documented, and automated through continuous integration pipelines.</p>
              </div>
              <div className="value-card">
                <span className="value-icon">🤝</span>
                <h4>High Agency & Autonomy</h4>
                <p>Comfortable turning ambiguous business requirements into robust, deployed production features with minimal friction.</p>
              </div>
            </div>

            <div className="contact-banner">
              <div>
                <h4>Interested in collaborating?</h4>
                <p>Let's discuss how I can contribute to your team's mission.</p>
              </div>
              <button className="btn-cta primary" onClick={handleCopyEmail}>
                {copied ? "✓ Copied Email!" : "Get In Touch"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
