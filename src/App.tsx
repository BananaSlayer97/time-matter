import { useState, useCallback, useRef, useMemo, memo } from 'react';
import { useEvents } from './hooks/useEvents';
import { useDataTransfer } from './hooks/useDataTransfer';
import { useNotifications } from './hooks/useNotifications';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ParticleBackground } from './components/ParticleBackground';
import { EventCard } from './components/EventCard';
import { EventForm } from './components/EventForm';
import { EventDetail } from './components/EventDetail';
import { EmptyState } from './components/EmptyState';
import { SettingsMenu } from './components/SettingsMenu';
import { ToastContainer } from './components/ToastContainer';
import { SearchToolbar } from './components/SearchToolbar';
import { StatsBar } from './components/StatsBar';
import { Onboarding } from './components/Onboarding';
import type { TimeEvent } from './types';
import './App.css';

type ViewMode = 'grid' | 'list';

// Memoize EventCard to avoid re-renders
const MemoizedEventCard = memo(EventCard);

function App() {
  const { events, addEvent, updateEvent, deleteEvent, replaceAllEvents } = useEvents();
  const { toasts, removeToast, showSuccess, showError, showUndo } = useToast();
  const toastCallbacks = useMemo(() => ({ showSuccess, showError }), [showSuccess, showError]);
  const { exportData, importData } = useDataTransfer(events, replaceAllEvents, toastCallbacks);
  const { requestPermission, permissionStatus } = useNotifications(events);
  const { theme, toggleTheme } = useTheme();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimeEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailEvent, setDetailEvent] = useState<TimeEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filteredEvents, setFilteredEvents] = useState<TimeEvent[]>([]);
  const deletedRef = useRef<TimeEvent | null>(null);

  const handleAdd = useCallback(() => {
    setEditingEvent(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((event: TimeEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    // Store deleted event for undo
    const toDelete = events.find(e => e.id === id);
    if (!toDelete) return;

    deletedRef.current = toDelete;
    setDeletingId(id);

    setTimeout(() => {
      deleteEvent(id);
      setDeletingId(null);

      showUndo(`已删除「${toDelete.name}」`, () => {
        if (deletedRef.current) {
          addEvent({
            name: deletedRef.current.name,
            targetDate: deletedRef.current.targetDate,
            category: deletedRef.current.category,
            color: deletedRef.current.color,
            recurring: deletedRef.current.recurring,
            note: deletedRef.current.note,
          });
          deletedRef.current = null;
        }
      });
    }, 300);
  }, [events, deleteEvent, showUndo, addEvent]);

  const handleClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingEvent(null);
  }, []);

  const handleCardClick = useCallback((event: TimeEvent) => {
    setDetailEvent(event);
  }, []);

  const handleFilteredEvents = useCallback((filtered: TimeEvent[]) => {
    setFilteredEvents(filtered);
  }, []);

  const handleSearch = useCallback(() => {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    searchInput?.focus();
  }, []);

  const handleEscape = useCallback(() => {
    if (detailEvent) {
      setDetailEvent(null);
    } else if (isFormOpen) {
      handleClose();
    }
  }, [detailEvent, isFormOpen, handleClose]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNew: handleAdd,
    onSearch: handleSearch,
    onEscape: handleEscape,
  });

  // Separate future/past from filtered events
  const now = Date.now();
  const displayEvents = events.length > 0 ? filteredEvents : [];
  const futureEvents = displayEvents.filter(e => new Date(e.targetDate).getTime() > now);
  const pastEvents = displayEvents.filter(e => new Date(e.targetDate).getTime() <= now);

  const settingsProps = {
    onExport: exportData,
    onImport: importData,
    onRequestNotifications: requestPermission,
    notificationPermission: permissionStatus,
    theme,
    onToggleTheme: toggleTheme,
  };

  return (
    <ErrorBoundary>
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
            <div className="app-header__right">
              {events.length > 0 && (
                <button className="app-header__add-btn" onClick={handleAdd}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>新建</span>
                </button>
              )}
              <SettingsMenu {...settingsProps} />
            </div>
          </div>

          {/* Keyboard hints on desktop */}
          {events.length > 0 && (
            <div className="app-header__hints">
              <kbd>N</kbd> 新建 · <kbd>/</kbd> 搜索 · <kbd>Esc</kbd> 关闭
            </div>
          )}
        </header>

        <main className="app-main">
          {events.length === 0 ? (
            <EmptyState onAdd={handleAdd} />
          ) : (
            <div className="events-container">
              <StatsBar events={events} />
              <SearchToolbar
                events={events}
                onFilteredEvents={handleFilteredEvents}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              {displayEvents.length === 0 ? null : (
                <>
                  {futureEvents.length > 0 && (
                    <section className="events-section">
                      <h2 className="events-section__title">
                        <span className="events-section__dot events-section__dot--future" />
                        即将到来
                        <span className="events-section__count">{futureEvents.length}</span>
                      </h2>
                      <div className={viewMode === 'grid' ? 'events-grid' : 'events-list'}>
                        {futureEvents.map((event, index) => (
                          <div
                            key={event.id}
                            className={`event-card-wrapper ${deletingId === event.id ? 'deleting' : ''}`}
                          >
                            <MemoizedEventCard
                              event={event}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onClick={handleCardClick}
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
                      <div className={viewMode === 'grid' ? 'events-grid' : 'events-list'}>
                        {pastEvents.map((event, index) => (
                          <div
                            key={event.id}
                            className={`event-card-wrapper ${deletingId === event.id ? 'deleting' : ''}`}
                          >
                            <MemoizedEventCard
                              event={event}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onClick={handleCardClick}
                              index={index}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
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

        {detailEvent && (
          <EventDetail
            event={detailEvent}
            onClose={() => setDetailEvent(null)}
            onEdit={handleEdit}
          />
        )}

        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <Onboarding onComplete={() => { }} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
