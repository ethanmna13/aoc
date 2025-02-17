import { ListTable, PageTitle, TableHeader, Text, Button, TextField, Paragraph, Container, CardBase, FullScreenModal, FormControl, SelectBox } from "@freee_jp/vibes";
import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../navigation/NavBar";
import { useNavigate } from "react-router-dom";
import React from "react";
import { jwtDecode } from "jwt-decode";

const headers: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Name', ordering: 'asc' },
  { value: 'Role', alignCenter: true },
  { value: 'Account Status', alignCenter: true },
  { value: 'Actions', alignCenter: true }
];

interface Users {
  id?: number;
  name: string;
  email: string;
  role: number;
  account_status: number;
}

interface CustomJwtPayload {
  id: number;
  name: string;
  role: string;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<Users[]>([]);
  const [error, setError] = useState<string>("");
  const [editUser, setEditUser] = useState<Users | null>(null);
  const [deleteUser, setDeleteUser] = useState<Users | null>(null);
  const [registerUser, setRegisterUser] = useState<Users>({
    name: '',
    email: '',
    role: 0,
    account_status: 0,
  });
  const [currentUser, setCurrentUser] = useState<CustomJwtPayload | null>(null);
  const navigate = useNavigate();
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const toggle = () => setOpen(!isOpen);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("No token found, please log in again");
        navigate('/sign_in');
        return;
      }

      try {
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        setCurrentUser(decodedToken);

        if (decodedToken.role !== "admin") {
          setError("Unauthorized");
          navigate('/unauthorized');
        } else {
          fetchUsers();
        }
      } catch (err) {
        setError("Invalid token");
        navigate('/sign_in');
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post("http://localhost:3000/api/v1/admin/users", registerUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
      setRegisterUser({
        name: '',
        email: '',
        role: 0,
        account_status: 0,
      });
      toggle();
    } catch (err) {
      setError("Failed to register user");
    }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`http://localhost:3000/api/v1/admin/users/${editUser.id}`, editUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const token = localStorage.getItem('authToken');
      await axios.delete(`http://localhost:3000/api/v1/admin/users/${deleteUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      { value: user.role, alignCenter: true },
      { value: user.account_status === 0 ? "Inactive" : "Active", alignCenter: true },
      {
        value: (
          <div>
            <Button onClick={() => setEditUser(user)} small appearance="secondary" mr={0.5}> Edit </Button>
            <Button onClick={() => setDeleteUser(user)} small danger appearance="secondary"> Delete </Button>
          </div>
        ),
        alignCenter: true
      }
    ],
  }));

  return (
    <div>
      {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
      <Container>
        <PageTitle mt={1}>Admin - Manage Users</PageTitle>
        <Button onClick={toggle} appearance="primary" ma={0.5} mb={1}> Register </Button>
        {error && <Text>{error}</Text>}
        <CardBase>
          <ListTable headers={headers} rows={userRows}></ListTable>
        </CardBase>

        {/* Register User Modal */}
        <FullScreenModal isOpen={isOpen} title={"Register A User"} onRequestClose={toggle}>
          <FormControl label="Name" fieldId="name">
            <TextField
              type="text"
              value={registerUser.name || ""}
              onChange={(e) =>
                setRegisterUser({ ...registerUser, name: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Email" fieldId="email">
            <TextField
              type="email"
              value={registerUser.email || ""}
              onChange={(e) =>
                setRegisterUser({ ...registerUser, email: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Role" fieldId="role">
            <SelectBox
              id="role"
              name="role"
              options={[
                { name: 'Admin', value: '0' }, 
                { name: 'Mentor', value: '1' }, 
                { name: 'Mentee', value: '2' } 
              ]}
              onChange={(e) => setRegisterUser({ ...registerUser, role: Number(e.target.value) })}
            />
          </FormControl>
          <div className="flex gap-2">
            <Button onClick={handleRegister} mt={0.5} mr={0.5} appearance="primary"> Register </Button>
            <Button onClick={() => {
              setRegisterUser({
                name: '',
                email: '',
                role: 0,
                account_status: 0,
              });
              toggle();
            }} mt={0.5} mr={0.5} appearance="primary" danger> Cancel </Button>
          </div>
        </FullScreenModal>

        {/* Edit User Modal */}
        {editUser && (
          <FullScreenModal isOpen={Boolean(editUser)} title={"Edit User"} onRequestClose={() => setEditUser(null)}>
            <FormControl label="Name" fieldId="edit-name">
              <TextField
                type="text"
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
              />
            </FormControl>
            <FormControl label="Role" fieldId="edit-role">
              <SelectBox
                id="edit-role"
                name="role"
                options={[
                  { name: 'Admin', value: '0' }, 
                  { name: 'Mentor', value: '1' }, 
                  { name: 'Mentee', value: '2' } 
                ]}
                onChange={(e) => setEditUser({ ...editUser, role: Number(e.target.value) })}
              />
            </FormControl>
            <FormControl label="Account Status" fieldId="edit-status">
              <SelectBox
                id="edit-status"
                name="status"
                options={[
                  { name: 'Inactive', value: '0' },
                  { name: 'Active', value: '1' } 
                ]}
                onChange={(e) => setEditUser({ ...editUser, account_status: Number(e.target.value) })}
              />
            </FormControl>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} mt={0.5} mr={0.5} appearance="primary"> Save </Button>
              <Button onClick={() => setEditUser(null)} mt={0.5} mr={0.5} appearance="primary" danger> Cancel </Button>
            </div>
          </FullScreenModal>
        )}

        {/* Delete Confirmation Modal */}
        {deleteUser && (
          <FullScreenModal isOpen={Boolean(deleteUser)} title={"Confirm Delete"} onRequestClose={() => setDeleteUser(null)}>
            <Paragraph>Are you sure you want to delete {deleteUser.name}?</Paragraph>
            <div className="flex gap-2">
              <Button onClick={handleDelete} mt={0.5} mr={0.5} appearance="primary" danger> Delete </Button>
              <Button onClick={() => setDeleteUser(null)} mt={0.5} mr={0.5} appearance="primary"> Cancel </Button>
            </div>
          </FullScreenModal>
        )}
      </Container>
    </div>
  );
};

export default AdminUsersPage;
