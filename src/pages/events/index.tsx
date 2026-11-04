import React, { useState } from 'react';
import type { OrganizationEvent } from '@/types';
import { useEvents } from './data/use-events';
import { useMembers } from '@/pages/members/data/use-members';
import { EventHeaderSection } from './sections/EventHeaderSection';
import { EventListSection } from './sections/EventListSection';
import { EventFormModalSection } from './sections/EventFormModalSection';
import { AttendanceModalSection } from './sections/AttendanceModalSection';
import { ANIMATIONS } from '@/lib/animations';

export const EventsPage: React.FC = () => {
  const {
    events,
    totalEventsCount,
    finalizedEventsCount,
    searchQuery,
    setSearchQuery,
    selectedTypeFilter,
    setSelectedTypeFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    canManageEvents,
    canRecordAttendance,
    addEvent,
    deleteEvent,
    saveAttendance,
    getEventPresentMemberIds,
  } = useEvents();

  const { members, divisions } = useMembers();

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState<OrganizationEvent | null>(null);

  const handleOpenAttendance = (event: OrganizationEvent) => {
    setSelectedEventForAttendance(event);
  };

  const handleCloseAttendance = () => {
    setSelectedEventForAttendance(null);
  };

  return (
    <div className={`flex flex-col gap-6 ${ANIMATIONS.PAGE_FADE_IN}`}>
      <EventHeaderSection
        canManageEvents={canManageEvents}
        onOpenAddEvent={() => setIsAddEventOpen(true)}
        totalEventsCount={totalEventsCount}
        finalizedEventsCount={finalizedEventsCount}
      />

      <EventListSection
        events={events}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTypeFilter={selectedTypeFilter}
        onTypeFilterChange={setSelectedTypeFilter}
        selectedStatusFilter={selectedStatusFilter}
        onStatusFilterChange={setSelectedStatusFilter}
        canRecordAttendance={canRecordAttendance}
        canManageEvents={canManageEvents}
        onOpenAttendance={handleOpenAttendance}
        onDeleteEvent={deleteEvent}
      />

      <EventFormModalSection
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onAddEvent={addEvent}
      />

      <AttendanceModalSection
        isOpen={Boolean(selectedEventForAttendance)}
        onClose={handleCloseAttendance}
        event={selectedEventForAttendance}
        members={members}
        divisions={divisions}
        presentMemberIds={
          selectedEventForAttendance
            ? getEventPresentMemberIds(selectedEventForAttendance.id)
            : []
        }
        onSaveAttendance={saveAttendance}
      />
    </div>
  );
};

