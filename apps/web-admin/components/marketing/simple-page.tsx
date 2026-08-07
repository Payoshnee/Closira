import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { SectionHeader } from "@/components/marketing/section-header";

export function SimplePage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return (
    <PublicShell>
      <main className="py-16 sm:py-20">
        <Container>
          <SectionHeader eyebrow={eyebrow} title={title} description={description} />
          <div className="mt-10">{children}</div>
        </Container>
      </main>
    </PublicShell>
  );
}

