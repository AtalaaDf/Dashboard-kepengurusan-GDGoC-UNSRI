import React, { useState } from 'react';
import { useMembers } from './data/use-members';
import { MemberHeaderSection } from './sections/MemberHeaderSection';
import { MemberListSection } from './sections/MemberListSection';
import { MemberFormModalSection } from './sections/MemberFormModalSection';
import { DivisionModalSection } from './sections/DivisionModalSection';
import { ANIMATIONS } from '@/lib/animations';

export const MembersPage: React.FC = () => {
  const {
    divisions,
    members,
    totalMembersCount,
    activeMembersCount,
    searchQuery,
    setSearchQuery,
    selectedDivisionFilter,
    setSelectedDivisionFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    errorMessage,
    setErrorMessage,
    isSuperadmin,
    addDivision,
    deleteDivision,
    addMember,
    toggleMemberStatus,
    getDivisionById,
  } = useMembers();

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isManageDivisionsOpen, setIsManageDivisionsOpen] = useState(false);

  return (
    <div className={`flex flex-col gap-6 ${ANIMATIONS.PAGE_FADE_IN}`}>
      <MemberHeaderSection
        isSuperadmin={isSuperadmin}
        onOpenAddMember={() => setIsAddMemberOpen(true)}
        onOpenManageDivisions={() => setIsManageDivisionsOpen(true)}
        totalMembersCount={totalMembersCount}
        activeMembersCount={activeMembersCount}
      />

      <MemberListSection
        members={members}
        divisions={divisions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDivisionFilter={selectedDivisionFilter}
        onDivisionFilterChange={setSelectedDivisionFilter}
        selectedStatusFilter={selectedStatusFilter}
        onStatusFilterChange={setSelectedStatusFilter}
        isSuperadmin={isSuperadmin}
        onToggleStatus={toggleMemberStatus}
        getDivisionById={getDivisionById}
      />

      <MemberFormModalSection
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        divisions={divisions}
        onAddMember={addMember}
      />

      <DivisionModalSection
        isOpen={isManageDivisionsOpen}
        onClose={() => setIsManageDivisionsOpen(false)}
        divisions={divisions}
        members={members}
        onAddDivision={addDivision}
        onDeleteDivision={deleteDivision}
        errorMessage={errorMessage}
        clearErrorMessage={() => setErrorMessage(null)}
      />
    </div>
  );
};

