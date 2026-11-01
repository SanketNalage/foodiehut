import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WsOrderEvent {
  eventType: 'ORDER_CREATED' | 'ORDER_STATUS_UPDATED';
  orderNumber: string;
  status: string;
  order: any;
}

export const useWebSocket = (topic: string | null, onMessage: (event: WsOrderEvent) => void) => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!topic) return;

    const socketUrl = `${window.location.protocol === 'https:' ? 'https:' : 'http:'}//${window.location.host}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe(topic, (message) => {
          try {
            const event: WsOrderEvent = JSON.parse(message.body);
            onMessage(event);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [topic, onMessage]);
};
