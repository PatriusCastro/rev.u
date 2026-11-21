import { Nav } from '@/components/nav';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="pa">
      {children}
      <Nav />
    </div>
  );
}
