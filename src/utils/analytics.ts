interface AnalyticsEvent {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
}

class Analytics {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  track(event: string, data: Record<string, unknown> = {}) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    // Guardar en localStorage
    const events = this.getEvents();
    events.push(analyticsEvent);
    
    // Mantener solo los últimos 100 eventos para no llenar localStorage
    const trimmedEvents = events.slice(-100);
    localStorage.setItem('easyparker-analytics', JSON.stringify(trimmedEvents));

    // Log en consola para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log('📊 Analytics:', event, data);
    }
  }

  getEvents(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem('easyparker-analytics') || '[]');
    } catch {
      return [];
    }
  }

  exportData(): string {
    return JSON.stringify(this.getEvents(), null, 2);
  }

  clear() {
    localStorage.removeItem('easyparker-analytics');
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export const analytics = new Analytics();
