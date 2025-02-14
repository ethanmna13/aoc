import { ListTable, PageTitle, TableHeader, Text, Button, FormControlLabel, Paragraph, TextField, TextArea } from "@freee_jp/vibes";
import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../navigation/NavBar";

const headers: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Name', ordering: 'asc' },
  { value: 'Description' },
  { value: 'Deadline' },
  { value: 'Actions', alignRight: true }
];

interface MainTask {
  id?: number;
  name: string;
  description: string;
  deadline: string;
  users_id: number;
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
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);
  const [editSubTask, setEditSubTask] = useState<any | null>(null);
  const [deleteSubTask, setDeleteSubTask] = useState<any | null>(null);
  const [createSubTask, setCreateSubTask] = useState<any | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      setCurrentUser({
        name: user.name,
        role: user.role,
      });
    }
    fetchMainTasks();
  }, []);

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
    if (!createTask) return;
    try {
      await axios.post("http://localhost:3000/api/v1/admin/main_tasks", createTask, { withCredentials: true });
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
    if (!createSubTask || !selectedMainTask?.id) return; 
    try {
      await axios.post(
        `http://localhost:3000/api/v1/admin/main_tasks/${selectedMainTask.id}/sub_tasks`,
        createSubTask,
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
      {
        value: (
          <div className="flex space-x-2">
            <Button onClick={() => setEditTask(task)} small> Edit </Button>
            <Button onClick={() => setDeleteTask(task)} small danger> Delete </Button>
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

      <PageTitle>Admin - Manage Onboarding Checklists</PageTitle>
      <Button onClick={() => setCreateTask({ name: "", description: "", deadline: "", users_id: 0 })}> Create Task </Button>
      {error && <Text>{error}</Text>}
      <ListTable headers={headers} rows={taskRows}></ListTable>

      {/* Create Task Modal */}
      {createTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <PageTitle>Create Main Task</PageTitle>
            <div className="mb-4">
              <FormControlLabel>Name</FormControlLabel>
              <TextField
                type="text"
                value={createTask.name}
                onChange={(e) =>
                  setCreateTask({ ...createTask, name: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <FormControlLabel>Description</FormControlLabel>
              <TextArea
                value={createTask.description}
                onChange={(e) =>
                  setCreateTask({ ...createTask, description: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <FormControlLabel>Duration</FormControlLabel>
              <input
                type="datetime-local"
                value={createTask.deadline}
                onChange={(e) =>
                  setCreateTask({ ...createTask, deadline: e.target.value })
                }
                className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
              >
                Create
              </Button>
              <Button
                onClick={() => setCreateTask(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <PageTitle>Edit Main Task</PageTitle>
            <div className="mb-4">
              <FormControlLabel>Name</FormControlLabel>
              <TextField
                type="text"
                value={editTask.name}
                onChange={(e) =>
                  setEditTask({ ...editTask, name: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <FormControlLabel>Description</FormControlLabel>
              <TextField
                type="text"
                value={editTask.description}
                onChange={(e) =>
                  setEditTask({ ...editTask, description: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <FormControlLabel>Duration</FormControlLabel>
              <input
                type="datetime-local"
                value={editTask.deadline}
                onChange={(e) =>
                  setEditTask({ ...editTask, deadline: e.target.value })
                }
                className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
              >
                Save
              </Button>
              <Button
                onClick={() => setEditTask(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <PageTitle>Confirm Delete</PageTitle>
            <Paragraph>Are you sure you want to delete {deleteTask.name}?</Paragraph>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                onClick={() => setDeleteTask(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

        {viewSubTasksModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <PageTitle>Sub Tasks for {selectedMainTask?.name}</PageTitle>
            <Button onClick={() => setCreateSubTask({ name: "", description: "", duration: "" })}> Create Sub Task </Button>
            {subTasks.length === 0 ? (
              <p>No sub-tasks available.</p>
            ) : (
              <ListTable
                headers={[
                  { value: 'Name' },
                  { value: 'Description' },
                  { value: 'Duration' },
                  { value: 'Actions', alignRight: true },
                ]}
                rows={subTasks.map(subTask => ({
                  cells: [
                    { value: subTask.name },
                    { value: subTask.description },
                    { value: subTask.duration },
                    {
                      value: (
                        <div className="flex space-x-2">
                          <Button onClick={() => setEditSubTask(subTask)} small> Edit </Button>
                          <Button onClick={() => setDeleteSubTask(subTask)} small danger> Delete </Button>
                        </div>
                      ),
                      alignRight: true
                    }
                  ],
                }))}
              />
            )}
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setViewSubTasksModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Sub Task Modal */}
      {createSubTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <PageTitle>Create Sub Task</PageTitle>
            <div className="mb-4">
              <FormControlLabel>Name</FormControlLabel>
              <TextField
                type="text"
                value={createSubTask.name}
                onChange={(e) =>
                  setCreateSubTask({ ...createSubTask, name: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <FormControlLabel>Description</FormControlLabel>
              <TextArea
                value={createSubTask.description}
                onChange={(e) =>
                  setCreateSubTask({ ...createSubTask, description: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <FormControlLabel>Duration</FormControlLabel>
              <input
                type="datetime-local"
                value={createSubTask.duration}
                onChange={(e) =>
                  setCreateSubTask({ ...createSubTask, duration: e.target.value })
                }
                className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateSubTask}
              >
                Create
              </Button>
              <Button
                onClick={() => setCreateSubTask(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sub Task Modal */}
      {editSubTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <PageTitle>Edit Sub Task</PageTitle>
            <div className="mb-4">
              <FormControlLabel>Name</FormControlLabel>
              <TextField
                type="text"
                value={editSubTask.name}
                onChange={(e) =>
                    setEditSubTask({ ...editSubTask, name: e.target.value })
                }
                />
            </div>
            <div className="mb-4">
              <FormControlLabel>Description</FormControlLabel>
              <TextArea
                value={editSubTask.description}
                onChange={(e) =>
                    setEditSubTask({ ...editSubTask, description: e.target.value })
                }
                />
            </div>
            <div className="mb-4">
              <FormControlLabel>Duration</FormControlLabel>
              <input
                type="datetime-local"
                value={editSubTask.duration}
                onChange={(e) =>
                    setEditSubTask({ ...editSubTask, duration: e.target.value })
                }
                className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateSubTask}
              >
                Save
              </Button>
              <Button
                onClick={() => setEditSubTask(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sub Task Confirmation Modal */}
      {deleteSubTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <PageTitle>Confirm Delete</PageTitle>
            <Paragraph>Are you sure you want to delete {deleteSubTask.name}?</Paragraph>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleDeleteSubTask}
              >
                Delete
              </Button>
              <Button
                onClick={() => setDeleteSubTask(null)}
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

export default AdminMainTasks;
