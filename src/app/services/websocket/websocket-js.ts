import { Injectable } from '@angular/core';
import { LoggerService } from 'src/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'src/chat21-core/providers/logger/loggerInstance';

interface Subscription {
  topic: string;
  label?: string;
  onCreate?: (msg: any, notification: any) => void;
  onUpdate?: (msg: any, notification: any) => void;
  onData?: (msg: any, notification: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketJs {
  private worker: Worker;
  private subscriptions: Map<string, Subscription> = new Map();

  private logger: LoggerService = LoggerInstance.getInstance();

  constructor() {
    this.worker = new Worker(new URL('./websocket.worker', import.meta.url));
    
    // ➤ AGGIUNTA: notifica al worker quando la tab va in background
    document.addEventListener("visibilitychange", () => {
      this.worker.postMessage({
        action: "visibility",
        data: { hidden: document.hidden }
      });
    });

    // ricezione dei messaggi dal worker
    this.worker.onmessage = (event) => {
      const msg = event.data;
      this.logger.log('[WEBSOCKET-JS] Message received from worker:', msg);
      // msg deve avere almeno .topic e .type (create/update/data)
      const sub = this.subscriptions.get(msg.topic);
      if (!sub) return;

      let object = { event: msg.payload, data: msg.data };
      switch (msg.method) {
        case 'CREATE': sub.onCreate?.(msg.payload, object); break;
        case 'UPDATE': sub.onUpdate?.(msg.payload, object); break;
        case 'DATA':   sub.onData?.(msg.payload, object);   break;
      }
    };
  }

  init(url: string) {
    this.worker.postMessage({ action: 'init', data: { url } });
    this.worker.postMessage({ action: 'visibility', data: { hidden: document.hidden } });
  }

  ref(topic: string, calledby?: string, onCreate?: (msg:any, notification: any)=>void, onUpdate?: (msg:any, notification: any)=>void, onData?: (msg:any, notification: any)=>void) {
    this.logger.log('[WEBSOCKET-JS] - REF - calledby ', calledby);
    this.logger.log('[WEBSOCKET-JS] - REF - TOPIC ', topic);

    const sub: Subscription = { topic, onCreate, onUpdate, onData };
    this.subscriptions.set(topic, sub);
    this.logger.log('[WEBSOCKET-JS] - CALLBACK-SET - subscriptions', this.subscriptions);
    this.subscribe(topic);
    return sub;
  }

  subscribe(topic: string){
    this.logger.log('[WEBSOCKET-JS] - SUBSCRIBE TO TOPIC ', topic);
    this.worker.postMessage({ action: 'subscribe', data: { topic } });
  }

  unsubscribe(topic: string) {
    this.logger.log("[WEBSOCKET-JS] - UN-SUBSCRIBE  - FROM TOPIC: ", topic);
    this.subscriptions.delete(topic);
    this.worker.postMessage({ action: 'unsubscribe', data: { topic } });
  }

  send(message: any) {
    this.worker.postMessage({ action: 'send', data: { message } });
  }

  close() {
    this.worker.postMessage({ action: 'close' });
    this.subscriptions.clear();
  }
}