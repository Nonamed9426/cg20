import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type RouterValue = {
  pathname: string;
  search: string;
  href: string;
  push: (href: string) => void;
  replace: (href: string) => void;
};

const RouterContext = createContext<RouterValue | null>(null);

function normalizeInternalHref(href: string) {
  if (!href) return '/';
  if (href.startsWith('#')) return href.slice(1);
  if (href.startsWith('/')) return href;
  return `/${href}`;
}

function parseHashLocation() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const normalized = normalizeInternalHref(raw);
  const url = new URL(normalized, window.location.origin);
  return {
    href: `${url.pathname}${url.search}`,
    pathname: url.pathname,
    search: url.search,
  };
}

function setHashHref(href: string, replace = false) {
  const normalized = normalizeInternalHref(href);
  const target = `#${normalized}`;
  const base = window.location.href.split('#')[0];
  if (replace) {
    window.history.replaceState(null, '', `${base}${target}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    return;
  }
  window.location.hash = normalized;
}

export function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href);
}

export function toDisplayHref(href: string) {
  if (isExternalHref(href)) return href;
  return `#${normalizeInternalHref(href)}`;
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState(() => parseHashLocation());

  useEffect(() => {
    if (!window.location.hash) {
      window.location.replace(`${window.location.href.split('#')[0]}#/`);
      return;
    }
    const onChange = () => setRoute(parseHashLocation());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const value = useMemo<RouterValue>(() => ({
    ...route,
    push: (href: string) => setHashHref(href, false),
    replace: (href: string) => setHashHref(href, true),
  }), [route]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouterContext() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('Router context not found');
  return ctx;
}

export function useSearchParamsValue() {
  const { search } = useRouterContext();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function matchPath(pattern: string, pathname: string) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);
  if (patternParts.length != pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const pp = patternParts[i];
    const pv = pathParts[i];
    if (pp.startsWith(':')) {
      params[pp.slice(1)] = decodeURIComponent(pv);
      continue;
    }
    if (pp !== pv) return null;
  }
  return params;
}
