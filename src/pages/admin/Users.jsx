import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

import CreateUserModal from "../../features/users/CreateUserModal";
import EditUserModal from "../../features/users/EditUserModal";
import ConfirmDeleteModal from "../../components/common/DeleteCofirmation";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(list);
    });

    return () => unsub();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const paginated = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      {/* HEADER */}

      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Users</h1>
          <p className="text-gray-500 text-sm">Manage system users</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-white px-6 py-2 rounded-xl"
        >
          + Create User
        </button>
      </div>

      {/* FILTERS */}

      <div className="flex gap-4 mb-6">
        <input
          placeholder="Search username or email"
          className="border px-4 py-2 rounded-xl w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded-xl"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="eventOrganizer">Organizer</option>
        </select>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="border-b bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-4 text-left w-1/4">Username</th>
              <th className="p-4 text-left w-1/3">Email</th>
              <th className="p-4 text-left w-1/6">Role</th>
              <th className="p-4 text-right w-1/4">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {paginated.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{user.username}</td>

                <td className="p-4">{user.email}</td>

                <td className="p-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "staff"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditUser(user)}
                      className="text-blue-600 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteUser(user)}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      <div className="flex justify-center gap-3 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="border px-3 py-1 rounded"
        >
          Prev
        </button>

        <span className="px-4 py-1">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="border px-3 py-1 rounded"
        >
          Next
        </button>
      </div>

      {/* MODALS */}

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}

      {editUser && (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
      )}

      {deleteUser && (
        <ConfirmDeleteModal
          title="Delete User"
          message={`Delete "${deleteUser.username}"?`}
          onCancel={() => setDeleteUser(null)}
          onConfirm={async () => {
            await deleteDoc(doc(db, "users", deleteUser.id));
            setDeleteUser(null);
          }}
        />
      )}
    </div>
  );
}
