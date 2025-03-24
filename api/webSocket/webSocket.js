import { WebSocketServer } from 'ws';
import Event from '../models/event.model.js';

const wss = new WebSocketServer({ noServer: true });

const notifiedEvents = new Map();

wss.on('connection', (ws, request) => {
  const params = new URLSearchParams(request.url.split('?')[1]);
  const username = params.get('username') || 'Unknown User';
  
  console.log(`${username} connected to WebSocket`);

  ws.on('close', () => {
    console.log(`${username} disconnected`);
  });
});

const checkForUpcomingEvents = async () => {
  const currentTime = new Date();
  const fiveMinutesLater = new Date(currentTime.getTime() + 5 * 60000); 
  const upcomingEvents = await Event.find({
    start: { $gte: currentTime, $lte: fiveMinutesLater },
    isEnded: false
  });

  upcomingEvents.forEach(event => {
    const eventId = event._id.toString();
    const timeToStart = Math.floor((new Date(event.start) - currentTime) / 60000); 

    if (timeToStart >= 0 && timeToStart <= 5) {
      const message = timeToStart > 0 
        ? `Reminder: Event "${event.title}" is starting in ${timeToStart} minute${timeToStart > 1 ? 's' : ''}!`
        : `Event "${event.title}" has started!`;

      const type = timeToStart > 0 ? 'event_upcoming' : 'event_start';

      const lastNotifiedMinutes = notifiedEvents.get(eventId);
      if (lastNotifiedMinutes !== timeToStart) {
        console.log(message);
        notifiedEvents.set(eventId, timeToStart);

        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type,
              message,
              event: event.toObject()
            }));
          }
        });
      }
    }
  });
};

setInterval(checkForUpcomingEvents, 10000); 

export { wss };