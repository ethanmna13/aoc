import { Button, CardBase, Container, FormControl, FullScreenModal, ListTable, PageTitle, Paragraph, SelectBox, TableHeader, TaskDialog } from "@freee_jp/vibes";
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

interface MainTask {
  id: number;
  name: string;
  description: string;
  deadline: string;
  users_id?: number;
  user_name?: string; 
  subTasks?: SubTask[];
}

interface SubTask {
  id?: number;
  name: string;
  description: string;
  deadline: string;
  main_tasks_id?: number;
  users_id?: number;
  user_name?: string;
  attachments?: File[];
}

interface AssignedMainTask {
  id: number;
  mentorships_id: number;
  mentorship_name: string;
  main_task_id: number;
  main_task_name: string;
  status: string;
}

interface AssignedSubTask {
  id: number;
  mentorships_id: number;
  mentorship_name: string;
  assigned_main_tasks_id: number;
  sub_task_id: number;
  sub_task_name: string;
  status: string;
  submissions?: File[];
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
  const [selectedMentorship, setSelectedMentorship] = useState<Mentorship | null>(null);
  const [isAssignOpen, setAssignOpen] = React.useState<boolean>(false);
  const [isEditOpen, setEditOpen] = React.useState<boolean>(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState<boolean>(false);
  const [createMentorship, setCreateMentorship] = useState<{ mentorID: number | null, menteeID: number | null }>({ mentorID: null, menteeID: null });
  const [editMentorship, setEditMentorship] = useState<{ id: number | null, mentorID: number | null, menteeID: number | null }>({ id: null, mentorID: null, menteeID: null });
  const [deleteMentorshipId, setDeleteMentorshipId] = useState<number | null>(null);
  const [unassignMainTask, setUnassignMainTask] = useState<AssignedMainTask | null>(null);
  const [unassignSubTask, setUnassignSubTask] = useState<AssignedSubTask | null>(null);
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [selectedMainTask, setSelectedMainTask] = useState<MainTask | null>(null);
  const [subTasks, setSubTasks] = useState<any[]>([]);
  const [viewMainTasksModalOpen, setViewMainTasksModalOpen] = useState<boolean>(false);
  const [viewSubTasksModalOpen, setViewSubTasksModalOpen] = useState<boolean>(false);
  const [selectedMentorshipId, setSelectedMentorshipId] = useState<number | null>(null);
  const [assignedMainTasks, setAssignedMainTasks] = useState<AssignedMainTask[]>([]);
  const [checkedMainTasks, setCheckedMainTasks] = useState<{ [key: number]: boolean }>({});
  const [assignedSubTasks, setAssignedSubTasks] = useState<AssignedSubTask[]>([]);
  const [selectedAssignedMainTaskId, setSelectedAssignedMainTaskId] = useState<number | null>(null);
  const [viewAssignedSubTasksModalOpen, setViewAssignedSubTasksModalOpen] = useState<boolean>(false);
  const [checkedSubTasks, setCheckedSubTasks] = useState<{ [key: number]: boolean }>({});
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
          fetchAssignedMainTasks(); 
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

  const fetchAssignedMainTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/assigned_main_tasks", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedMainTasks(response.data);
    } catch (err) {
      setError("Failed to fetch assigned main tasks");
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

  const fetchMainTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/main_tasks", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMainTasks(response.data);
    } catch (err) {
      setError("Failed to fetch main tasks");
    }
  };

  const fetchSubTasks = async (mainTaskId: number) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/admin/main_tasks/${mainTaskId}/sub_tasks`, {
        withCredentials: true,
        headers: {
        Authorization: `Bearer ${token}`
      }
    });
      setSubTasks(response.data);
    } catch (err) {
      setError("Failed to fetch sub tasks");
    }
  };
  
  const fetchAssignedSubTasks = async (assignedMainTaskId: number) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/assigned_sub_tasks?assigned_main_task_id=${assignedMainTaskId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedSubTasks(response.data);
    } catch (err) {
      setError("Failed to fetch assigned sub tasks");
    }
  };

  const handleUnassignMainTask = async () => {
    if (!unassignMainTask) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/assigned_main_tasks/${unassignMainTask.id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAssignedMainTasks();
    } catch (err) {
      setError("Failed to unassign main task");
    }
  };
  
  const handleUnassignSubTask = async () => {
    if (!unassignSubTask) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/assigned_sub_tasks/${unassignSubTask.id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAssignedSubTasks(selectedAssignedMainTaskId!);
    } catch (err) {
      setError("Failed to unassign sub task");
    }
  };

  const handleMainTaskCheckboxChange = (mainTaskId: number, isChecked: boolean) => {
    setCheckedMainTasks((prev) => ({ ...prev, [mainTaskId]: isChecked }));

    const mainTask = mainTasks.find((task) => task.id === mainTaskId);
    if (mainTask && mainTask.subTasks) {
      const newCheckedSubTasks = { ...checkedSubTasks };
      mainTask.subTasks.forEach((subTask) => {
        newCheckedSubTasks[subTask.id!] = isChecked;
      });
      setCheckedSubTasks(newCheckedSubTasks);
    }
  };

  const handleSubTaskCheckboxChange = (subTaskId: number, isChecked: boolean) => {
    setCheckedSubTasks((prev) => ({ ...prev, [subTaskId]: isChecked }));
  };

  const handleAssignTasks = async () => {
    if (!selectedMentorshipId) {
      setError("Please select a mentorship");
      return;
    }

    const selectedMainTaskIds = Object.keys(checkedMainTasks)
    .filter((key) => checkedMainTasks[Number(key)])
    .map((key) => Number(key));

    const selectedSubTaskIds = Object.keys(checkedSubTasks)
    .filter((key) => checkedSubTasks[Number(key)])
    .map((key) => Number(key));

    try {
      const assignedMainTasksResponse = await axios.post("http://localhost:3000/api/v1/assigned_main_tasks", 
      {
        mentorships_id: selectedMentorshipId,
        main_tasks_ids: selectedMainTaskIds
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });

      const assignedMainTasks = assignedMainTasksResponse.data.assigned_main_tasks;

      for (const assignedMainTask of assignedMainTasks) {
      await axios.post("http://localhost:3000/api/v1/assigned_sub_tasks", {
        mentorships_id: selectedMentorshipId,
        sub_task_ids: selectedSubTaskIds,
        assigned_main_task_id: assignedMainTask.id
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
    }

      setViewMainTasksModalOpen(false);
      fetchAssignedMainTasks();
    } catch (err) {
      setError("Failed to assign tasks");
    }
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
            <Button onClick={() => handleDeleteMentorship(mentorship.id)} danger small ml={0.5} mr={0.5}>Delete</Button>
            <Button
              onClick={() => {
                if (mentorship.id) {
                  setSelectedMentorship(mentorship)
                  setSelectedMentorshipId(mentorship.id);
                  fetchMainTasks();
                  setViewMainTasksModalOpen(true);
                } else {
                  console.error("Mentorship ID is undefined");
                }
              }}
              small
            >
              View Assigned Tasks
            </Button>
          </div>
        ),
        alignRight: true
      },
    ],
  }));

  const mainTaskRows = mainTasks.map((mainTask) => ({
    checked: checkedMainTasks[mainTask.id!] || false,
    onChangeCheckBox: (e: React.ChangeEvent<HTMLInputElement>) =>
      handleMainTaskCheckboxChange(mainTask.id!, e.target.checked),
    cells: [
      { value: mainTask.id },
      { value: mainTask.name },
      { value: mainTask.description },
      { value: mainTask.deadline },
      { value: mainTask.user_name || "Unknown" },
      {
        value: (
          <Button
            onClick={() => {
              if (mainTask.id) {
                setSelectedMainTask(mainTask);
                fetchSubTasks(mainTask.id);
                setViewSubTasksModalOpen(true);
              }
            }}
            small
          >
            View Sub Tasks
          </Button>
        ),
        alignRight: true,
      },
    ],
  }));

  const subTaskRows = subTasks.map((subTask) => ({
    checked: checkedSubTasks[subTask.id!] || false,
    onChangeCheckBox: (e: React.ChangeEvent<HTMLInputElement>) =>
      handleSubTaskCheckboxChange(subTask.id!, e.target.checked),
    cells: [
      { value: subTask.name },
      { value: subTask.description },
      { value: subTask.deadline },
      { value: subTask.user_name || "Unknown" },
      {
        value: (
          <div>
            {subTask.attachments?.map((attachment: any, index: number) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {attachment.filename}
              </a>
            ))}
          </div>
        ),
      },
    ],
  }));

  const assignedMainTaskRows = assignedMainTasks.map(task => ({
    cells: [
      { value: task.id },
      { value: task.mentorship_name },
      { value: task.main_task_name },
      { value: task.status },
      {
        value: (
          <div>
            <Button onClick={() => setUnassignMainTask(task)} small danger mr={0.5}>Unassign</Button>
            <Button
              onClick={() => {
                setSelectedAssignedMainTaskId(task.id);
                fetchAssignedSubTasks(task.id);
                setViewAssignedSubTasksModalOpen(true);
              }}
              small
            >
              View Assigned Sub Tasks
            </Button>
          </div>
        ),
        alignRight: true
      }
    ],
  }));
  
  const assignedSubTaskRows = assignedSubTasks.map(task => ({
    cells: [
      { value: task.id },
      { value: task.sub_task_name },
      { value: task.mentorship_name},
      { value: task.status },
      {
        value: (
          <div>
            {task.submissions?.map((attachment: any, index: number) => (
              <a
                key={index}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {attachment.filename}
              </a>
            ))}
          </div>
        ),
      },
      {
        value: (
          <div>
            <Button onClick={() => setUnassignSubTask(task)} small danger mr={0.5}>Unassign</Button>
          </div>
        ),
        alignRight: true
      }
    ],
  }));

  return (
    <div>
      {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
      <Container>
        <PageTitle mt={1} >Mentorships</PageTitle>
        <Button onClick={handleAssignClick} mt={0.5} mb={1} appearance="primary">Assign a Mentorship</Button>
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
        <PageTitle mt={1} >Assigned Tasks</PageTitle>
        <CardBase>
        <ListTable
          headers={[
            { value: 'ID' },
            { value: 'Mentorship Name' },
            { value: 'Task Name' },
            { value: 'Status' },
            { value: 'Actions', alignRight: true }
          ]}
          rows={assignedMainTaskRows}
        />
      </CardBase>
      </Container>

      {/* View Main Tasks Modal */}
      {viewMainTasksModalOpen && (
        <FullScreenModal
        isOpen={viewMainTasksModalOpen}
        title={`${selectedMentorship?.mentor_name} & ${selectedMentorship?.mentee_name}'s Tasks`}
        onRequestClose={() => setViewMainTasksModalOpen(false)}
        >
          <CardBase ma={1}>
            <PageTitle>Main Tasks</PageTitle>
            {mainTasks.length === 0 ? (
              <Paragraph>No main tasks available.</Paragraph>
            ) : (
              <ListTable
              withCheckBox
                headers={[
                  { value: 'ID' },
                  { value: 'Name' },
                  { value: 'Description' },
                  { value: 'Deadline' },
                  { value: 'Created By' },
                  { value: 'Actions', alignRight: true}
                ]}
                rows={mainTaskRows}
              />
            )}
          </CardBase>
          <Button onClick={() => setViewMainTasksModalOpen(false)} ma={0.5}>Cancel</Button>
          <Button onClick={handleAssignTasks} appearance="primary" ma={0.5}>Assign</Button>
        </FullScreenModal>
      )}

      {/* View Sub Tasks Modal */}
      {viewSubTasksModalOpen && (
        <FullScreenModal
        isOpen={viewSubTasksModalOpen}
        title={`Sub Tasks for ${selectedMainTask?.name}`}
        onRequestClose={() => setViewSubTasksModalOpen(false)}
        >
          <CardBase ma={1}>
            {subTasks.length === 0 ? (
              <Paragraph>No sub-tasks available.</Paragraph>
            ) : (
              <ListTable withCheckBox={true}
                headers={[
                  { value: 'Name' },
                  { value: 'Description' },
                  { value: 'Deadline' },
                  { value: 'Created By' },
                  { value: 'Attachments' }
                ]}
                rows={subTaskRows}
              />
            )}
          </CardBase>
          <Button onClick={() => setViewSubTasksModalOpen(false)} ma={0.5}>Close</Button>
        </FullScreenModal>
      )}

      {viewAssignedSubTasksModalOpen && (
        <FullScreenModal
          isOpen={viewAssignedSubTasksModalOpen}
          title={`Assigned Sub Tasks`}
          onRequestClose={() => setViewAssignedSubTasksModalOpen(false)}
        >
          <CardBase ma={1}>
            <PageTitle>Assigned Sub Tasks</PageTitle>
            {assignedSubTasks.length === 0 ? (
              <Paragraph>No sub-tasks assigned.</Paragraph>
            ) : (
              <ListTable
                headers={[
                  { value: 'ID' },
                  { value: 'Name' },
                  { value: 'Mentorship' },
                  { value: 'Status' },
                  { value: 'Submissions' },
                  { value: 'Actions', alignRight: true }
                ]}
                rows={assignedSubTaskRows}
              />
            )}
          </CardBase>
          <Button onClick={() => setViewAssignedSubTasksModalOpen(false)} ma={0.5}>Close</Button>
        </FullScreenModal>
      )}

      {unassignMainTask && (
              <TaskDialog
                id="delete-user-dialog"
                isOpen={Boolean(unassignMainTask)}
                title="Confirm Delete"
                onRequestClose={() => setUnassignMainTask(null)}
                closeButtonLabel="Cancel"
                primaryButtonLabel="Delete"
                danger={true}
                onPrimaryAction={handleUnassignMainTask}
                shouldCloseOnOverlayClickOrEsc={false}
                mobileButtonLayout="column"
              >
                <Paragraph>Are you sure you want to unassign {unassignMainTask.main_task_name} from {unassignMainTask.mentorship_name}?</Paragraph>
              </TaskDialog>
      )}

      {unassignSubTask && (
              <TaskDialog
                id="delete-user-dialog"
                isOpen={Boolean(unassignSubTask)}
                title="Confirm Delete"
                onRequestClose={() => setUnassignSubTask(null)}
                closeButtonLabel="Cancel"
                primaryButtonLabel="Delete"
                danger={true}
                onPrimaryAction={handleUnassignSubTask}
                shouldCloseOnOverlayClickOrEsc={false}
                mobileButtonLayout="column"
              >
                <Paragraph>Are you sure you want to unassign {unassignSubTask.sub_task_name} from {unassignSubTask.mentorship_name}?</Paragraph>
              </TaskDialog>
      )}


    </div>
  );
};

export default MentorshipPage;