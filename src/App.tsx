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
import { CategoryManager } from './components/CategoryManager';
import { TimeProgress } from './components/TimeProgress';
import { TemplateGallery } from './components/TemplateGallery';
import { CompactRow } from './components/CompactRow';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import { useCloudSync } from './hooks/useSupabaseSync';
import { exportToICal } from './utils/ical';
import type { TimeEvent } from './types';
import './App.css';

type ViewMode = 'grid' | 'list' | 'compact';

// Memoize EventCard to avoid re-renders
const MemoizedEventCard = memo(EventCard);

function App() {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    replaceAllEvents,
    togglePin,
    toggleArchive,
    duplicateEvent,
    customCategories,
    addCustomCategory,
    removeCustomCategory
  } = useEvents();

  const { toasts, removeToast, showSuccess, showError, showUndo } = useToast();
  const toastCallbacks = useMemo(() => ({ showSuccess, showError }), [showSuccess, showError]);
  const { exportData, importData } = useDataTransfer(events, replaceAllEvents, toastCallbacks);
  const { requestPermission, permissionStatus } = useNotifications(events);
  const { theme, setTheme: setAppTheme } = useTheme();
  const { user, signInWithEmail, signUpWithEmail, signInWithGithub, signOut } = useAuth();
  const { syncing, lastSync, pushToCloud, pullFromCloud } = useCloudSync(user, events, replaceAllEvents);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimeEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailEvent, setDetailEvent] = useState<TimeEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filteredEvents, setFilteredEvents] = useState<TimeEvent[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
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
            reminderMinutes: deletedRef.current.reminderMinutes,
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

  const handlePin = useCallback((id: string) => {
    togglePin(id);
    const ev = events.find(e => e.id === id);
    if (ev) showSuccess(ev.pinned ? '取消置顶' : '已置顶');
  }, [togglePin, events, showSuccess]);

  const handleArchive = useCallback((id: string) => {
    toggleArchive(id);
    const ev = events.find(e => e.id === id);
    if (ev) showSuccess(ev.archived ? '已恢复' : '已归档');
  }, [toggleArchive, events, showSuccess]);

  const handleDuplicate = useCallback((id: string) => {
    duplicateEvent(id);
    showSuccess('已复制事件');
  }, [duplicateEvent, showSuccess]);

  const handleExportICal = useCallback((event: TimeEvent) => {
    exportToICal(event);
    showSuccess('正在导出日历文件...');
  }, [showSuccess]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNew: handleAdd,
    onSearch: handleSearch,
    onEscape: handleEscape,
  });

  // Display Logic: filter archived if not in archive view
  const now = Date.now();
  const allDisplayEvents = events.length > 0 ? filteredEvents : [];

  // Rule: In main view, hide archived. In archive view, show only archived.
  const displayEvents = allDisplayEvents.filter(e => !!e.archived === showArchived);

  const pinnedEvents = displayEvents.filter(e => e.pinned);
  const unpinnedDisplay = displayEvents.filter(e => !e.pinned);
  const futureEvents = unpinnedDisplay.filter(e => new Date(e.targetDate).getTime() > now);
  const pastEvents = unpinnedDisplay.filter(e => new Date(e.targetDate).getTime() <= now);

  const settingsProps = {
    onExport: exportData,
    onImport: importData,
    onRequestNotifications: requestPermission,
    notificationPermission: permissionStatus,
    theme,
    onSetTheme: setAppTheme,
    onManageCategories: () => setIsCatManagerOpen(true),
    user,
    onOpenAuth: () => setIsAuthOpen(true),
    onSignOut: signOut,
    syncing,
    lastSync,
    onPush: async () => {
      const ok = await pushToCloud();
      if (ok) showSuccess('已上传到云端 ☁️');
      else showError('上传失败');
    },
    onPull: async () => {
      const ok = await pullFromCloud();
      if (ok) showSuccess('已从云端下载 📥');
      else showError('下载失败');
    },
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
                <p className="app-header__subtitle">
                  {showArchived ? '已归档的记忆' : '每一刻，都值得铭记'}
                </p>
              </div>
            </div>
            <div className="app-header__right">
              {events.length > 0 && (
                <>
                  <button
                    className={`app-header__btn ${showArchived ? 'active' : ''}`}
                    onClick={() => setShowArchived(!showArchived)}
                    title={showArchived ? '查看进行中' : '查看归档'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8" />
                      <rect x="1" y="3" width="22" height="5" />
                      <line x1="10" y1="12" x2="14" y2="12" />
                    </svg>
                  </button>
                  {!showArchived && (
                    <>
                      <button className="app-header__btn" onClick={() => setIsTemplatesOpen(true)} title="从模板添加">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                      </button>
                      <button className="app-header__add-btn" onClick={handleAdd}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>新建</span>
                      </button>
                    </>
                  )}
                </>
              )}
              <SettingsMenu {...settingsProps} />
            </div>
          </div>

          {events.length > 0 && !showArchived && (
            <div className="app-header__hints">
              <kbd>N</kbd> 新建 · <kbd>/</kbd> 搜索 · <kbd>Esc</kbd> 关闭
            </div>
          )}
        </header>

        <main className="app-main">
          {events.length === 0 ? (
            <>
              <TimeProgress />
              <EmptyState onAdd={handleAdd} onOpenTemplates={() => setIsTemplatesOpen(true)} />
            </>
          ) : (
            <div className="events-container">
              {!showArchived && (
                <>
                  <StatsBar events={events.filter(e => !e.archived)} />
                  <TimeProgress />
                </>
              )}

              <div className="search-toolbar-row">
                <SearchToolbar
                  events={events}
                  onFilteredEvents={handleFilteredEvents}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>

              {displayEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                  <p>{showArchived ? '没有归档的事件' : '没有找到匹配的事件'}</p>
                </div>
              ) : (
                <>
                  {pinnedEvents.length > 0 && (
                    <section className="events-section">
                      <h2 className="events-section__title">
                        <span className="events-section__dot events-section__dot--pinned" />
                        置顶事件
                        <span className="events-section__count">{pinnedEvents.length}</span>
                      </h2>
                      <div className={viewMode === 'grid' ? 'events-grid' : viewMode === 'list' ? 'events-list' : 'events-compact'}>
                        {viewMode === 'compact' ? pinnedEvents.map(event => (
                          <CompactRow key={event.id} event={event} onClick={handleCardClick} />
                        )) : pinnedEvents.map((event, index) => (
                          <div key={event.id} className={`event-card-wrapper ${deletingId === event.id ? 'deleting' : ''}`}>
                            <MemoizedEventCard
                              event={event}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onPin={handlePin}
                              onArchive={handleArchive}
                              onDuplicate={handleDuplicate}
                              onExportCal={handleExportICal}
                              onClick={handleCardClick}
                              index={index}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {futureEvents.length > 0 && (
                    <section className="events-section">
                      <h2 className="events-section__title">
                        <span className="events-section__dot events-section__dot--future" />
                        即将到来
                        <span className="events-section__count">{futureEvents.length}</span>
                      </h2>
                      <div className={viewMode === 'grid' ? 'events-grid' : viewMode === 'list' ? 'events-list' : 'events-compact'}>
                        {viewMode === 'compact' ? futureEvents.map(event => (
                          <CompactRow key={event.id} event={event} onClick={handleCardClick} />
                        )) : futureEvents.map((event, index) => (
                          <div key={event.id} className={`event-card-wrapper ${deletingId === event.id ? 'deleting' : ''}`}>
                            <MemoizedEventCard
                              event={event}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onPin={handlePin}
                              onArchive={handleArchive}
                              onDuplicate={handleDuplicate}
                              onExportCal={handleExportICal}
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
                      <div className={viewMode === 'grid' ? 'events-grid' : viewMode === 'list' ? 'events-list' : 'events-compact'}>
                        {viewMode === 'compact' ? pastEvents.map(event => (
                          <CompactRow key={event.id} event={event} onClick={handleCardClick} />
                        )) : pastEvents.map((event, index) => (
                          <div key={event.id} className={`event-card-wrapper ${deletingId === event.id ? 'deleting' : ''}`}>
                            <MemoizedEventCard
                              event={event}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onPin={handlePin}
                              onArchive={handleArchive}
                              onDuplicate={handleDuplicate}
                              onExportCal={handleExportICal}
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

        {!showArchived && events.length > 0 && (
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
          customCategories={customCategories}
        />

        <CategoryManager
          isOpen={isCatManagerOpen}
          onClose={() => setIsCatManagerOpen(false)}
          customCategories={customCategories}
          onAdd={addCustomCategory}
          onRemove={removeCustomCategory}
        />

        <TemplateGallery
          isOpen={isTemplatesOpen}
          onClose={() => setIsTemplatesOpen(false)}
          onAddEvent={(e) => {
            addEvent(e as any);
            showSuccess(`已添加「${e.name}」`);
          }}
        />

        {detailEvent && (
          <EventDetail
            event={detailEvent}
            onClose={() => setDetailEvent(null)}
            onEdit={handleEdit}
          />
        )}

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSignIn={signInWithEmail}
          onSignUp={signUpWithEmail}
          onGithub={signInWithGithub}
        />

        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <Onboarding onComplete={() => { }} />
      </div>
    </ErrorBoundary>
  );
}

export default App;

