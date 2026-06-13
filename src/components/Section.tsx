import { cn } from '@/lib/utils';

export type SectionVariant = 'white' | 'warm' | 'warm-pattern' | 'pattern' | 'subtle';

interface SectionProps {
  id?: string;
  variant?: SectionVariant;
  className?: string;
  children: React.ReactNode;
}

export function Section({
  id,
  variant = 'white',
  className,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn('relative overflow-hidden', className)}>
      {variant === 'pattern' && (
        <>
          <div className="absolute inset-0 tof-pattern" aria-hidden />
          <div className="tof-pattern-overlay absolute inset-0" aria-hidden />
        </>
      )}
      {variant === 'subtle' && (
        <>
          <div className="absolute inset-0 tof-pattern" aria-hidden />
          <div className="tof-pattern-subtle-overlay absolute inset-0" aria-hidden />
        </>
      )}
      {variant === 'warm' && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#FFFBEB] via-[#FFF7ED] to-[#FFF7ED]"
          aria-hidden
        />
      )}
      {variant === 'warm-pattern' && (
        <>
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#FFFBEB] via-[#FFF7ED] to-[#FFF7ED]"
            aria-hidden
          />
          <div className="absolute inset-0 tof-pattern opacity-[0.07]" aria-hidden />
        </>
      )}
      <div className="container relative z-10">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  badge?: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mx-auto mb-12 max-w-2xl text-center', className)}>
      {badge && (
        <span className="section-badge mb-3 inline-block">{badge}</span>
      )}
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-desc mt-4">{description}</p>}
    </div>
  );
}
