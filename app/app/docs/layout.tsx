import type { Metadata } from 'next';
import './docs.css';

export const metadata: Metadata = {
  title: 'Advance Documentation',
  description:
    'Build with Advance: verified cross-chain credit scores, scoped grants, expiring sessions, revocation, and replay protection.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
