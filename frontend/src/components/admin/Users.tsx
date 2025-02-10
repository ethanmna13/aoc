import { ListTable, PageTitle, TableHeader, Text, Button, FormControlLabel, TextField, Paragraph } from "@freee_jp/vibes";
import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../navigation/NavBar";
import { Form } from "react-router-dom";

const headers: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Name', ordering: 'asc' },
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
  const [currentUser, setCurrentUser] = useState<{ name: string; role: number } | null>(null); // Role is now a number

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      setCurrentUser({
        name: user.name,
        role: Number(user.role),
      });
    }
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

  const userValues = Object.values(users);
  const userRows = userValues.map(user => ({
    cells: [
      { value: user.id },
      { value: user.name },
      { value: user.role },
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
      <NavBar name={currentUser?.name || "Admin Name"} role={0} />

      <PageTitle>Admin - Manage Users</PageTitle>
      <Button onClick={() => setRegisterUser({ name: "", email: "", role: 2, account_status: 1 })}> Register </Button>
      {error && <Text>{error}</Text>}
      <ListTable headers={headers} rows={userRows}></ListTable>

      {/* Register User Modal */}
      {registerUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <PageTitle>Register User</PageTitle>
            <div className="mb-4">
              <FormControlLabel>Name</FormControlLabel>
              <TextField
                type="text"
                value={registerUser.name}
                onChange={(e) =>
                  setRegisterUser({ ...registerUser, name: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <FormControlLabel>Email</FormControlLabel>
              <TextField
                type="email"
                value={registerUser.email}
                onChange={(e) =>
                  setRegisterUser({ ...registerUser, email: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <FormControlLabel>Role</FormControlLabel>
              <select
                value={registerUser.role}
                onChange={(e) =>
                  setRegisterUser({ ...registerUser, role: Number(e.target.value) })
                }
                className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Admin</option>
                <option value={1}>Mentor</option>
                <option value={2}>Mentee</option>
              </select>
              <FormControlLabel>Role</FormControlLabel>
              
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRegister}
              >
                Register
              </Button>
              <Button
                onClick={() => setRegisterUser(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <PageTitle>Edit User</PageTitle>
            <div className="mb-4">
              <FormControlLabel>Name</FormControlLabel>
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
              <FormControlLabel>Role</FormControlLabel>
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
              <FormControlLabel>Account Status</FormControlLabel>
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
              <Button
                onClick={handleUpdate}
               >
                Save
              </Button>
              <Button
                onClick={() => setEditUser(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <PageTitle>Confirm Delete</PageTitle>
            <Paragraph>Are you sure you want to delete {deleteUser.name}?</Paragraph>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                onClick={() => setDeleteUser(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;