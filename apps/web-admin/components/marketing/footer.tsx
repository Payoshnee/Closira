import Link from "next/link";
import { Container } from "@/components/layout/container";
import { routes } from "@/lib/routes";

const footerLinks = [
  { href: routes.features, label: "Features" },
  { href: routes.howItWorks, label: "How it works" },
  { href: routes.privacy, label: "Privacy" },
  { href: routes.terms, label: "Terms" },
  { href: routes.contact, label: "Contact" }
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white/64">
      <Container className="flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-charcoal">Closira</p>
          <p className="mt-1 text-sm text-stone-600">A private wardrobe assistant for better outfit decisions.</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-stone-600 hover:text-charcoal">
              {link.label}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}

