export function BankSlipImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-md border border-border bg-muted/30">
      {/* eslint-disable-next-line @next/next/no-img-element -- authenticated proxy URL */}
      <img
        src={src}
        alt={alt}
        className="max-h-96 w-full object-contain"
        loading="lazy"
      />
    </div>
  );
}
