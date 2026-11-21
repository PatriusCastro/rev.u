'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, Layers, NotebookTabs, Folder, PenLine } from 'lucide-react';
import { ic } from './ui';

const ITEMS = [
  { href: '/', label: 'Today', Icon: CalendarCheck },
  { href: '/subjects', label: 'Subjects', Icon: Layers },
  { href: '/notebook', label: 'Notebook', Icon: NotebookTabs },
  { href: '/library', label: 'Library', Icon: Folder },
  { href: '/write', label: 'Write', Icon: PenLine },
];

export function Nav() {
  const path = usePathname();
  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  // On a phone the bar hides while a problem is open, so the problem and scratch pad get the full height.
  return (
    <nav className={'nav' + (path.startsWith('/attempt') ? ' solving' : '')} aria-label="Main">
      <span className="brand">Rev.U</span>
      {ITEMS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined}><Icon {...ic} />{label}</Link>
      ))}
    </nav>
  );
}
