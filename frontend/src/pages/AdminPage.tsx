import { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchBar } from '../components/common/SearchBar';
import { Button } from '../components/common/Button';
import { LoadingSpinner, EmptyState } from '../components/common/Badge';
import { GovernmentTable } from '../components/common/Table';
import { adminApi } from '../services/endpoints';
import type { User } from '../types';
import { formatDate } from '../utils/helpers';

interface AdminUser extends User {
  isActive: boolean;
  _count: { applications: number };
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    adminApi.listUsers({ search: search || undefined, role: (roleFilter as User['role']) || undefined })
      .then((res) => setUsers(res.data.data.data as AdminUser[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleToggleStatus = async (userId: string) => {
    await adminApi.toggleUserStatus(userId);
    fetchUsers();
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Admin Panel"
        subtitle="Manage citizen accounts and system users"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Admin Panel' }]}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users by name or email..." className="flex-1" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="gov-input min-w-[160px]" aria-label="Filter by role">
          <option value="">All Roles</option>
          <option value="CITIZEN">Citizen</option>
          <option value="OFFICER">Officer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="gov-card">
        <div className="px-5 py-4 border-b border-gov-border dark:border-slate-700">
          <h3 className="gov-section-title">User Management</h3>
          <p className="text-sm text-gov-muted mt-0.5">{users.length} registered users</p>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <GovernmentTable
            data={users}
            keyExtractor={(u) => u.id}
            columns={[
              { key: 'name', header: 'Name', render: (u) => <span className="font-semibold">{u.firstName} {u.lastName}</span> },
              { key: 'email', header: 'Email', render: (u) => u.email },
              {
                key: 'role', header: 'Role',
                render: (u) => (
                  <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wide bg-gov-blue-light text-gov-blue dark:bg-gov-blue/20 dark:text-blue-300 rounded">
                    {u.role}
                  </span>
                ),
              },
              { key: 'apps', header: 'Applications', render: (u) => u._count.applications },
              {
                key: 'status', header: 'Status',
                render: (u) => (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${u.isActive ? 'bg-gov-green-light text-gov-success' : 'bg-red-50 text-gov-error'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
              { key: 'joined', header: 'Joined', render: (u) => u.createdAt ? formatDate(u.createdAt) : '-' },
              {
                key: 'actions', header: 'Actions',
                render: (u) => (
                  <Button size="sm" variant={u.isActive ? 'danger' : 'primary'} onClick={() => handleToggleStatus(u.id)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
