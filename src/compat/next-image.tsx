import React from 'react';

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

export default function Image({ fill, style, className, alt = '', ...props }: ImageProps) {
  if (fill) {
    return (
      <img
        {...props}
        alt={alt}
        className={className}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}
      />
    );
  }
  return <img {...props} alt={alt} className={className} style={style} />;
}
