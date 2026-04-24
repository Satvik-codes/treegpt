import { createFileRoute } from '@tanstack/react-router';
import TreeGPTHome from '@/components/TreeGPTHome';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'TreeGPT — Think in Branches, Not Lines' },
      {
        name: 'description',
        content: 'A branching AI conversation interface. Explore multiple solution paths simultaneously.',
      },
      { property: 'og:title', content: 'TreeGPT — Think in Branches, Not Lines' },
      { property: 'og:description', content: 'A branching AI conversation interface.' },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return <TreeGPTHome />;
}

