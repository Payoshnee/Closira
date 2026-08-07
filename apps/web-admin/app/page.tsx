import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { FeatureCard } from "@/components/marketing/feature-card";
import { SectionHeader } from "@/components/marketing/section-header";
import { VisualMockup } from "@/components/marketing/visual-mockup";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { benefits, featureHighlights, howItWorksSteps } from "@/lib/mock/marketing";
import { routes } from "@/lib/routes";

export default function Home() {
  return (
    <PublicShell>
      <main>
        <section className="py-16 sm:py-20 lg:py-24">
          <Container className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <Badge>Private fashion-tech assistant</Badge>
              <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-normal text-charcoal sm:text-6xl lg:text-7xl">
                Your wardrobe, styled smarter with AI.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
                Closira helps you organize your clothes, create outfits, avoid duplicate shopping, and get AI-powered styling suggestions from your own wardrobe.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={routes.signup}>
                  Start organizing your wardrobe
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href={routes.howItWorks} variant="secondary">
                  See how it works
                </ButtonLink>
              </div>
            </div>
            <VisualMockup />
          </Container>
        </section>

        <section className="border-y border-stone-200 bg-white/58 py-16">
          <Container className="grid gap-10 md:grid-cols-2">
            <SectionHeader
              eyebrow="The problem"
              title="Many wardrobes are full, but hard to use."
              description="People forget what they own, repeat purchases, underuse beautiful pieces, and lose time deciding what fits the day."
            />
            <SectionHeader
              eyebrow="The solution"
              title="Closira becomes your personal AI wardrobe assistant."
              description="It turns your closet into a searchable, plan-ready system for outfits, events, analytics, and thoughtful shopping."
            />
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <SectionHeader
              eyebrow="Features"
              title="Built for the way people actually get dressed."
              description="Closira keeps the wardrobe practical first, then layers in AI where it can make decisions easier."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureHighlights.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-charcoal py-16 text-white sm:py-20">
          <Container>
            <SectionHeader
              eyebrow="How it works"
              title="From closet clutter to outfit clarity."
              description="A simple workflow helps you capture, organize, style, plan, and shop with more confidence."
              inverted
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {howItWorksSteps.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-white/12 bg-white/8 p-5">
                  <span className="text-sm font-semibold text-champagne">0{index + 1}</span>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-300">{step.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionHeader
              eyebrow="Benefits"
              title="Spend less energy on the closet and more on the life around it."
              description="Closira is designed to make daily dressing calmer, event planning easier, and shopping more intentional."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white/78 p-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
                  <span className="text-sm font-semibold text-charcoal">{benefit}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="pb-16 sm:pb-20">
          <Container>
            <div className="rounded-lg bg-gradient-to-br from-rose-100 via-ivory-100 to-lavender/40 p-8 sm:p-10">
              <h2 className="max-w-2xl text-3xl font-bold text-charcoal sm:text-4xl">Start with the clothes you already own.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">Closira is built around your wardrobe first, so AI suggestions stay personal, useful, and grounded.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={routes.signup}>Start organizing your wardrobe</ButtonLink>
                <ButtonLink href={routes.features} variant="secondary">Explore features</ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </PublicShell>
  );
}
