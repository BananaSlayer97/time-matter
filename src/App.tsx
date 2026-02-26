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
import { ToastContainer } from './components/ToastContainer';
import { SearchToolbar } from './components/SearchToolbar';
import { HeaderToolbar } from './components/HeaderToolbar';
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
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimeEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailEvent, setDetailEvent] = useState<TimeEvent | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'countdown' | 'created'>('countdown');
  const [filteredEvents, setFilteredEvents] = useState<TimeEvent[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const deletedRef = useRef<TimeEvent | null>(null);

  const handleAdd = useCallback(() => {
    setEditingEvent(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((event?: TimeEvent) => {
    if (event) setEditingEvent(event);
    else setEditingEvent(null);
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
    } else if (isFocusMode) {
      setIsFocusMode(false);
    }
  }, [detailEvent, isFormOpen, handleClose, isFocusMode]);

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
              {!isFocusMode && (
                <>
                  <div className="app-header__hints">
                    <div className="hint-item">
                      <span className="hint-key">⌘</span>
                      <span className="hint-key">K</span>
                      <span className="hint-text">搜索</span>
                    </div>
                  </div>

                  <HeaderToolbar {...settingsProps} />

                  <button
                    className="app-header__action-btn"
                    onClick={() => setIsArchiveOpen(true)}
                    title="查看归档 (G A)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8" />
                      <rect x="1" y="3" width="22" height="5" />
                      <line x1="10" y1="12" x2="14" y2="12" />
                    </svg>
                    <span>归档</span>
                  </button>

                  <button
                    className="app-header__action-btn"
                    onClick={() => setIsTemplateGalleryOpen(true)}
                    title="模板库 (T)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>模板</span>
                  </button>

                  <button
                    className="app-header__add-btn"
                    onClick={() => handleEdit()}
                    title="新建事件 (N)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>新建</span>
                  </button>
                </>
              )}

              {isFocusMode && (
                <button
                  className="app-header__action-btn app-header__action-btn--exit"
                  onClick={() => setIsFocusMode(false)}
                  title="退出专注模式 (Esc)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  <span>退出模式</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className={`app-main ${isFocusMode ? 'app-main--focus' : ''}`}>
          <TimeProgress
            isFocusMode={isFocusMode}
            onToggleFocus={() => setIsFocusMode(!isFocusMode)}
          />

          {!isFocusMode && (
            <>
              <StatsBar
                events={events}
                onSearch={setSearchQuery}
                onCategoryChange={setCategoryFilter}
                onThemeChange={settingsProps.onSetTheme}
                currentTheme={settingsProps.theme}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onSortChange={setSortBy}
                sortBy={sortBy}
              />
              <div className="search-toolbar-row">
                <SearchToolbar
                  events={events}
                  onFilteredEvents={handleFilteredEvents}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
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
            </>
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

