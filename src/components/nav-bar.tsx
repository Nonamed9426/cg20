'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Logo } from './logo';

const items = [
  { href: '/', label: '추천' },
  { href: '/rankings', label: '게임 순위' },
  { href: '/active', label: '활성 게임' },
  { href: '/recommend', label: '추천 받기' },
  { href: '/insight', label: '인사이트' },
  { href: '/search', label: '검색' },
];

export function NavBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setKeyword(searchParams.get('q') ?? '');
  }, [searchParams]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#120821]/90 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* 데스크탑 네비 */}
        <nav className="hidden items-center gap-3 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-[11px] text-white/72 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* 검색창 */}
          <form
            onSubmit={onSubmit}
            className="hidden h-10 w-[160px] items-center gap-2 rounded-xl border border-white/10 bg-[#1a1033] px-3 text-sm text-white/70 focus-within:border-[#7c49ff] lg:flex"
          >
            <Search className="h-4 w-4 shrink-0 text-white/35" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent outline-none placeholder:text-white/30"
            />
          </form>

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5 text-white/70" /> : <Menu className="h-5 w-5 text-white/70" />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#120821]/95 xl:hidden">
          <nav className="container-shell flex flex-col py-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-sm text-white/70 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {/* 모바일 검색창 */}
            <form onSubmit={onSubmit} className="mt-3 flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#1a1033] px-3">
              <Search className="h-4 w-4 shrink-0 text-white/35" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-sm text-white/70 outline-none placeholder:text-white/30"
              />
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
