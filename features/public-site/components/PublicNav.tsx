"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { usePatientSession } from "@/features/patient-account/hooks/usePatientAuth";
import { Button } from "@/shared/components/ui/button";

export function PublicNav({
  slug,
  doctorName,
  showGallery,
  showBooking,
}: {
  slug: string;
  doctorName: string;
  showGallery: boolean;
  showBooking: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data: session } = usePatientSession(slug);
  const base = `/dr/${slug}`;

  const links = [
    { href: base, label: "Home" },
    { href: `${base}/about`, label: "About" },
    { href: `${base}/services`, label: "Services" },
    { href: `${base}/clinics`, label: "Clinics" },
    ...(showGallery
      ? [{ href: `${base}/gallery`, label: "Success Stories" }]
      : []),
    { href: `${base}/contact`, label: "Contact" },
  ];

  return (
    <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href={base} className="font-semibold" onClick={() => setOpen(false)}>
          {doctorName}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <Link
              href={`${base}/account`}
              className="text-foreground flex items-center gap-1.5 text-sm font-medium"
            >
              <UserRound className="size-4" />
              My Account
            </Link>
          ) : (
            <Link
              href={`${base}/login`}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Log in
            </Link>
          )}
          {showBooking && (
            <Button size="sm" render={<Link href={`${base}/book`} />}>
              Book Appointment
            </Button>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="block h-0.5 w-6 bg-current" />
          <span className="mt-1.5 block h-0.5 w-6 bg-current" />
          <span className="mt-1.5 block h-0.5 w-6 bg-current" />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t px-6 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground py-1.5 text-sm"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={session ? `${base}/account` : `${base}/login`}
            className="text-foreground py-1.5 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            {session ? "My Account" : "Log in"}
          </Link>
          {showBooking && (
            <Button
              size="sm"
              className="mt-2 self-start"
              render={<Link href={`${base}/book`} />}
              onClick={() => setOpen(false)}
            >
              Book Appointment
            </Button>
          )}
        </nav>
      )}
    </header>
  );
}
