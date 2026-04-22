'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Logo } from './logo';

const items = [
  { href: '/', label: '추천' },
  { href: '/predict/stardew-valley', label: '할인 예측' },
  { href: '/games/413150', label: '게임 상세' },
  { href: '/rankings', label: '게임 순위' },
  { href: '/sales', label: '세일 일정' },
  { href: '/active', label: '활성 게임' },
  { href: '/recommend', label: '추천 받기' },
  { href: '/insight', label: '인사이트' },
  { href: '/search', label: '검색' }
];

export function NavBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    setKeyword(searchParams.get('q') ?? '');
  }, [searchParams]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#120821]/90 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/72 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={onSubmit}
          className="flex h-11 w-[250px] items-center gap-2 rounded-xl border border-white/10 bg-[#1a1033] px-3 text-sm text-white/70 focus-within:border-[#7c49ff]"
        >
          <Search className="h-4 w-4 text-white/35" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent outline-none placeholder:text-white/30"
          />
        </form>
      </div>
    </header>
  );
}
