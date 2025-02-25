import { Button, FloatingMessageBlock, FormControl, PageTitle, Paragraph, SearchField, SelectBox, ListTable, TaskDialog, TableHeader, Pager } from "@freee_jp/vibes";
import NavBar from "../navigation/NavBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";
import { jwtDecode } from "jwt-decode";
import { Plus, Trash } from "lucide-react";

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
  { value: 'ID' },
  { value: 'Mentor' },
  { value: 'Mentor Email' },
  { value: 'Mentee' },
  { value: 'Mentee Email' },
  { value: 'Actions', alignRight: true }
];

const MentorshipPage = () => {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; id: number } | null>(null);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentors[]>([]);
  const [mentees, setMentees] = useState<Mentees[]>([]);
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [isAssignOpen, setAssignOpen] = React.useState<boolean>(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState<boolean>(false);
  const [createMentorship, setCreateMentorship] = useState<{ mentorID: number | null, menteeID: number | null }>({ mentorID: null, menteeID: null });
  const [deleteMentorshipId, setDeleteMentorshipId] = useState<number | null>(null);
  const [deleteMentorship, setDeleteMentorship] = useState<Mentorship | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
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
      } catch {
        setError("Invalid token");
        navigate('/sign_in');
      }
    };
    fetchCurrentUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchMentors = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/users/mentors", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentors(response.data);
    } catch {
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
    } catch {
      setError("Failed to fetch mentees");
    }
  };

  const fetchMentorships = async (page: number = 1, searchTerm: string = "") => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/mentorships", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: {
            mentor_name_or_mentor_email_or_mentee_name_or_mentee_email_cont: searchTerm
          },
          page: page
        }
      });
  
      setMentorships(response.data.mentorships);
      setCurrentPage(response.data.pagination.current_page);
      setTotalPages(response.data.pagination.total_pages);
    } catch {
      setError("Failed to fetch mentorships");
    }
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchMentorships(currentPage, term);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchMentorships(newPage, searchTerm);
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
      setSuccessMessage(`Mentor ${createMentorship.mentorID} successfully assigned to ${createMentorship.menteeID}.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchMentorships();
    } catch {
      setError("Failed to create mentorship");
    }
  };

  const handleDeleteMentorship = (mentorship :Mentorship) => {
    setDeleteMentorship(mentorship);
    setDeleteMentorshipId(mentorship.id);
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
      setSuccessMessage(`Mentorship ${deleteMentorshipId} successfully deleted.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchMentorships(currentPage, searchTerm);
    } catch {
      setError("Failed to delete mentorship");
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
            <Button IconComponent={Trash} onClick={() => handleDeleteMentorship(mentorship)} danger small ml={0.5} mr={0.5} appearance="tertiary">Delete</Button>
          </div>
        ),
        alignRight: true
      },
    ],
  }));

  return (
    <div>
      {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
        <PageTitle mt={1} ml={1} >Assign Mentors</PageTitle>
        <Button IconComponent={Plus} onClick={handleAssignClick} mt={0.5} mb={1} ml={1}>Assign Mentors</Button>
        <FormControl mb={0.5} ml={1} label={"Name/Email"}>
        <SearchField
          id="search"
          label="title"
          placeholder="Search by name"
          name="search"
          width="medium"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
        />
        </FormControl>
        {error && (<FloatingMessageBlock error>{error}</FloatingMessageBlock>)}
        {successMessage && (<FloatingMessageBlock success>{successMessage}</FloatingMessageBlock>)}
        <TaskDialog 
          id="assign-mentorships"
          isOpen={isAssignOpen}
          title="Assign a Mentor to a Mentee"
          onRequestClose={() => setAssignOpen(false)}
          closeButtonLabel="Close"
          primaryButtonLabel="Save"
          onPrimaryAction={handleCreateMentorship}
          shouldCloseOnOverlayClickOrEsc
        >
          <FormControl label="Select a Mentor" fieldId="selectBox-1" required>
            <SelectBox width="full"
              id="selectBox-1"
              name="mentor"
              options={mentors.map(mentor => ({
                name: mentor.name,
                value: mentor.id?.toString() ?? ''
              }))}
              onChange={e => setCreateMentorship({ ...createMentorship, mentorID: Number(e.target.value) })}
            />
          </FormControl>
          <FormControl label="Select a Mentee" fieldId="selectBox-2" required>
            <SelectBox width="full"
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
          id="delete-mentorships"
          isOpen={isDeleteOpen}
          title="Are you sure you want to delete this Mentorship?"
          onRequestClose={() => setDeleteOpen(false)}
          closeButtonLabel="Cancel"
          primaryButtonLabel="Delete"
          onPrimaryAction={handleConfirmDeleteMentorship}
          shouldCloseOnOverlayClickOrEsc
          danger={true}
        >
          <Paragraph textAlign="center">Mentor Name: {deleteMentorship?.mentor_name}</Paragraph>
          <Paragraph textAlign="center">Mentee Name: {deleteMentorship?.mentee_name}</Paragraph>
        </TaskDialog>
          <ListTable headers={mentorshipHeaders} rows={mentorshipRows} ma={1}/>
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

export default MentorshipPage;