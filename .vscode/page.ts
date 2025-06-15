import { ArtisticAlchemistForm } from '@/components/artistic-alchemist-form';

export default function HomePage() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 py-8">
      <ArtisticAlchemistForm />
    </main>
  );
}
