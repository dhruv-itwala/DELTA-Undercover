import React from 'react';
import { 
  X, Globe, MessageCircle, ExternalLink, Terminal, Code2
} from 'lucide-react';
import styles from './DeveloperModal.module.css';

// SVG icons for brand links to ensure 100% clean compatibility
function GithubIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function WhatsappIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" />
    </svg>
  );
}

const DEVELOPER_LINKS = [
  {
    name: 'Portfolio',
    url: 'https://dhruv-itwala-portfolio.onrender.com/',
    icon: Globe,
    color: '#06b6d4',
    handle: 'dhruv-itwala-portfolio'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/Dhruv-Itwala',
    icon: GithubIcon,
    color: '#f8fafc',
    handle: 'github.com/Dhruv-Itwala'
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/dhruv-itwala/',
    icon: LinkedinIcon,
    color: '#3b82f6',
    handle: 'linkedin.com/in/dhruv-itwala'
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/itwala_dhruv',
    icon: InstagramIcon,
    color: '#ec4899',
    handle: '@itwala_dhruv'
  },
  {
    name: 'WhatsApp',
    url: 'https://api.whatsapp.com/send/?phone=9104438800&text&type=phone_number&app_absent=0',
    icon: WhatsappIcon,
    color: '#10b981',
    handle: 'Connect on WhatsApp'
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@dhruvitwala?si=81XhgXpErB6sjjx5',
    icon: YoutubeIcon,
    color: '#f43f5e',
    handle: 'youtube.com/@dhruvitwala'
  }
];

export default function DeveloperModal({ onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.badgeIcon}>
              <Terminal size={16} />
            </div>
            <div>
              <h2>Developer Profile</h2>
              <span className={styles.subtext}>DELTA Protocol Lead Architect</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Developer Bio Card */}
        <div className={styles.bioCard}>
          <div className={styles.avatarGlow}>
            <span className={styles.avatarLetter}>D</span>
          </div>
          <div className={styles.bioMeta}>
            <span className={styles.designerLabel}>Designed & Developed by</span>
            <h3 className={styles.devName}>DHRUV ITWALA</h3>
            <span className={styles.devRole}>Full-Stack Engineer & Game Architect</span>
          </div>
        </div>

        {/* Links Grid */}
        <div className={styles.linksList}>
          {DEVELOPER_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkItem}
              >
                <div 
                  className={styles.linkIconWrap}
                  style={{ color: link.color }}
                >
                  <Icon size={18} />
                </div>
                <div className={styles.linkDetails}>
                  <span className={styles.linkName}>{link.name}</span>
                  <span className={styles.linkHandle}>{link.handle}</span>
                </div>
                <ExternalLink size={14} className={styles.externalIcon} />
              </a>
            );
          })}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.doneBtn} onClick={onClose}>
            Back to DELTA: Undercover
          </button>
        </div>
      </div>
    </div>
  );
}
