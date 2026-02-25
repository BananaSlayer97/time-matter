import { useState } from 'react';
import { useEvents } from './hooks/useEvents';
import { ParticleBackground } from './components/ParticleBackground';
import { EventCard } from './components/EventCard';
import { EventForm } from './components/EventForm';
import { EmptyState } from './components/EmptyState';
import type { TimeEvent } from './types';
import './App.css';

function App() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimeEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event: TimeEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    // Animate out before deleting
    setTimeout(() => {
      deleteEvent(id);
      setDeletingId(null);
    }, 300);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const futureEvents = events.filter(e => new Date(e.targetDate).getTime() > Date.now());
  const pastEvents = events.filter(e => new Date(e.targetDate).getTime() <= Date.now());

  return (
    <div className="app">
      <ParticleBackground />

      <header className="app-header">
        <div className="app-header__content">
          <div className="app-header__brand">
            <div className="app-header__logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h1 className="app-header__title">Time Matter</h1>
              <p className="app-header__subtitle">每一刻，都值得铭记</p>
            </div>
          </div>
          {events.length > 0 && (
            <button className="app-header__add-btn" onClick={handleAdd}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>新建</span>
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {events.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          <div className="events-container">
            {futureEvents.length > 0 && (
              <section className="events-section">
                <h2 className="events-section__title">
                  <span className="events-section__dot events-section__dot--future" />
                  即将到来
                  <span className="events-section__count">{futureEvents.length}</span>
                </h2>
                <div className="events-grid">
                  {futureEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className={`event-card-wrapper ${deletingId === event.id ? 'deleting' : ''}`}
                    >
                      <EventCard
                        event={event}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {pastEvents.length > 0 && (
              <section className="events-section">
                <h2 className="events-section__title">
                  <span className="events-section__dot events-section__dot--past" />
                  已经过去
                  <span className="events-section__count">{pastEvents.length}</span>
                </h2>
                <div className="events-grid">
                  {pastEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className={`event-card-wrapper ${deletingId === event.id ? 'deleting' : ''}`}
                    >
                      <EventCard
                        event={event}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* FAB for mobile */}
      {events.length > 0 && (
        <button className="fab" onClick={handleAdd} aria-label="添加事件">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      <EventForm
        isOpen={isFormOpen}
        onClose={handleClose}
        onSave={addEvent}
        onUpdate={updateEvent}
        editingEvent={editingEvent}
      />
    </div>
  );
}

export default App;
