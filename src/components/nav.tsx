'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, Layers, NotebookTabs, Folder, PenLine } from 'lucide-react';
import { SignOut } from './sign-out';
import { Logo, ic } from './ui';

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
      <Link className="brand" href="/" aria-label="Rev.U, Today"><Logo size={32} /></Link>
      {ITEMS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined}><Icon {...ic} />{label}</Link>
      ))}
      <div className="out"><SignOut variant="row" /></div>
    </nav>
  );
}
