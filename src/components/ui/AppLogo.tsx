interface AppLogoProps {
  className?: string;
  alt?: string;
}

export function AppLogo({ className = 'h-10 w-auto', alt = 'Easy Parker' }: AppLogoProps) {
  return (
    <img
      src="/logo/LOGO EASYPARK-01.png"
      alt={`${alt} logo`}
      className={`object-contain ${className}`}
      loading="lazy"
    />
  );
}
