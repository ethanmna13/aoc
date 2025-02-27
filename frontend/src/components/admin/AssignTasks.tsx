/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, FloatingMessageBlock, FormControl, FullScreenModal, ListTable, Message, Pager, PageTitle, Paragraph, SearchField, SelectBox, Stack, StatusIcon, TableHeader, TaskDialog } from "@freee_jp/vibes";
import NavBar from "../navigation/NavBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";
import { jwtDecode } from "jwt-decode";
import { Plus, Trash } from "lucide-react";

interface Mentees {
  id?: number;
  name: string;
  email: string;
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
  attachments?: Attachment[];
}

interface AssignedMainTask {
  id: number;
  mentorships_id: number;
  mentor_name: string,
  mentee_name: string,
  mentorship_name: string;
  main_task_id: number;
  main_task_name: string;
  status: string;
  submissions?: Attachment[];
}

interface AssignedSubTask {
  id: number;
  mentorships_id: number;
  mentor_name: string,
  mentee_name: string,
  mentorship_name: string;
  assigned_main_tasks_id: number;
  sub_task_id: number;
  sub_task_name: string;
  status: string;
  submissions?: Attachment[];
}

interface CustomJwtPayload {
  id: number;
  name: string;
  role: string;
}

interface Attachment {
  url: string;
  filename: string;
}

const assignedMainTaskHeaders: TableHeader[] = [
    { value: 'ID' },
    { value: 'Mentee' },
    { value: 'Mentor' },
    { value: 'Onboarding Checklist' },
    { value: 'Status', alignCenter: true },
    { value: 'Submissions', alignCenter: true },
    { value: '', alignRight: true }
];

const assignedSubTaskHeaders: TableHeader[] = [
    { value: 'ID' },
    { value: 'Mentee' },
    { value: 'Mentor' },
    { value: 'Title' },
    { value: 'Status', alignCenter: true },
    { value: 'Submissions', alignCenter: true }
];

