export function HomeIntro() {
  return (
    <section
      aria-labelledby="home-intro-heading"
      className="mx-auto max-w-2xl space-y-2 text-center"
    >
      <h1
        id="home-intro-heading"
        className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
      >
        Buy directly from people
      </h1>
      <p className="text-base text-muted-foreground sm:text-lg">
        Buy from people in the community, for the community. No hidden charges.
      </p>
    </section>
  );
}
