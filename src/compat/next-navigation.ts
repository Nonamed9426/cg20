import { useRouterContext, useSearchParamsValue } from './router';

export function useRouter() {
  const router = useRouterContext();
  return {
    push: router.push,
    replace: router.replace,
    back: () => window.history.back(),
  };
}

export function useSearchParams() {
  return useSearchParamsValue();
}
