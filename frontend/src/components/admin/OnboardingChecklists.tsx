import { ListTable, PageTitle, TableHeader, Button, Paragraph, TextField, TextArea, FullScreenModal, FormControl, Container, CardBase, FileUploader, TaskDialog, FloatingMessageBlock } from "@freee_jp/vibes";
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

interface SubTask {
  id?: number;
  name: string;
  description: string;
  deadline: string;
  users_id?: number;
  user_name?: string; 
  attachments?: File[];
}


interface CustomJwtPayload {
  id: number;
  name: string;
  role: string;
}

const AdminMainTasks = () => {
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [viewSubTasksModalOpen, setViewSubTasksModalOpen] = useState<boolean>(false);
  const [selectedMainTask, setSelectedMainTask] = useState<MainTask | null>(null);
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [editTask, setEditTask] = useState<MainTask | null>(null);
  const [deleteTask, setDeleteTask] = useState<MainTask | null>(null);
  const [createTask, setCreateTask] = useState<MainTask | null>(null);
  const [currentUser, setCurrentUser] = useState<CustomJwtPayload | null>(null);
  const [editSubTask, setEditSubTask] = useState<{
    id?: number;
    name: string;
    description: string;
    deadline: string;
    existingAttachments?: File[];
    attachments?: File[];
    removedAttachmentIds?: number[];
  } | null>(null);
  const [deleteSubTask, setDeleteSubTask] = useState<SubTask | null>(null);
  const [createSubTask, setCreateSubTask] = useState<SubTask | null>(null);
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
      } catch {
        setError("Invalid token");
        navigate('/sign_in');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch {
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
    } catch {
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
      setSuccessMessage(`${taskWithUserId.name} successfully created.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchMainTasks();
      setCreateTask(null);
    } catch {
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
      setSuccessMessage(`${editTask.name} successfully updated.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchMainTasks();
      setEditTask(null);
    } catch {
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
      setSuccessMessage(`${deleteTask.name} successfully deleted.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchMainTasks();
      setDeleteTask(null);
    } catch {
      setError("Failed to delete main task");
    }
  };

  const handleCreateSubTask = async () => {
    if (!createSubTask || !selectedMainTask?.id || !currentUser ) {
      setError("User not logged in or invalid user ID");
      return;
    }
  
    const formData = new FormData();
    formData.append('sub_task[name]', createSubTask.name);
    formData.append('sub_task[description]', createSubTask.description);
    formData.append('sub_task[deadline]', createSubTask.deadline);
  
    if (createSubTask.attachments) {
      (createSubTask.attachments as File[]).forEach((file: File) => {
        formData.append('sub_task[attachments][]', file);
      });
    }
  
    try {
        await axios.post(
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
      setSuccessMessage(`${createSubTask.name} successfully created.`);
      setTimeout(() => setSuccessMessage(""), 3000);
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

    if (editSubTask.removedAttachmentIds) {
      editSubTask.removedAttachmentIds.forEach((id: number) => {
        formData.append('sub_task[remove_attachment_ids][]', id.toString());
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
    } catch {
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
      {error && (<FloatingMessageBlock error>{error}</FloatingMessageBlock>)}
      {successMessage && (<FloatingMessageBlock success>{successMessage}</FloatingMessageBlock>)}
      <CardBase>
      <ListTable headers={headers} rows={taskRows}></ListTable>
      </CardBase>

      {/* Create Task Modal */}
      {createTask && (
        <TaskDialog
        id="create-task-dialog" 
        isOpen={Boolean(createTask)} 
        title="Create Main Task" 
        onRequestClose={() => setCreateTask(null)}
        closeButtonLabel="Cancel"
        primaryButtonLabel="Create"
        onPrimaryAction={handleCreate}
        shouldCloseOnOverlayClickOrEsc={true}>
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
          </div>
        </TaskDialog>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <TaskDialog
        id="edit-task-dialog"
        isOpen={Boolean(editTask)}
        title="Edit Main Task"
        onRequestClose={() => setEditTask(null)}
        closeButtonLabel="Cancel"
        primaryButtonLabel="Save"
        onPrimaryAction={handleUpdate}
        shouldCloseOnOverlayClickOrEsc={true}>
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
        </TaskDialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTask && (
        <TaskDialog
        id="delete-task-dialog"
        isOpen={Boolean(deleteTask)}
        title="Confirm Delete"
        onRequestClose={() => setDeleteTask(null)}
        closeButtonLabel="Cancel"
        primaryButtonLabel="Delete"
        danger={true}
        onPrimaryAction={handleDelete}
        shouldCloseOnOverlayClickOrEsc={true}>
          <Paragraph>Are you sure you want to delete {deleteTask.name}?</Paragraph>
          <div className="flex gap-2">
          </div>
        </TaskDialog>
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
        <TaskDialog
        id="create-sub-task-dialog"
        isOpen={Boolean(createSubTask)}
        title="Create Sub Task"
        onRequestClose={() => setCreateSubTask(null)}
        closeButtonLabel="Cancel"
        primaryButtonLabel="Create"
        onPrimaryAction={handleCreateSubTask}
        shouldCloseOnOverlayClickOrEsc={true}
        >
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
        </TaskDialog>
      )}

      {/* Edit Sub Task Modal */}
      {editSubTask && (
        <TaskDialog
        id="edit-sub-task-modal"
        isOpen={Boolean(editSubTask)}
        title="Edit Sub Task"
        onRequestClose={() => setEditSubTask(null)}
        closeButtonLabel="Cancel"
        primaryButtonLabel="Save"
        onPrimaryAction={handleUpdateSubTask}
        shouldCloseOnOverlayClickOrEsc={true}
        >
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
            {/* Display newly added attachments */}
            {(editSubTask.attachments || []).map((file: File, index: number) => (
              <div key={index} className="flex items-center mt-2">
                <span>{file.name}</span>
                <Button
                  onClick={() => {
                    const updatedAttachments = (editSubTask.attachments || []).filter((file: File, i: number) => i !== index);
                    setEditSubTask({ ...editSubTask, attachments: updatedAttachments });
                  }}
                  small
                  danger
                  ml={2}
                >
                  Remove
                </Button>
              </div>
            ))}
          </FormControl>
        </TaskDialog>
      )}
      
      {/* Delete Sub Task Confirmation Modal */}
      {deleteSubTask && (
        <TaskDialog
        id="delete-sub-task-dialog"
        isOpen={Boolean(deleteSubTask)}
        title="Confirm Delete"
        onRequestClose={() => setDeleteSubTask(null)}
        closeButtonLabel="Cancel"
        primaryButtonLabel="Delete"
        danger={true}
        onPrimaryAction={handleDeleteSubTask}
        shouldCloseOnOverlayClickOrEsc={true}>
          <Paragraph>Are you sure you want to delete {deleteSubTask.name}?</Paragraph>
        </TaskDialog>
      )}
      </Container>
    </div>
  );
};

export default AdminMainTasks;