import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, ArrowRight, X, UserPlus } from 'lucide-react';
import { useGroupStore } from '@/store/groupStore';
import { useUIStore } from '@/store/uiStore';
import { formatCurrency } from '@/lib/utils';

const memberColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6B4C9A', '#EC4899', '#3B82F6', '#14B8A6'];

export default function GroupsScreen() {
  const navigate = useNavigate();
  const { groups, createGroup } = useGroupStore();
  const { showToast } = useUIStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏠');
  const [memberInputs, setMemberInputs] = useState(['']);

  const icons = ['🏠', '🏖️', '🎓', '🎉', '✈️', '🍽️', '🚗', '💼', '🎮', '🎬'];

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const validMembers = memberInputs.filter(m => m.trim()).map((name, i) => ({
        id: `new-${Date.now()}-${i}`,
        name: name.trim(),
        initials: name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        balance: 0,
      }));

      if (validMembers.length === 0) {
        showToast('error', 'Add at least one member');
        return;
      }

      createGroup({
        name: newGroupName.trim(),
        icon: selectedIcon,
        color: memberColors[Math.floor(Math.random() * memberColors.length)],
        members: [
          { id: '1', name: 'You', initials: 'VS', balance: 0 },
          ...validMembers,
        ],
        currency: 'INR',
      });
      showToast('success', `Group "${newGroupName}" created!`);
      setShowCreate(false);
      setNewGroupName('');
      setMemberInputs(['']);
    }
  };

  const addMemberInput = () => setMemberInputs([...memberInputs, '']);
  const updateMemberInput = (idx: number, val: string) => {
    const next = [...memberInputs];
    next[idx] = val;
    setMemberInputs(next);
  };
  const removeMemberInput = (idx: number) => {
    setMemberInputs(memberInputs.filter((_, i) => i !== idx));
  };

  return (
    <div className="px-5 py-4 lg:px-12 lg:py-8 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-[#000]">Groups</h2>
            <p className="text-sm text-[#888]">{groups.length} groups</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-medium shadow-button hover:bg-[#3f38b7] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Group
          </button>
        </div>

        {/* Group Cards */}
        <div className="space-y-3">
          {groups.map((group, idx) => (
            <motion.button
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              onClick={() => navigate(`/groups/${group.id}`)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all text-left active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: `${group.color}15` }}>
                {group.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-[#000] truncate">{group.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-[#888]" />
                  <span className="text-xs text-[#888]">{group.members.length} members</span>
                  <span className="text-xs text-[#888]">• {group.expenses.length} expenses</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold" style={{ color: group.color }}>
                  {formatCurrency(group.totalExpenses, group.currency)}
                </p>
                <div className="flex -space-x-2 mt-1 justify-end">
                  {group.members.slice(0, 3).map((m, i) => (
                    <div
                      key={m.id}
                      className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: memberColors[i % memberColors.length] }}
                    >
                      {m.initials}
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-[#F0F0F0] flex items-center justify-center text-[8px] font-medium text-[#888]">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#CCC] shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Create Group Bottom Sheet */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
            <motion.div
              className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 z-10 max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[#000] mb-4">Create New Group</h3>

              <div className="mb-4">
                <label className="text-sm font-medium text-[#333] mb-2 block">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Flatmates, Goa Trip"
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-sm focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-[#333] mb-2 block">Choose Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {icons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        selectedIcon === icon ? 'bg-[#4F46E5] text-white ring-2 ring-[#4F46E5]/30' : 'bg-[#F5F5F5] hover:bg-[#E5E5E5]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-[#333] mb-2 block">Add Members</label>
                {memberInputs.map((val, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateMemberInput(idx, e.target.value)}
                      placeholder={`Member ${idx + 1} name`}
                      className="flex-1 px-4 py-3 border-2 border-[#E0E0E0] rounded-xl text-sm focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10"
                    />
                    {memberInputs.length > 1 && (
                      <button onClick={() => removeMemberInput(idx)} className="p-3 rounded-xl bg-[#F5F5F5] hover:bg-[#FEE2E2] transition-colors">
                        <X className="w-4 h-4 text-[#888]" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addMemberInput} className="flex items-center gap-2 text-sm text-[#4F46E5] font-medium mt-2">
                  <UserPlus className="w-4 h-4" /> Add another member
                </button>
              </div>

              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="w-full py-4 rounded-xl bg-[#4F46E5] text-white font-semibold shadow-button hover:bg-[#3f38b7] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Create Group
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
