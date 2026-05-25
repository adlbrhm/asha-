import { Search, MoreVertical } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';

export default function UserTable({ users, onView, onUpdate, onRestrict, onChangeStatus, onRemove }) {
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openUpward, setOpenUpward] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (e, userId) => {
    e.stopPropagation();
    if (openMenuId === userId) {
      setOpenMenuId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const shouldOpenUpward = window.innerHeight - rect.bottom < 220;
    setOpenUpward(shouldOpenUpward);
    setOpenMenuId(userId);
  };
  
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.village?.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aRole = String(a.role || "").toUpperCase();
      const bRole = String(b.role || "").toUpperCase();
    
      if (aRole === "ADMIN" && bRole !== "ADMIN") return 1;
      if (aRole !== "ADMIN" && bRole === "ADMIN") return -1;
    
      return 0;
    });
  }, [filteredUsers]);

  const getStatusBadgeClass = (status) => {
    if (status === 'ACTIVE' || status === 'Active') return 'bg-status-green/10 text-status-green border-status-green/30';
    if (status === 'RESTRICTED') return 'bg-status-red/10 text-status-red border-status-red/30';
    return 'bg-text-muted/10 text-text-muted border-text-muted/30';
  };

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search personnel by name, village, or role..."
          className="w-full bg-surface-2 border border-border-primary/50 rounded-lg py-2.5 pl-9 pr-4 text-sm font-medium text-text-main focus:outline-none focus:border-text-muted transition-colors duration-200 placeholder:text-text-muted/60"
        />
      </div>

      <div className="border border-border-primary/50 rounded-xl bg-surface-1 overflow-x-auto overflow-y-visible">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-surface-2/50 border-b border-border-primary/50 text-[10px] uppercase tracking-widest text-text-muted font-bold">
              <th className="px-4 py-3 sticky top-0 bg-surface-2/90 backdrop-blur-sm z-10">Personnel</th>
              <th className="px-4 py-3 sticky top-0 bg-surface-2/90 backdrop-blur-sm z-10">Role</th>
              <th className="px-4 py-3 sticky top-0 bg-surface-2/90 backdrop-blur-sm z-10">Location</th>
              <th className="px-4 py-3 sticky top-0 bg-surface-2/90 backdrop-blur-sm z-10">Status</th>
              <th className="px-4 py-3 sticky top-0 bg-surface-2/90 backdrop-blur-sm z-10 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary/30">
            {sortedUsers.map(user => {
              const isAdmin = user.role.toUpperCase() === 'ADMIN';
              const st = user.status?.toUpperCase() || 'ACTIVE';

              return (
                <tr key={user.id} className="hover:bg-surface-2/30 transition-colors duration-150 group">
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-bold text-text-main leading-tight">{user.name}</p>
                      {isAdmin && <span className="px-1.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary text-[9px] uppercase font-bold border border-accent-primary/30 leading-none tracking-widest">Protected</span>}
                    </div>
                    <p className="text-[11px] font-medium text-text-muted mt-1 leading-tight">{user.loginId || user.email || 'No login ID'}</p>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="text-sm font-bold text-text-main">{user.role}</span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <p className="text-sm font-bold text-text-main leading-tight">{user.phc || user.phcName || 'District HQ'}</p>
                    <p className="text-[11px] font-medium text-text-muted mt-1 leading-tight">{user.village || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(st)}`}>
                      {st}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {!isAdmin && (
                        <>
                          <button 
                            onClick={() => onView && onView(user)}
                            className="px-3 py-1.5 bg-surface-2 hover:bg-border-primary/50 border border-border-primary/50 text-text-main text-xs font-medium rounded-lg transition-colors duration-200"
                          >
                            View
                          </button>
                          
                          <button 
                            onClick={() => onUpdate && onUpdate(user)}
                            className="px-3 py-1.5 bg-surface-2 hover:bg-border-primary/50 border border-border-primary/50 text-text-main text-xs font-medium rounded-lg transition-colors duration-200"
                          >
                            Edit
                          </button>
                          
                          <div className="relative inline-block text-left opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                            <button 
                              onClick={(e) => toggleMenu(e, user.id)}
                              className="px-3 py-1.5 bg-surface-2 hover:bg-border-primary/50 border border-border-primary/50 text-text-main text-xs font-medium rounded-lg transition-colors duration-200 flex items-center space-x-1"
                            >
                              <span>More</span>
                            </button>
                            
                            {openMenuId === user.id && (
                              <div 
                                ref={menuRef}
                                className={`absolute right-0 w-36 bg-surface-1 border border-border-primary/50 rounded-lg shadow-xl z-50 overflow-hidden text-left ${
                                  openUpward ? "bottom-full mb-2" : "top-full mt-2"
                                }`}
                              >
                                {st === 'ACTIVE' && (
                                  <button onClick={() => { onChangeStatus && onChangeStatus(user, 'INACTIVE'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-medium text-text-main hover:bg-surface-2 transition-colors">
                                    Deactivate
                                  </button>
                                )}
                                {st === 'INACTIVE' && (
                                  <button onClick={() => { onChangeStatus && onChangeStatus(user, 'ACTIVE'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-medium text-text-main hover:bg-surface-2 transition-colors">
                                    Activate
                                  </button>
                                )}
                                {st === 'RESTRICTED' && (
                                  <button onClick={() => { onChangeStatus && onChangeStatus(user, 'ACTIVE'); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-medium text-text-main hover:bg-surface-2 transition-colors">
                                    Restore Access
                                  </button>
                                )}
                                {st !== 'RESTRICTED' && (
                                  <button onClick={() => { onRestrict && onRestrict(user); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-medium text-status-red hover:bg-status-red/10 transition-colors">
                                    Restrict
                                  </button>
                                )}
                                <button onClick={() => { onRemove && onRemove(user); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-medium text-status-red hover:bg-status-red/10 transition-colors border-t border-border-primary/30">
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-sm font-medium text-text-muted">
                  No personnel records match current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