const AssignTasksPage = () => {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; id: number } | null>(null);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();
  const [mentees, setMentees] = useState<Mentees[]>([]);
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [selectedMainTask, setSelectedMainTask] = useState<MainTask | null>(null);
  const [selectedMentee, setSelectedMentee] = useState<Mentees | null>(null);
  const [isAssignOpen, setAssignOpen] = React.useState<boolean>(false);
  const [assignedMainTasks, setAssignedMainTasks] = useState<AssignedMainTask[]>([]);
  const [selectedAssignedMainTask, setSelectedAssignedMainTask] = useState<AssignedMainTask | null>(null);
  const [assignedSubTasks, setAssignedSubTasks] = useState<AssignedSubTask[]>([]);
  const [viewAssignedSubTasksModalOpen, setViewAssignedSubTasksModalOpen] = useState<boolean>(false);
  const [unassignMainTask, setUnassignMainTask] = useState<AssignedMainTask | null>(null);
  const [searchName, setSearchName] = useState<string>("");
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
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
          fetchMentees();
          fetchMainTasks();
          fetchAssignedMainTasks(searchName, searchTitle, statusFilter, currentPage);;
        }
      } catch {
        setError("Invalid token");
        navigate('/sign_in');
      }
    };
    fetchCurrentUser();
  }, [navigate]);

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

  const fetchMainTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/main_tasks", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      const mainTasksWithSubTasks = await Promise.all(
        response.data.main_tasks.map(async (mainTask: MainTask) => {
          const subTasksResponse = await axios.get(
            `http://localhost:3000/api/v1/admin/main_tasks/${mainTask.id}/sub_tasks`,
            {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return { ...mainTask, subTasks: subTasksResponse.data };
        })
      );
      setMainTasks(mainTasksWithSubTasks);
    } catch {
      setError("Failed to fetch main tasks");
    }
  };

  const handleSearchName = (value: string) => {
    setSearchName(value);
    fetchAssignedMainTasks(value, searchTitle, statusFilter, currentPage);
  };
  
  const handleSearchTitle = (value: string) => {
    setSearchTitle(value);
    fetchAssignedMainTasks(searchName, value, statusFilter, currentPage);
  };
  
  const handleFilter = (value: string) => {
    setStatusFilter(value);
    fetchAssignedMainTasks(searchName, searchTitle, value, currentPage);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAssignedMainTasks(searchName, searchTitle, statusFilter, page);
  };

  const fetchAssignedMainTasks = async (name: string, title: string, status: string, page: number) => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/assigned_main_tasks", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: {
            mentorship_mentor_name_or_mentorship_mentee_name_cont: name,
            main_task_name_cont: title,
            status_eq: status === "all" ? undefined : status,
          },
          page: page,
          per_page: 10,
        },
      });
      setAssignedMainTasks(response.data.assigned_main_tasks);
      setTotalPages(response.data.total_pages);
    } catch {
      setError("Failed to fetch assigned main tasks");
    }
  };

  const fetchAssignedSubTasks = async (assignedMainTaskId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/assigned_main_tasks/${assignedMainTaskId}/assigned_sub_tasks`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssignedSubTasks(response.data);
    } catch {
      setError("Failed to fetch assigned sub-tasks");
    }
  };

  const handleAssignTasks = async () => {
    setIsFormSubmitted(true);
    if (!selectedMainTask || !selectedMentee) {
      setError("Please select both a main task and a mentee");
      return;
    }

    try {
      const mentorshipsResponse = await axios.get(
        `http://localhost:3000/api/v1/mentorships?mentee_id=${selectedMentee.id}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mentorships = mentorshipsResponse.data.mentorships;

      if (mentorships.length === 0) {
        setError("No mentorships found for the selected mentee");
        return;
      }

      const mentorshipsIds = mentorships.map((mentorship: any) => mentorship.id);

      const assignedMainTasksResponse = await axios.post(
        "http://localhost:3000/api/v1/assigned_main_tasks",
        {
          mentorships_id: mentorshipsIds,
          main_tasks_ids: [selectedMainTask.id],
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const assignedMainTasks = assignedMainTasksResponse.data.assigned_main_tasks;

      if (selectedMainTask.subTasks && selectedMainTask.subTasks.length > 0) {
        console.log("Sub-tasks to assign:", selectedMainTask.subTasks);
        for (const assignedMainTask of assignedMainTasks) {
          await axios.post(
            `http://localhost:3000/api/v1/assigned_main_tasks/${assignedMainTask.id}/assigned_sub_tasks`,
            {
              mentorships_id: assignedMainTask.mentorships_id,
              sub_task_ids: selectedMainTask.subTasks.map((subTask) => subTask.id!),
              assigned_main_task_id: assignedMainTask.id,
            },
            {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      }

      setAssignOpen(false);
      fetchAssignedMainTasks(searchName, searchTitle, statusFilter, currentPage);
      setSuccessMessage(`Tasks assigned successfully to ${selectedMentee.name}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error assigning tasks:", error);
      setError("Failed to assign tasks");
    }
  };

  const handleUnassignMainTask = async () => {
    if (!unassignMainTask) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/assigned_main_tasks/${unassignMainTask.id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAssignedMainTasks(searchName, searchTitle, statusFilter, currentPage);
      setSuccessMessage(`${unassignMainTask.main_task_name} successfully unassigned from ${unassignMainTask.mentee_name}.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setUnassignMainTask(null);
    } catch {
      setError("Failed to unassign main task");
    }
  };

  const assignedMainTaskRows = assignedMainTasks.map(task => ({
    cells: [
      { value: task.id },
      { value: task.mentee_name },
      { value: task.mentor_name },
      { value: task.main_task_name },
      {
        value: (
          <div>
            {task.status.toString() === "in_progress" ? (
              <StatusIcon mt={0.5} ml={1} type="progress" marginRight marginBottom>
                In Progress
              </StatusIcon>
            ) : task.status.toString() === "not_started" ? (
              <StatusIcon mt={0.5} ml={1} type="done" marginRight marginBottom>
                Not Started
              </StatusIcon>
            ) : (
              <StatusIcon ma={0.5} type="emphasis" marginRight marginBottom>
                Completed
              </StatusIcon>
            )}
          </div>
        ),
        alignCenter: true
      },
      {
        value: (
          <div>
            {task.submissions?.map((attachment: Attachment, index: number) => (
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
        alignCenter: true
      },
      {
        value: (
          <div>
            <Button
              onClick={() => {
                setSelectedAssignedMainTask(task);
                fetchAssignedSubTasks(task.id);
                setViewAssignedSubTasksModalOpen(true);
              }}
              small
            >
              View Sub Tasks
            </Button>
            <Button IconComponent={Trash} onClick={() => setUnassignMainTask(task)} small danger mr={0.5} appearance="tertiary">Unassign</Button>
          </div>
        ),
        alignRight: true
      }
    ],
  }));

  const assignedSubTaskRows = assignedSubTasks.map(task => ({
    cells: [
      { value: task.id },
      { value: task.mentee_name },
      { value: task.mentor_name },
      { value: task.sub_task_name},
      {
        value: (
          <div>
            {task.status.toString() === "in_progress" ? (
              <StatusIcon mt={0.5} ml={1} type="progress" marginRight marginBottom>
                In Progress
              </StatusIcon>
            ) : 
              task.status.toString() === "not_started" ? (
                <StatusIcon mt={0.5} ml={1} type="done" marginRight marginBottom>
                  Not Started
                </StatusIcon>
              ) : (
              <StatusIcon ma={0.5} type="emphasis" marginRight marginBottom>
                Completed
              </StatusIcon>
            )}
          </div>
        ),
        alignCenter: true
      },
      {
        value: (
          <div>
            {task.submissions?.map((attachment: Attachment, index: number) => (
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
      }
    ],
  }));

  return (
    <div>
      {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
      <PageTitle mt={1} ml={1}>Assign Tasks</PageTitle>
      <Button IconComponent={Plus} onClick={() => setAssignOpen(true)} mt={0.5} mb={1} ml={1}>Assign Tasks</Button>
      <Stack direction="horizontal">
      <FormControl mb={0.5} ml={1} label={"Mentor/Mentee"}>
        <SearchField
            id="search"
            label="Search"
            placeholder="Search by Mentor/Mentee"
            name="search"
            width="medium"
            value={searchName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchName(e.target.value)}
        />
        </FormControl>
        <FormControl mb={0.5} ml={1} label={"Onboarding Checklist"}>
        <SearchField
            id="search"
            label="Search"
            placeholder="Search by Onboarding Checklist"
            name="search"
            width="medium"
            value={searchTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchTitle(e.target.value)}
        />
        </FormControl>
        <FormControl mb={0.5} ml={1} label={"Status"}>
        <SelectBox
            id="status-filter"
            label="Filter by Status"
            options={[
            { name: 'All', value: 'all' },
            { name: 'In Progress', value: 'in_progress' },
            { name: 'Completed', value: 'completed' }
            ]}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilter(e.target.value)}
            width="medium"
        />
        </FormControl>
        </Stack>
      {error && (<FloatingMessageBlock error>{error}</FloatingMessageBlock>)}
      {successMessage && (<FloatingMessageBlock success>{successMessage}</FloatingMessageBlock>)}
      <TaskDialog
        id="assign-tasks"
        isOpen={isAssignOpen}
        title="Assign Tasks"
        onRequestClose={() => {
          setIsFormSubmitted(false);
          setAssignOpen(false)
        }}
        closeButtonLabel="Close"
        primaryButtonLabel="Save"
        onPrimaryAction={handleAssignTasks}
        shouldCloseOnOverlayClickOrEsc
      >
        <FormControl label="Select an Onboarding Checklist" fieldId="selectBox-1" required>
          <SelectBox width="full"
            id="selectBox-1"
            name="mainTask"
            error={isFormSubmitted && !selectedMainTask?.id}
            options={[
              { name: "Choose a Checklist", value: "" },
              ...mainTasks.map(mainTask => ({
              name: mainTask.name,
              value: mainTask.id?.toString()
            }))
          ]}
            onChange={e => setSelectedMainTask(mainTasks.find(mainTask => mainTask.id === Number(e.target.value)) || null)}
          />
          {isFormSubmitted && !selectedMainTask?.id && <Message mt={1} error>No Checklist selected</Message>}
        </FormControl>
        <FormControl label="Select a Mentee" fieldId="selectBox-2" required>
          <SelectBox width="full"
            id="selectBox-2"
            name="mentee"
            error={isFormSubmitted && !selectedMentee}
            options={[
              { name: "Choose a mentee", value: "" },
              ...mentees.map(mentee => ({
              name: mentee.name,
              value: mentee.id?.toString()
            }))
          ]}
            onChange={e => setSelectedMentee(mentees.find(mentee => mentee.id === Number(e.target.value)) || null)}
          />
          {isFormSubmitted && !selectedMentee && <Message mt={1} error>No Mentee selected</Message>}
        </FormControl>
      </TaskDialog>
      <ListTable
        headers={assignedMainTaskHeaders}
        rows={assignedMainTaskRows}
        ma={1}
      />
      <Pager
        currentPage={currentPage}
        pageCount={totalPages}
        onPageChange={handlePageChange}
        mt={1}
        ml={1}
        />
      {selectedAssignedMainTask && (
        <FullScreenModal
          isOpen={viewAssignedSubTasksModalOpen}
          title={`Assigned Sub Tasks for ${selectedAssignedMainTask.main_task_name}`}
          onRequestClose={() => setViewAssignedSubTasksModalOpen(false)}
        >
          <PageTitle>Assigned Sub Tasks</PageTitle>
          {assignedSubTasks.length === 0 ? (
            <Paragraph>No sub-tasks assigned.</Paragraph>
          ) : (
            <ListTable
              headers={assignedSubTaskHeaders}
              rows={assignedSubTaskRows}
              ma={1}
            />
          )}
          <Button onClick={() => setViewAssignedSubTasksModalOpen(false)} ma={0.5}>Close</Button>
        </FullScreenModal>
      )}

    {unassignMainTask && (
        <TaskDialog
        id="delete-user-dialog"
        isOpen={Boolean(unassignMainTask)}
        title="Are you sure you want to delete this assignment?"
        onRequestClose={() => setUnassignMainTask(null)}
        closeButtonLabel="Cancel"
        primaryButtonLabel="Delete"
        danger={true}
        onPrimaryAction={handleUnassignMainTask}
        shouldCloseOnOverlayClickOrEsc={false}
        mobileButtonLayout="column"
        >
        <Paragraph textAlign="center">Mentee Name: {unassignMainTask.mentee_name}</Paragraph>
        <Paragraph textAlign="center">Main Task Name: {unassignMainTask.main_task_name}</Paragraph>
        </TaskDialog>
    )}
    </div>
  );
};

export default AssignTasksPage;