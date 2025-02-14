import { ListTable, PageTitle, TableHeader, Text, Button, Paragraph, TextField, TextArea, FullScreenModal, FormControl, Container, CardBase } from "@freee_jp/vibes";
import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../navigation/NavBar";
import { useNavigate } from "react-router-dom";

const headers: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Name', ordering: 'asc' },
  { value: 'Description' },
  { value: 'Deadline' },
  { value: 'Created By' },
  { value: 'Actions', alignRight: true }
];

interface MainTask {
  id?: number;
  name: string;
  description: string;
  deadline: string;
  users_id: number;
  user_name?: string; 
}

const AdminMainTasks = () => {
  const [subTasks, setSubTasks] = useState<any[]>([]);
  const [viewSubTasksModalOpen, setViewSubTasksModalOpen] = useState<boolean>(false);
  const [selectedMainTask, setSelectedMainTask] = useState<MainTask | null>(null);
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [error, setError] = useState<string>("");
  const [editTask, setEditTask] = useState<MainTask | null>(null);
  const [deleteTask, setDeleteTask] = useState<MainTask | null>(null);
  const [createTask, setCreateTask] = useState<MainTask | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; id: number } | null>(null);
  const [editSubTask, setEditSubTask] = useState<any | null>(null);
  const [deleteSubTask, setDeleteSubTask] = useState<any | null>(null);
  const [createSubTask, setCreateSubTask] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("No token found, please log in again");
        navigate('/users/sign_in');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user) {
        setCurrentUser({
          name: user.name,
          role: user.role,
          id: user.id, 
        });
      }

      fetchMainTasks();
    };

    fetchCurrentUser();
  }, [navigate]);

  const fetchSubTasks = async (mainTaskId: number) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/admin/main_tasks/${mainTaskId}/sub_tasks`, { withCredentials: true });
      setSubTasks(response.data);
    } catch (err) {
      setError("Failed to fetch sub tasks");
    }
  };

  const fetchMainTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/main_tasks", {
        withCredentials: true,
      });
      setMainTasks(response.data);
    } catch (err) {
      setError("Failed to fetch main tasks");
    }
  };

  const handleCreate = async () => {
    if (!createTask || !currentUser) return;
    try {
      const taskWithUserId = { ...createTask, users_id: currentUser.id };
      await axios.post("http://localhost:3000/api/v1/admin/main_tasks", taskWithUserId, { withCredentials: true });
      fetchMainTasks();
      setCreateTask(null);
    } catch (err) {
      setError("Failed to create main task");
    }
  };

  const handleUpdate = async () => {
    if (!editTask) return;
    try {
      await axios.put(`http://localhost:3000/api/v1/admin/main_tasks/${editTask.id}`, editTask, {
        withCredentials: true,
      });
      fetchMainTasks();
      setEditTask(null);
    } catch (err) {
      setError("Failed to update main task");
    }
  };

  const handleDelete = async () => {
    if (!deleteTask) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/admin/main_tasks/${deleteTask.id}`, {
        withCredentials: true,
      });
      fetchMainTasks();
      setDeleteTask(null);
    } catch (err) {
      setError("Failed to delete main task");
    }
  };

  const handleCreateSubTask = async () => {
    if (!createSubTask || !selectedMainTask?.id || !currentUser) return;
    try {
      const subTaskWithUserId = { ...createSubTask, users_id: currentUser.id };
      await axios.post(
        `http://localhost:3000/api/v1/admin/main_tasks/${selectedMainTask.id}/sub_tasks`,
        subTaskWithUserId,
        { withCredentials: true }
      );
      fetchSubTasks(selectedMainTask.id);
      setCreateSubTask(null);
    } catch (err) {
      setError("Failed to create sub task");
    }
  };

  const handleUpdateSubTask = async () => {
    if (!editSubTask || !selectedMainTask?.id || !editSubTask.id) return;
    try {
      await axios.put(
        `http://localhost:3000/api/v1/admin/main_tasks/${selectedMainTask.id}/sub_tasks/${editSubTask.id}`,
        editSubTask,
        { withCredentials: true }
      );
      fetchSubTasks(selectedMainTask.id);
      setEditSubTask(null);
    } catch (err) {
      setError("Failed to update sub task");
    }
  };

  const handleDeleteSubTask = async () => {
    if (!deleteSubTask || !selectedMainTask?.id || !deleteSubTask.id) return;
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/admin/main_tasks/${selectedMainTask.id}/sub_tasks/${deleteSubTask.id}`,
        { withCredentials: true }
      );
      fetchSubTasks(selectedMainTask.id);
      setDeleteSubTask(null);
    } catch (err) {
      setError("Failed to delete sub task");
    }
  };

  const taskRows = mainTasks.map(task => ({
    cells: [
      { value: task.id },
      { value: task.name },
      { value: task.description },
      { value: task.deadline },
      { value: task.user_name || "Unknown" }, 
      {
        value: (
          <div className="flex space-x-2">
            <Button onClick={() => setEditTask(task)} small mr={0.5} appearance="primary"> Edit </Button>
            <Button onClick={() => setDeleteTask(task)} small danger mr={0.5}> Delete </Button>
            <Button
              onClick={() => {
                if (task.id) {
                  setSelectedMainTask(task);
                  fetchSubTasks(task.id);
                  setViewSubTasksModalOpen(true);
                } else {
                  console.error("Task ID is undefined");
                }
              }}
              small
            >
              View Sub Tasks
            </Button>
          </div>
        ),
        alignRight: true
      }
    ],
  }));

  return (
    <div>
      <NavBar name={currentUser?.name || "Admin Name"} role={currentUser?.role || "admin"} />
      <Container>
      <PageTitle mt={1}>Manage Onboarding Checklists</PageTitle>
      <Button onClick={() => setCreateTask({ name: "", description: "", deadline: "", users_id: 0 })} mt={0.5} mb={1} appearance="primary"> Create Task </Button>
      {error && <Text>{error}</Text>}
      <CardBase>
      <ListTable headers={headers} rows={taskRows}></ListTable>
      </CardBase>

      {/* Create Task Modal */}
      {createTask && (
        <FullScreenModal isOpen={Boolean(createTask)} title="Create Main Task" onRequestClose={() => setCreateTask(null)}>
          <FormControl label="Name" fieldId="name">
            <TextField
              type="text"
              value={createTask.name}
              onChange={(e) =>
                setCreateTask({ ...createTask, name: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Description" fieldId="description">
            <TextArea
              value={createTask.description}
              onChange={(e) =>
                setCreateTask({ ...createTask, description: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Deadline" fieldId="deadline">
            <input
              type="datetime-local"
              value={createTask.deadline}
              onChange={(e) =>
                setCreateTask({ ...createTask, deadline: e.target.value })
              }
              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </FormControl>
          <div className="flex gap-2">
            <Button onClick={handleCreate} mr={1} mt={1} appearance="primary"> Create </Button>
            <Button onClick={() => setCreateTask(null)} danger mt={1}> Cancel </Button>
          </div>
        </FullScreenModal>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <FullScreenModal isOpen={Boolean(editTask)} title="Edit Main Task" onRequestClose={() => setEditTask(null)}>
          <FormControl label="Name" fieldId="edit-name">
            <TextField
              type="text"
              value={editTask.name}
              onChange={(e) =>
                setEditTask({ ...editTask, name: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Description" fieldId="edit-description">
            <TextArea
              value={editTask.description}
              onChange={(e) =>
                setEditTask({ ...editTask, description: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Deadline" fieldId="edit-deadline">
            <input
              type="datetime-local"
              value={editTask.deadline}
              onChange={(e) =>
                setEditTask({ ...editTask, deadline: e.target.value })
              }
              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </FormControl>
          <div className="flex gap-2">
            <Button onClick={handleUpdate} mr={1} mt={1} appearance="primary"> Save </Button>
            <Button onClick={() => setEditTask(null)} danger mt={1}> Cancel </Button>
          </div>
        </FullScreenModal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTask && (
        <FullScreenModal isOpen={Boolean(deleteTask)} title="Confirm Delete" onRequestClose={() => setDeleteTask(null)}>
          <Paragraph>Are you sure you want to delete {deleteTask.name}?</Paragraph>
          <div className="flex gap-2">
            <Button onClick={handleDelete} danger mr={1} mt={0.5}> Delete </Button>
            <Button onClick={() => setDeleteTask(null)} appearance="primary" mt={0.5}> Cancel </Button>
          </div>
        </FullScreenModal>
      )}

      {/* View Sub Tasks Modal */}
      {viewSubTasksModalOpen && (
        <FullScreenModal isOpen={viewSubTasksModalOpen} title={`Sub Tasks for ${selectedMainTask?.name}`} onRequestClose={() => setViewSubTasksModalOpen(false)}>
          <Button onClick={() => setCreateSubTask({ name: "", description: "", duration: "" })} ma={0.5} appearance="primary"> Create Sub Task </Button>
          <CardBase ma={1}>
          {subTasks.length === 0 ? (
            <Paragraph>No sub-tasks available.</Paragraph>
          ) : (
            <ListTable
              headers={[
                { value: 'Name' },
                { value: 'Description' },
                { value: 'Duration' },
                { value: 'Created By' }, // Added "Created By" column
                { value: 'Actions', alignRight: true },
              ]}
              rows={subTasks.map(subTask => ({
                cells: [
                  { value: subTask.name },
                  { value: subTask.description },
                  { value: subTask.duration },
                  { value: subTask.user_name || "Unknown" }, // Display the creator's name
                  {
                    value: (
                      <div className="flex space-x-2">
                        <Button onClick={() => setEditSubTask(subTask)} small mr={0.5} appearance="primary"> Edit </Button>
                        <Button onClick={() => setDeleteSubTask(subTask)} small danger> Delete </Button>
                      </div>
                    ),
                    alignRight: true
                  }
                ],
              }))}
            />
          )}
          </CardBase>
          <Button onClick={() => setViewSubTasksModalOpen(false)} ma={0.5}>Close</Button>
        </FullScreenModal>
      )}

      {/* Create Sub Task Modal */}
      {createSubTask && (
        <FullScreenModal isOpen={Boolean(createSubTask)} title="Create Sub Task" onRequestClose={() => setCreateSubTask(null)}>
          <FormControl label="Name" fieldId="sub-task-name">
            <TextField
              type="text"
              value={createSubTask.name}
              onChange={(e) =>
                setCreateSubTask({ ...createSubTask, name: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Description" fieldId="sub-task-description">
            <TextArea
              value={createSubTask.description}
              onChange={(e) =>
                setCreateSubTask({ ...createSubTask, description: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Duration" fieldId="sub-task-duration">
            <input
              type="datetime-local"
              value={createSubTask.duration}
              onChange={(e) =>
                setCreateSubTask({ ...createSubTask, duration: e.target.value })
              }
              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </FormControl>
          <div className="flex gap-2">
            <Button onClick={handleCreateSubTask} mr={0.5} mt={1} appearance="primary"> Create </Button>
            <Button onClick={() => setCreateSubTask(null)} mt={1} danger> Cancel </Button>
          </div>
        </FullScreenModal>
      )}

      {/* Edit Sub Task Modal */}
      {editSubTask && (
        <FullScreenModal isOpen={Boolean(editSubTask)} title="Edit Sub Task" onRequestClose={() => setEditSubTask(null)}>
          <FormControl label="Name" fieldId="edit-sub-task-name">
            <TextField
              type="text"
              value={editSubTask.name}
              onChange={(e) =>
                setEditSubTask({ ...editSubTask, name: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Description" fieldId="edit-sub-task-description">
            <TextArea
              value={editSubTask.description}
              onChange={(e) =>
                setEditSubTask({ ...editSubTask, description: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Duration" fieldId="edit-sub-task-duration">
            <input
              type="datetime-local"
              value={editSubTask.duration}
              onChange={(e) =>
                setEditSubTask({ ...editSubTask, duration: e.target.value })
              }
              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </FormControl>
          <div className="flex gap-2">
            <Button onClick={handleUpdateSubTask} mr={0.5} mt={1} appearance="primary"> Save </Button>
            <Button onClick={() => setEditSubTask(null)} mt={1} danger> Cancel </Button>
          </div>
        </FullScreenModal>
      )}

      {/* Delete Sub Task Confirmation Modal */}
      {deleteSubTask && (
        <FullScreenModal isOpen={Boolean(deleteSubTask)} title="Confirm Delete" onRequestClose={() => setDeleteSubTask(null)}>
          <Paragraph>Are you sure you want to delete {deleteSubTask.name}?</Paragraph>
          <div className="flex gap-2">
            <Button onClick={handleDeleteSubTask} mt={1} mr={1} danger> Delete </Button>
            <Button onClick={() => setDeleteSubTask(null)} mt={1} appearance="primary"> Cancel </Button>
          </div>
        </FullScreenModal>
      )}
      </Container>
    </div>
  );
};

export default AdminMainTasks;