import Image from "next/image";

export function Navbar() {
  return (
    <nav className="pointer-events-auto fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Phase"
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="font-title text-sm tracking-[0.15em] text-foreground uppercase">
            Phase Delegation Map
          </span>
        </div>
        <a
          href="https://phase-delegation.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-xs text-muted transition-colors hover:text-accent"
        >
          Phase Delegation
        </a>
      </div>
    </nav>
  );
}
