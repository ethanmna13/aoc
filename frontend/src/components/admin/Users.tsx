import { ListTable, PageTitle, TableHeader, Text, Button } from "@freee_jp/vibes";
import { useState, useEffect } from "react";
import axios from "axios";

const headers: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Name', ordering: 'asc' },
  { value: 'Email' },
  { value: 'Role' },
  { value: 'Account Status' },
  { value: 'Actions', alignRight: true }
];

interface Users {
  id?: number;
  name: string;
  email: string;
  role: number;
  account_status: number;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<Users[]>([]);
  const [error, setError] = useState<string>("");
  const [editUser, setEditUser] = useState<Users | null>(null);
  const [deleteUser, setDeleteUser] = useState<Users | null>(null);
  const [registerUser, setRegisterUser] = useState<Users | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/users", {
        withCredentials: true,
      });
      setUsers(response.data); 
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const handleRegister = async () => {
    if (!registerUser) return;
    try {
      await axios.post("http://localhost:3000/api/v1/admin/users", registerUser, { withCredentials: true });
      fetchUsers();
      setRegisterUser(null);
    } catch (err) {
      setError("Failed to register user");
    }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      await axios.put(`http://localhost:3000/api/v1/admin/users/${editUser.id}`, editUser, {
        withCredentials: true,
      });
      fetchUsers();
      setEditUser(null);
    } catch (err) {
      setError("Failed to update user");
    }
  };
  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/admin/users/${deleteUser.id}`, {
        withCredentials: true,
      });
      fetchUsers();
      setDeleteUser(null);
    } catch (err) {
      setError("Failed to delete user");
    }
  };
  const userValues = Object.values(users)
  const userRows = userValues.map(user => ({
    cells: [
      { value: user.id },
      { value: user.name },
      { value: user.email },
      { value: user.role === 0 ? "Admin" : user.role === 1 ? "Mentor" : "Mentee" },
      { value: user.account_status === 0 ? "Inactive" : "Active" },
      { 
        value: (
          <div className="flex space-x-2">
            <Button onClick={() => setEditUser(user)} small> Edit </Button>
            <Button onClick={() => setDeleteUser(user)} small danger> Delete </Button>
          </div>
        ), 
        alignRight: true
      }
    ],
  }));

  return (
    <div>
      <PageTitle>Admin - Manage Users</PageTitle>
      {error && <Text>{error}</Text>}
      <ListTable headers={headers} rows={userRows}></ListTable>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit User</h2>
            <div className="mb-4">
              <label className="block mb-1 text-gray-600">Name</label>
              <input
                type="text"
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
                className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-600">Role</label>
              <select
                value={editUser.role}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: Number(e.target.value) })
                }
                className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Admin</option>
                <option value={1}>Mentor</option>
                <option value={2}>Mentee</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-gray-600">Account Status</label>
              <select
                value={editUser.account_status}
                onChange={(e) =>
                  setEditUser({
                    ...editUser,
                    account_status: Number(e.target.value),
                  })
                }
                className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Inactive</option>
                <option value={1}>Active</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditUser(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h2>
            <p className="text-gray-600">Are you sure you want to delete {deleteUser.name}?</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteUser(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

