import { taskEmitter, TaskChangeEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    start(controller) {
      // Send initial connection ACK
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'ok' })}\n\n`)
      );

      const listener = (event: TaskChangeEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`event: taskChange\ndata: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Stream closed or error
        }
      };

      taskEmitter.on('taskChange', listener);

      // Keep-alive heartbeat interval every 15 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        taskEmitter.off('taskChange', listener);
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(customStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
