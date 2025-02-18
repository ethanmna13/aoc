import { Button, CardBase, Container, DropdownButton, FormControl, FullScreenModal, ListTable, PageTitle, SelectBox, TableHeader, TaskDialog } from "@freee_jp/vibes";
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

interface MainTask {
  id?: number;
  name: string;
  description: string;
  deadline: string;
  users_id?: number;
  user_name?: string; 
}

interface CustomJwtPayload {
  id: number;
  name: string;
  role: string;
}

const mentorHeaders: TableHeader[] = [
  { value: 'User ID', ordering: 'asc' },
  { value: 'Mentor Name', ordering: 'asc' },
  { value: 'Email' }
];

const menteeHeaders: TableHeader[] = [
  { value: 'User ID', ordering: 'asc' },
  { value: 'Mentee Name', ordering: 'asc' },
  { value: 'Email' }
];

const mentorshipHeaders: TableHeader[] = [
  { value: 'Mentorship ID', ordering: 'asc' },
  { value: 'Mentor' },
  { value: 'Mentee' },
  { value: 'Assigned Main Tasks' },
  { value: 'Status' },
  { value: 'Submissions' },
  { value: 'Actions', alignRight: true }
];




const MentorshipPage = () => {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; id: number } | null>(null);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentors[]>([]);
  const [mentees, setMentees] = useState<Mentees[]>([]);
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [createMentorship, setCreateMentorship] = useState<{
    mentorID: number;
    menteeID: number;
    assignedMainTasks: { mainTaskId: number; subTasks: number[] }[];
  }>({
    mentorID: 0,
    menteeID: 0,
    assignedMainTasks: [],
  });
  const [isOpen, setOpen] = React.useState<boolean>(false);
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
          fetchMainTasks();
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
      const response = await axios.get("http://localhost:3000/api/v1/mentors", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentors(response.data);
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const fetchMentees = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/mentees", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMentees(response.data);
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const fetchMainTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/main_tasks", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setMainTasks(response.data);
    } catch (err) {
      setError("Failed to fetch main tasks");
    }
  };

  const handleCreateMentorship = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/v1/mentorships", {
        mentor_id: createMentorship.mentorID,
        mentee_id: createMentorship.menteeID,
        status: "Pending",
        main_tasks: createMentorship.assignedMainTasks.map(task => task.mainTaskId), 
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mentorshipId = response.data.id;

      for (const task of createMentorship.assignedMainTasks) {
        await axios.post("http://localhost:3000/api/v1/assigned_main_tasks", {
          mentorships_id: mentorshipId,
          main_task_id: task.mainTaskId,
          main_task_name: mainTasks.find(t => t.id === task.mainTaskId)?.name,
          main_task_status: "Pending",
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        for (const subTaskId of task.subTasks) {
          await axios.post("http://localhost:3000/api/v1/assigned_sub_tasks", {
            mentorships_id: mentorshipId,
            sub_task_id: subTaskId,
            assigned_main_tasks_id: task.mainTaskId,
            sub_task_status: "Pending",
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      alert("Mentorship created successfully");
      setCreateMentorship({
        mentorID: 0,
        menteeID: 0,
        assignedMainTasks: [],
      });
      setOpen(false);

    } catch (error) {
      setError("Failed to create mentorship");
    }
  };
  

  const mentorRows = mentors.map(mentor => ({
    cells: [
      { value: mentor.id },
      { value: mentor.name },
      { value: mentor.email },
    ],
  }));

  const menteeRows = mentees.map(mentee => ({
    cells: [
      { value: mentee.id },
      { value: mentee.name },
      { value: mentee.email },
    ],
  }));

  return (
    <div>
      {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
      <Container>
        <PageTitle mt={1} mb={1}>Mentors</PageTitle>
        <CardBase>
          <ListTable headers={mentorHeaders} rows={mentorRows} />
        </CardBase>
        <PageTitle mt={1} mb={1}>Mentees</PageTitle>
        <CardBase>
          <ListTable headers={menteeHeaders} rows={menteeRows} />
        </CardBase>
        <PageTitle mt={1} >Mentorships</PageTitle>
        <Button onClick={() => setOpen(true)} mt={0.5} mb={1} appearance="primary">Create</Button>
        <TaskDialog 
        id="assign-mentorships"
        isOpen={Boolean(isOpen)}
        title="Assign a Mentor to a Mentee"
        onRequestClose={() => setOpen(false)}
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
        <CardBase>
          <ListTable headers={mentorshipHeaders} rows={[]} />
        </CardBase>
      </Container>
    </div>
  );
};

export default MentorshipPage;