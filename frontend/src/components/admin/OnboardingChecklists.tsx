import { ListTable, PageTitle, TableHeader, Text, Button, Paragraph, TextField, TextArea, FullScreenModal, FormControl, Container, CardBase, FileUploader } from "@freee_jp/vibes";
import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../navigation/NavBar";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const headers: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Name', ordering: 'asc' },
  { value: 'Description' },
  { value: 'Deadline' },
  { value: 'Created By' },
  { value: 'Actions', alignCenter: true }
];

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

const AdminMainTasks = () => {
  const [subTasks, setSubTasks] = useState<any[]>([]);
  const [viewSubTasksModalOpen, setViewSubTasksModalOpen] = useState<boolean>(false);
  const [selectedMainTask, setSelectedMainTask] = useState<MainTask | null>(null);
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [error, setError] = useState<string>("");
  const [editTask, setEditTask] = useState<MainTask | null>(null);
  const [deleteTask, setDeleteTask] = useState<MainTask | null>(null);
  const [createTask, setCreateTask] = useState<MainTask | null>(null);
  const [currentUser, setCurrentUser] = useState<CustomJwtPayload | null>(null);
  const [editSubTask, setEditSubTask] = useState<{
    id?: number;
    name: string;
    description: string;
    deadline: string;
    existingAttachments?: any[];
    attachments?: File[];
    removedAttachmentIds?: number[];
  } | null>(null);
  const [deleteSubTask, setDeleteSubTask] = useState<any | null>(null);
  const [createSubTask, setCreateSubTask] = useState<any | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const [loading, setLoading] = useState<boolean>(true);

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
          fetchMainTasks();
        }
      } catch (err) {
        setError("Invalid token");
        navigate('/sign_in');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCurrentUser();
  }, [navigate]);

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

  const handleCreate = async () => {
    if (!createTask || !currentUser) return;
    try {
      const taskWithUserId = { ...createTask, users_id: currentUser.id };
      await axios.post("http://localhost:3000/api/v1/admin/main_tasks", taskWithUserId, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        }
    });
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
        
        withCredentials: true,headers: {
          Authorization: `Bearer ${token}`, 
        }
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
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchMainTasks();
      setDeleteTask(null);
    } catch (err) {
      setError("Failed to delete main task");
    }
  };

  const handleCreateSubTask = async () => {
    if (!createSubTask || !selectedMainTask?.id || !currentUser ) {
      console.error("Missing required data:", { createSubTask, selectedMainTask, currentUser }); 
      setError("User not logged in or invalid user ID");
      return;
    }
  
    const formData = new FormData();
    formData.append('sub_task[name]', createSubTask.name);
    formData.append('sub_task[description]', createSubTask.description);
    formData.append('sub_task[deadline]', createSubTask.deadline);

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    if (createSubTask.attachments) {
      (createSubTask.attachments as File[]).forEach((file: File) => {
        formData.append('sub_task[attachments][]', file);
      });
    }
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/admin/main_tasks/${selectedMainTask.id}/sub_tasks`,
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log("Sub-task created successfully:", response.data);
      fetchSubTasks(selectedMainTask.id);
      setCreateSubTask(null);
    } catch (err) {
      console.error("Failed to create sub-task:", err);
      setError("Failed to create sub task");
    }
  };
  
  const handleUpdateSubTask = async () => {
    if (!editSubTask || !selectedMainTask?.id || !editSubTask.id) return;
  
    const formData = new FormData();
    formData.append('sub_task[name]', editSubTask.name);
    formData.append('sub_task[description]', editSubTask.description);
    formData.append('sub_task[deadline]', editSubTask.deadline);

    if (editSubTask.attachments) {
      Array.from(editSubTask.attachments as File[]).forEach((file: File) => {
        formData.append('sub_task[attachments][]', file);
      });
    }
  
    try {
      const response = await axios.put(
        `http://localhost:3000/api/v1/admin/main_tasks/${selectedMainTask.id}/sub_tasks/${editSubTask.id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log("Sub-task updated successfully:", response.data);
      fetchSubTasks(selectedMainTask.id);
      setEditSubTask(null);
    } catch (err) {
      console.error("Failed to update sub-task:", err);
      setError("Failed to update sub task");
    }
  };

  const handleDeleteSubTask = async () => {
    if (!deleteSubTask || !selectedMainTask?.id || !deleteSubTask.id) return;
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/admin/main_tasks/${selectedMainTask.id}/sub_tasks/${deleteSubTask.id}`,
        { withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
         }
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
          <div>
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

  if (loading) { 
    return <div>Loading...</div>;
  }
  return (
    <div>
       {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
      <Container>
      <PageTitle mt={1}>Manage Onboarding Checklists</PageTitle>
      <Button onClick={() => setCreateTask({ name: "", description: "", deadline: "", users_id: currentUser?.id })} mt={0.5} mb={1} appearance="primary"> Create Task </Button>
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
          <Button onClick={() => setCreateSubTask({ name: "", description: "", deadline: "", users_id: currentUser?.id })} ma={0.5} appearance="primary"> Create Sub Task </Button>
          <CardBase ma={1}>
            {subTasks.length === 0 ? (
              <Paragraph>No sub-tasks available.</Paragraph>
            ) : (
              <ListTable
                headers={[
                  { value: 'Name' },
                  { value: 'Description' },
                  { value: 'Deadline' },
                  { value: 'Created By' },
                  { value: 'Attachments' },
                  { value: 'Actions', alignRight: true },
                ]}
                rows={subTasks.map(subTask => ({
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
                    {
                      value: (
                        <div className="flex space-x-2">
                          <Button onClick={() => setEditSubTask({...subTask, existingAttachments: subTask.attachments || [], removedAttachmentIds: []})} small mr={0.5} appearance="primary"> Edit </Button>
                          <Button onClick={() => setDeleteSubTask(subTask)} small danger> Delete </Button>
                        </div>
                      ),
                      alignRight: true,
                    },
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
          <FormControl label="Deadline" fieldId="sub-task-deadline">
            <input
              type="datetime-local"
              value={createSubTask.deadline}
              onChange={(e) =>
                setCreateSubTask({ ...createSubTask, deadline: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Attachments" fieldId="sub-task-attachments">
            <FileUploader
              fileLabel="Attachments"
              multiple={true}
              onFileSelect={(files: FileList | File[]) => {
                const fileArray = Array.from(files);
                setCreateSubTask({ ...createSubTask, attachments: fileArray });
              }}
              processingMessage="Uploading..."
            />
            {createSubTask.attachments?.map((file: File, index: number) => (
              <div key={index} className="flex items-center mt-2">
                <span>{file.name}</span>
                <Button
                  onClick={() => {
                    const updatedAttachments = createSubTask.attachments.filter((file: File, i: number) => i !== index);
                    setCreateSubTask({ ...createSubTask, attachments: updatedAttachments });
                  }}
                  small
                  danger
                >
                  Remove
                </Button>
              </div>
            ))}
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
          <FormControl label="Deadline" fieldId="edit-sub-task-deadline">
            <input
              type="datetime-local"
              value={editSubTask.deadline}
              onChange={(e) =>
                setEditSubTask({ ...editSubTask, deadline: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Attachments" fieldId="edit-sub-task-attachments">
            {/* Display existing attachments */}
            {(editSubTask.existingAttachments || []).map((attachment: any, index: number) => (
              <div key={index} className="flex items-center mt-2">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {attachment.filename}
                </a>
                <Button
                  onClick={() => {
                    const updatedAttachments = (editSubTask.existingAttachments || []).filter((a: any, i: number) => i !== index);
                    const removedAttachmentIds = [...(editSubTask.removedAttachmentIds || []), attachment.id];
                    setEditSubTask({
                      ...editSubTask,
                      existingAttachments: updatedAttachments,
                      removedAttachmentIds,
                    });
                  }}
                  small
                  danger
                  ml={2}
                >
                  Remove
                </Button>
              </div>
            ))}
            {/* File uploader for new attachments */}
            <FileUploader
              fileLabel="Attachments"
              multiple={true}
              onFileSelect={(files: FileList | File[]) => {
                const fileArray = Array.from(files);
                setEditSubTask({ ...editSubTask, attachments: fileArray });
              }}
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