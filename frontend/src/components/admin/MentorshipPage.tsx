import { Button, CardBase, Container, FormControl, ListTable, PageTitle, SelectBox, TableHeader, TaskDialog } from "@freee_jp/vibes";
import NavBar from "../navigation/NavBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";
import { jwtDecode } from "jwt-decode";

interface Mentors {
  id?: number;
  name: string;
  email: string;
}

interface Mentees {
  id?: number;
  name: string;
  email: string;
}

interface Mentorship {
  id: number;
  mentor_id: number;
  mentee_id: number;
  mentor_name: string;
  mentor_email: string;
  mentee_name: string;
  mentee_email: string;
}

interface CustomJwtPayload {
  id: number;
  name: string;
  role: string;
}

const mentorshipHeaders: TableHeader[] = [
  { value: 'Mentorship ID', ordering: 'asc' },
  { value: 'Mentor' },
  { value: 'Mentor Email' },
  { value: 'Mentee' },
  { value: 'Mentee Email' },
  { value: 'Actions', alignRight: true }
];

const MentorshipPage = () => {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; id: number } | null>(null);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentors[]>([]);
  const [mentees, setMentees] = useState<Mentees[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [isAssignOpen, setAssignOpen] = React.useState<boolean>(false);
  const [isEditOpen, setEditOpen] = React.useState<boolean>(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState<boolean>(false);
  const [createMentorship, setCreateMentorship] = useState<{ mentorID: number | null, menteeID: number | null }>({ mentorID: null, menteeID: null });
  const [editMentorship, setEditMentorship] = useState<{ id: number | null, mentorID: number | null, menteeID: number | null }>({ id: null, mentorID: null, menteeID: null });
  const [deleteMentorshipId, setDeleteMentorshipId] = useState<number | null>(null);
  const token = localStorage.getItem('authToken');


  useEffect(() => {
    const fetchCurrentUser = async () => {
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
          fetchMentors();
          fetchMentees();
          fetchMentorships();
        }
      } catch (err) {
        setError("Invalid token");
        navigate('/sign_in');
      }
    };
    fetchCurrentUser();
  }, [navigate]);

  const fetchMentors = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/users/mentors", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentors(response.data);
    } catch (err) {
      setError("Failed to fetch mentors");
    }
  };

  const fetchMentees = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/users/mentees", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentees(response.data);
    } catch (err) {
      setError("Failed to fetch mentees");
    }
  };

  const fetchMentorships = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/mentorships", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      setMentorships(response.data);
    } catch (err) {
      setError("Failed to fetch mentorships");
    }
  };

  const handleCreateMentorship = async () => {
    if (!createMentorship.mentorID || !createMentorship.menteeID) {
      setError("Please select both a mentor and a mentee");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/api/v1/mentorships", {
        mentor_id: createMentorship.mentorID,
        mentee_id: createMentorship.menteeID
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentorships([...mentorships, response.data]);
      setAssignOpen(false);
      fetchMentorships();
    } catch (err) {
      setError("Failed to create mentorship");
    }
  };

  const handleUpdateMentorship = async () => {
    if (!editMentorship.id || !editMentorship.mentorID || !editMentorship.menteeID) {
      setError("Please select both a mentor and a mentee");
      return;
    }
    try {
      const response = await axios.put(`http://localhost:3000/api/v1/mentorships/${editMentorship.id}`, {
        mentor_id: editMentorship.mentorID,
        mentee_id: editMentorship.menteeID
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentorships(mentorships.map(m => m.id === editMentorship.id ? response.data : m));
      setEditOpen(false);
    } catch (err) {
      setError("Failed to update mentorship");
    }
  };

  const handleDeleteMentorship = (id: number) => {
    setDeleteMentorshipId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDeleteMentorship = async () => {
    if (!deleteMentorshipId) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/mentorships/${deleteMentorshipId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentorships(mentorships.filter(m => m.id !== deleteMentorshipId));
      setDeleteOpen(false);
    } catch (err) {
      setError("Failed to delete mentorship");
    }
  };

  const handleEditMentorship = (id: number) => {
    const mentorship = mentorships.find(m => m.id === id);
    if (mentorship) {
      setEditMentorship({ id: mentorship.id, mentorID: mentorship.mentor_id, menteeID: mentorship.mentee_id });
      setEditOpen(true);
    }
  };

  const handleAssignClick = () => {
    setCreateMentorship({ mentorID: null, menteeID: null });
    setAssignOpen(true); 
  };

  const mentorshipRows = mentorships.map(mentorship => ({
    cells: [
      { value: mentorship.id },
      { value: mentorship.mentor_name },
      { value: mentorship.mentor_email },
      { value: mentorship.mentee_name },
      { value: mentorship.mentee_email },
      {
        value: (
          <div>
            <Button onClick={() => handleEditMentorship(mentorship.id)}  appearance="primary" small>Edit</Button>
            <Button onClick={() => handleDeleteMentorship(mentorship.id)} danger small ml={0.5}>Delete</Button>
          </div>
        ),
        alignRight: true
      },
    ],
  }));

  return (
    <div>
      {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
      <Container>
        <PageTitle mt={1} >Mentorships</PageTitle>
        <Button onClick={() => setAssignOpen(true)} mt={0.5} mb={1} appearance="primary">Assign</Button>
        <TaskDialog 
          id="assign-mentorships"
          isOpen={isAssignOpen}
          title="Assign a Mentor to a Mentee"
          onRequestClose={() => setAssignOpen(false)}
          closeButtonLabel="Cancel"
          primaryButtonLabel="Create"
          onPrimaryAction={handleCreateMentorship}
          shouldCloseOnOverlayClickOrEsc
        >
          <FormControl label="Select a Mentor" fieldId="selectBox-1">
            <SelectBox
              id="selectBox-1"
              name="mentor"
              options={mentors.map(mentor => ({
                name: mentor.name,
                value: mentor.id?.toString() ?? ''
              }))}
              onChange={e => setCreateMentorship({ ...createMentorship, mentorID: Number(e.target.value) })}
            />
          </FormControl>
          <FormControl label="Select a Mentee" fieldId="selectBox-2">
            <SelectBox
              id="selectBox-2"
              name="mentee"
              options={mentees.map(mentee => ({
                name: mentee.name,
                value: mentee.id?.toString() ?? ''
              }))}
              onChange={e => setCreateMentorship({ ...createMentorship, menteeID: Number(e.target.value) })}
            />
          </FormControl>
        </TaskDialog>
        <TaskDialog 
          id="edit-mentorships"
          isOpen={isEditOpen}
          title="Edit Mentorship"
          onRequestClose={() => setEditOpen(false)}
          closeButtonLabel="Cancel"
          primaryButtonLabel="Update"
          onPrimaryAction={handleUpdateMentorship}
          shouldCloseOnOverlayClickOrEsc
        >
          <FormControl label="Select a Mentor" fieldId="selectBox-3">
            <SelectBox
              id="selectBox-3"
              name="mentor"
              options={mentors.map(mentor => ({
                name: mentor.name,
                value: mentor.id?.toString() ?? ''
              }))}
              value={editMentorship.mentorID?.toString() ?? ''}
              onChange={e => setEditMentorship({ ...editMentorship, mentorID: Number(e.target.value) })}
            />
          </FormControl>
          <FormControl label="Select a Mentee" fieldId="selectBox-4">
            <SelectBox
              id="selectBox-4"
              name="mentee"
              options={mentees.map(mentee => ({
                name: mentee.name,
                value: mentee.id?.toString() ?? ''
              }))}
              value={editMentorship.menteeID?.toString() ?? ''}
              onChange={e => setEditMentorship({ ...editMentorship, menteeID: Number(e.target.value) })}
            />
          </FormControl>
        </TaskDialog>
        <TaskDialog 
          id="delete-mentorships"
          isOpen={isDeleteOpen}
          title="Delete Mentorship"
          onRequestClose={() => setDeleteOpen(false)}
          closeButtonLabel="Cancel"
          primaryButtonLabel="Delete"
          onPrimaryAction={handleConfirmDeleteMentorship}
          shouldCloseOnOverlayClickOrEsc
          danger={true}
        >
          <p>Are you sure you want to delete this mentorship?</p>
        </TaskDialog>
        <CardBase>
          <ListTable headers={mentorshipHeaders} rows={mentorshipRows} />
        </CardBase>
      </Container>
    </div>
  );
};

export default MentorshipPage;