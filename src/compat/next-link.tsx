import React from 'react';
import { isExternalHref, toDisplayHref, useRouterContext } from './router';

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export default function Link({ href, onClick, target, rel, ...props }: LinkProps) {
  const router = useRouterContext();
  const external = isExternalHref(href) || target === '_blank';

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || external) return;
    event.preventDefault();
    router.push(href);
  };

  return <a {...props} href={external ? href : toDisplayHref(href)} target={target} rel={rel} onClick={handleClick} />;
}
