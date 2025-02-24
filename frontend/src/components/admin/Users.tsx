import { ListTable, PageTitle, TableHeader, Button, TextField, Paragraph, FormControl, SelectBox, TaskDialog, FloatingMessageBlock, Pager, StatusIcon, SearchField, Stack } from "@freee_jp/vibes";
import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../navigation/NavBar";
import {  useNavigate } from "react-router-dom";
import React from "react";
import { jwtDecode } from "jwt-decode";
import { Plus, Trash } from "lucide-react";
import "../css/Custom.css";

const headers: TableHeader[] = [
  { value: 'ID' },
  { value: 'Name' },
  { value: 'Email' },
  { value: 'Role', alignCenter: true },
  { value: 'Account Status', alignCenter: true },
  { value: '', alignCenter: true }
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearching] = useState<boolean>(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");

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
          fetchUsers(currentPage);
        }
      } catch {
        setError(`You are not logged in.`);
        navigate('/sign_in');
      }
    };

    fetchCurrentUser();
  }, [navigate, currentPage, searchTerm, roleFilter]);

  const fetchUsers = async (page = 1, search = "", role = "all") => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/admin/users?page=${page}&q[email_cont]=${search}&role=${role}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(response.data.users || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      setError("Failed to fetch users");
      console.error(error);
    }
  };
  

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    fetchUsers(currentPage, searchTerm, role);
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchUsers(currentPage, term, roleFilter);
  };
  
  useEffect(() => {
    fetchUsers(currentPage, searchTerm, roleFilter);
  }, [currentPage, searchTerm, roleFilter]);
  
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchTerm, roleFilter);
  };
  
  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post("http://localhost:3000/api/v1/admin/users", registerUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers(currentPage);
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
      fetchUsers(currentPage);
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
      fetchUsers(currentPage);
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
      { value: user.role.toString() === 'admin' ? 'Admin' : user.role.toString() === 'mentor' ? 'Mentor' : 'Mentee', alignCenter: true },
      {
        value: (
          <div>
            {user.account_status.toString() === "active" ? (
              <StatusIcon ma={0.5} type="emphasis" marginRight marginBottom>
                Active
              </StatusIcon>
            ) : (
              <StatusIcon ma={0.5} type="done" marginRight marginBottom>
                Inactive
              </StatusIcon>
            )}
          </div>
        ),
        alignCenter: true
      },
      {
        value: (
          <div>
            <Button onClick={() => setEditUser(user)} small mr={0.5}> Edit </Button>
            <Button IconComponent={Trash} onClick={() => setDeleteUser(user)} small danger appearance="tertiary" >
              Delete
            </Button>
          </div>
        ),
        alignCenter: true
      }
    ],
  }));

  return (
    <div>
      {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
        <PageTitle mt={1} ml={1}>Users</PageTitle>
        <Button IconComponent={Plus} onClick={toggle} ml={1} mb={0.5} mt={1}> Add User </Button>
        <Stack direction="horizontal">
        <FormControl mb={0.5} ml={1} label={"Email"}>
        <SearchField
          id="search"
          label="Search"
          placeholder="Search by email"
          name="search"
          width="medium"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
        />
        </FormControl>
        <FormControl mb={0.5} ml={1} label={"Role"}>
        <SelectBox
          id="role-filter"
          label="Filter by Role"
          options={[
            { name: 'All', value: 'all' },
            { name: 'Admin', value: 'admin' },
            { name: 'Mentor', value: 'mentor' },
            { name: 'Mentee', value: 'mentee' }
          ]}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRoleFilter(e.target.value)}
          width="medium"
        />
        </FormControl>
        </Stack>
        {error && (<FloatingMessageBlock error>{error}</FloatingMessageBlock>)}
        {successMessage && (<FloatingMessageBlock success>{successMessage}</FloatingMessageBlock>)}
        {users.length === 0 && !isSearching ? (
        <Paragraph textAlign="center">No users found.</Paragraph>
        ) : (
          <ListTable headers={headers} rows={userRows} />
        )}
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
          <FormControl label="Name" fieldId="name" required>
            <TextField width="full"
              type="text"
              value={registerUser.name || ""}
              onChange={(e) =>
                setRegisterUser({ ...registerUser, name: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Email" fieldId="email" required>
            <TextField width="full"
              type="email"
              value={registerUser.email || ""}
              onChange={(e) =>
                setRegisterUser({ ...registerUser, email: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Role" fieldId="role">
            <SelectBox width="full"
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
            <FormControl label="Name" fieldId="edit-name" required>
              <TextField width="full"
                type="text"
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
              />
            </FormControl>
            <FormControl label="Role" fieldId="edit-role">
              <SelectBox width="full"
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
        <Pager 
          currentPage={currentPage} 
          pageRange={5} 
          pageCount={totalPages} 
          onPageChange={handlePageChange} 
          small={false} 
        />
    </div>
  );
};

export default AdminUsersPage;