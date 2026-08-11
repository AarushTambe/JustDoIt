import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial AeDoit workspace data...');

  const initialTasks = [
    {
      title: 'Setup Production Deployment Pipeline',
      description: 'Configure Vercel build settings, environment variables, and GitHub Actions CI.',
      groupName: 'Aethron',
      subgroupName: 'DevOps',
      assignedUser: 'User A',
      status: 'IN_PROGRESS',
      isStarred: true,
      tags: JSON.stringify(['deployment', 'ci-cd', 'pwa']),
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
    },
    {
      title: 'Verify Concurrent Last-Write-Wins Sync',
      description: 'Perform dual-browser concurrency checks for simultaneous task edits and status toggles.',
      groupName: 'Aethron',
      subgroupName: 'QA',
      assignedUser: 'User B',
      status: 'TODO',
      isStarred: true,
      tags: JSON.stringify(['testing', 'concurrency', 'sse']),
      dueDate: new Date(Date.now() + 86400000 * 3),
    },
    {
      title: 'Review Mobile Viewport & PWA Offline Manifest',
      description: 'Audit touch targets, responsive drawer layout, service worker caching, and theme toggling.',
      groupName: 'Aethron',
      subgroupName: 'UX',
      assignedUser: 'User A',
      status: 'TODO',
      isStarred: false,
      tags: JSON.stringify(['mobile', 'pwa', 'design']),
      dueDate: new Date(Date.now() + 86400000 * 5),
    },
  ];

  for (const task of initialTasks) {
    await prisma.task.create({ data: task });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
