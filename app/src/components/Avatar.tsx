interface AvatarProps {
  src: string;
  size?: number;
  border?: string;
  className?: string;
}

export default function Avatar({ src, size = 40, border, className = '' }: AvatarProps) {
  return (
    <img
      src={src}
      alt="avatar"
      className={`rounded-full object-cover flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        border: border || 'none',
      }}
      loading="lazy"
    />
  );
}
