import { ListTable, PageTitle, TableHeader, Button, TextField, Paragraph, FormControl, SelectBox, TaskDialog, FloatingMessageBlock, Pager } from "@freee_jp/vibes";
import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../navigation/NavBar";
import { useNavigate } from "react-router-dom";
import React from "react";
import { jwtDecode } from "jwt-decode";

const headers: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Name', ordering: 'asc' },
  { value: 'Email' },
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
  sub: number;
  name: string;
  role: string;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<Users[]>([]);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
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
          console.log(decodedToken.sub)
          fetchUsers();
        }
      } catch {
        setError(`You are not logged in.`);
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
    } catch {
      setError(`Failed to fetch users`);
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
      setSuccessMessage(`${registerUser.name} successfully registered.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      toggle();
    } catch {
      setError(`Failed to register user`);
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
      setSuccessMessage(`${editUser.name} successfully updated.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setEditUser(null);
    } catch {
      setError(`Failed to update user`);
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
      setSuccessMessage(`${deleteUser.name} successfully deleted.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setDeleteUser(null);
    } catch {
      setError(`Failed to delete user`);
    }
  };

  const userValues = Object.values(users);
  const userRows = userValues.map(user => ({
    cells: [
      { value: user.id },
      { value: user.name },
      { value: user.email },
      { value: user.role, alignCenter: true },
      { value: user.account_status === 0 ? "Inactive" : "Active", alignCenter: true },
      {
        value: (
          <div>
            <Button onClick={() => setEditUser(user)} small appearance="primary" mr={0.5}> Edit </Button>
            <Button onClick={() => setDeleteUser(user)} small danger > Delete </Button>
          </div>
        ),
        alignCenter: true
      }
    ],
  }));

  return (
    <div>
      {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
        <PageTitle mt={1}>Manage Users</PageTitle>
        <Button onClick={toggle} appearance="primary" ma={0.5} mb={1}> Register </Button>
        {error && (<FloatingMessageBlock error>{error}</FloatingMessageBlock>)}
        {successMessage && (<FloatingMessageBlock success>{successMessage}</FloatingMessageBlock>)}
          <ListTable headers={headers} rows={userRows}></ListTable>
        <TaskDialog 
          id="register-user-dialog" 
          isOpen={isOpen} 
          title="Register A User" 
          onRequestClose={toggle} 
          closeButtonLabel="Cancel" 
          primaryButtonLabel="Register" 
          danger={false} 
          onPrimaryAction={handleRegister} 
          shouldCloseOnOverlayClickOrEsc={true} 
          mobileButtonLayout="column"
        >
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
        </TaskDialog>

        {editUser && (
          <TaskDialog
            id="edit-user-dialog"
            isOpen={Boolean(editUser)}
            title="Edit User"
            onRequestClose={() => setEditUser(null)}
            closeButtonLabel="Cancel"
            primaryButtonLabel="Save"
            onPrimaryAction={handleUpdate}
            shouldCloseOnOverlayClickOrEsc={true}
            mobileButtonLayout="column"
          >
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
          </TaskDialog>
        )}

        {deleteUser && (
          <TaskDialog
            id="delete-user-dialog"
            isOpen={Boolean(deleteUser)}
            title="Confirm Delete"
            onRequestClose={() => setDeleteUser(null)}
            closeButtonLabel="Cancel"
            primaryButtonLabel="Delete"
            danger={true}
            onPrimaryAction={handleDelete}
            shouldCloseOnOverlayClickOrEsc={false}
            mobileButtonLayout="column"
          >
            <Paragraph>Are you sure you want to delete {deleteUser.name}?</Paragraph>
          </TaskDialog>
        )}
        <Pager currentPage={1} pageRange={1} pageCount={1} onPageChange={navigate}></Pager>
    </div>
  );
};

export default AdminUsersPage;