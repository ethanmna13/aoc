import { ListTable, PageTitle, TableHeader, Button, Paragraph, TextField, TextArea, FullScreenModal, FormControl, FileUploader, TaskDialog, FloatingMessageBlock, Stack, SearchField, SelectBox, SectionTitle } from "@freee_jp/vibes";
import { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../navigation/NavBar";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ChevronRight, Plus, Trash } from "lucide-react";
import "../css/Custom.css";

const headers: TableHeader[] = [
  { value: 'ID' },
  { value: 'Title' },
  { value: 'Description' },
  { value: 'Deadline' },
  { value: 'Created By' },
  { value: '' }
];

interface MainTask {
  id?: number;
  name: string;
  description: string;
  deadline: string;
  users_id?: number;
  user_name?: string;
  attachments?: Attachment[];
  removedAttachmentIds?: number[];
}
interface SubTask {
  id?: number;
  name: string;
  description: string;
  deadline: string;
  users_id?: number;
  user_name?: string;
  attachments?: Attachment[]; 
}

interface Attachment {
  id: number;
  url: string;
  filename: string;
}


interface CustomJwtPayload {
  sub: number;
  name: string;
  role: string;
}

const AdminMainTasks = () => {
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [viewSubTasksModalOpen, setViewSubTasksModalOpen] = useState<boolean>(false);
  const [selectedMainTask, setSelectedMainTask] = useState<MainTask | null>(null);
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [error, setError] = useState<string>("");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [editTask, setEditTask] = useState<{
    id?: number;
    name: string;
    description: string;
    deadline: string;
    attachments?: Attachment[];
    removedAttachmentIds?: number[];
  } | null>(null);
  const [deleteTask, setDeleteTask] = useState<MainTask | null>(null);
  const [createTask, setCreateTask] = useState<MainTask | null>(null);
  const [currentUser, setCurrentUser] = useState<CustomJwtPayload | null>(null);
  const [editSubTask, setEditSubTask] = useState<{
    id?: number;
    name: string;
    description: string;
    deadline: string;
    existingAttachments?: Attachment[];
    attachments?: File[];
    removedAttachmentIds?: number[];
  } | null>(null);
  const [deleteSubTask, setDeleteSubTask] = useState<SubTask | null>(null);
  const [createSubTask, setCreateSubTask] = useState<SubTask | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
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
          Authorization: `Bearer ${token}`,
        },
      });
      setSubTasks(response.data);
    } catch {
      setError("Failed to fetch sub tasks");
    }
  };

  const fetchMainTasks = async (searchTerm: string = "", filter: string = "all") => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/admin/main_tasks", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          q: {
            name_cont: searchTerm,
            users_id_eq: filter === "current_user" ? currentUser?.sub : null
          }
        }
      });
      setMainTasks(response.data);
    } catch {
      setError("Failed to fetch main tasks");
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchMainTasks(term, roleFilter);
  };

  const handleRoleFilter = (filter: string) => {
    setRoleFilter(filter);
    fetchMainTasks(searchTerm, filter);
  };

  const handleCreate = async () => {
    if (!createTask || !currentUser) return;
  
    const formData = new FormData();
    formData.append("main_task[name]", createTask.name);
    formData.append("main_task[description]", createTask.description);
    formData.append("main_task[deadline]", createTask.deadline);
    formData.append("main_task[users_id]", currentUser.sub.toString());
  
    if (newFiles) {
      newFiles.forEach((file) => {
        formData.append("main_task[attachments][]", file);
      });
    }
  
    try {
      await axios.post("http://localhost:3000/api/v1/admin/main_tasks", formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccessMessage(`${createTask.name} successfully created.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchMainTasks();
      setCreateTask(null);
      setNewFiles([]);
    } catch {
      setError("Failed to create main task");
    }
  };
  
  const handleUpdate = async () => {
    if (!editTask) return;
  
    const formData = new FormData();
    formData.append("main_task[name]", editTask.name);
    formData.append("main_task[description]", editTask.description);
    formData.append("main_task[deadline]", editTask.deadline);
  
    if (newFiles) {
      newFiles.forEach((file) => {
        formData.append("main_task[attachments][]", file);
      });
    }
  
    try {
      await axios.put(`http://localhost:3000/api/v1/admin/main_tasks/${editTask.id}`, formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      const response = await axios.get(`http://localhost:3000/api/v1/admin/main_tasks/${editTask.id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setMainTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === editTask.id ? response.data : task))
      );
  
      setSuccessMessage(`${editTask.name} successfully updated.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setEditTask(null);
      setNewFiles([]);
    } catch {
      setError("Failed to update main task");
    }
  };

  const handleRemoveAttachment = async (taskId: number, attachmentId: number) => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/admin/main_tasks/${taskId}/remove_attachment`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { attachment_id: attachmentId },
        }
      );
  
      setEditTask((prevTask) => {
        if (!prevTask) return prevTask;
  
        const updatedAttachments = prevTask.attachments?.filter(
          (attachment) => attachment.id !== attachmentId
        );
  
        return {
          ...prevTask,
          attachments: updatedAttachments,
        };
      });
  
      setSuccessMessage("Attachment removed successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch {
      setError("Failed to remove attachment.");
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
    if (!createSubTask || !selectedMainTask?.id || !currentUser) {
      setError("User not logged in or invalid user ID");
      return;
    }
  
    const formData = new FormData();
    formData.append('sub_task[name]', createSubTask.name);
    formData.append('sub_task[description]', createSubTask.description);
    formData.append('sub_task[deadline]', createSubTask.deadline);
  
    if (newFiles) {
      newFiles.forEach((file: File) => {
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
      setNewFiles([]); 
    } catch {
      setError("Failed to create sub task");
    }
  };
  
  const handleUpdateSubTask = async () => {
    if (!editSubTask || !selectedMainTask?.id || !editSubTask.id) return;
  
    const formData = new FormData();
    formData.append('sub_task[name]', editSubTask.name);
    formData.append('sub_task[description]', editSubTask.description);
    formData.append('sub_task[deadline]', editSubTask.deadline);
  
    if (newFiles) {
      newFiles.forEach((file: File) => {
        formData.append('sub_task[attachments][]', file);
      });
    }
  
    if (editSubTask.removedAttachmentIds) {
      editSubTask.removedAttachmentIds.forEach((id: number) => {
        formData.append('sub_task[remove_attachment_ids][]', id.toString());
      });
    }
  
    try {
      await axios.put(
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
      console.log("Sub-task updated successfully");
      fetchSubTasks(selectedMainTask.id);
      setEditSubTask(null);
      setNewFiles([]);
    } catch {
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
      {
        value: task.attachments && task.attachments.length > 0 ? (
          <a
            href={task.attachments[0].url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {task.name}
          </a>
        ) : (
          task.name
        ),
      },
      { value: task.description },
      {
        value: task.deadline ? (
          new Date(task.deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        ) : (
          "N/A"
        ),
      },
      { value: task.user_name || "Unknown" }, 
      {
        value: (
          <div>
            <Button mr={0.5} IconComponent={ChevronRight} iconPosition="right"
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
            <Button
                onClick={() => {
                  setEditTask({
                    ...task,
                    attachments: task.attachments || [],
                    removedAttachmentIds: [],
                  });
                  setNewFiles([]);
                }}
                small
                mr={0.5}
            >
                Edit
            </Button>
            <Button IconComponent={Trash} onClick={() => setDeleteTask(task)} small danger appearance="tertiary"> Delete </Button>
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
      <PageTitle mt={1} ml={1}>Onboarding Checklists</PageTitle>
      <Button IconComponent={Plus} onClick={() => setCreateTask({ name: "", description: "", deadline: "", users_id: currentUser?.sub })} ml={1} mb={0.5} mt={1}>Add Onboarding Checklist</Button>
      <Stack direction="horizontal">
        <FormControl mb={0.5} ml={1} label={"Title"}>
        <SearchField
          id="search"
          label="title"
          placeholder="Search by title"
          name="search"
          width="medium"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
        />
        </FormControl>
        <FormControl mb={0.5} ml={1} label={"Created By"}>
        <SelectBox
          id="createdby-filter"
          label="Filter by Author"
          options={[
            { name: 'All', value: 'all' },
            { name: 'Current User', value: 'current_user' }
          ]}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRoleFilter(e.target.value)}
          width="medium"
        />
        </FormControl>
        </Stack>
      {error && (<FloatingMessageBlock error>{error}</FloatingMessageBlock>)}
      {successMessage && (<FloatingMessageBlock success>{successMessage}</FloatingMessageBlock>)}
      <ListTable headers={headers} rows={taskRows}></ListTable>

      {/* Create Task Modal */}
      {createTask && (
        <TaskDialog
          id="create-task-dialog"
          isOpen={Boolean(createTask)}
          title="New Main Task"
          onRequestClose={() => setCreateTask(null)}
          closeButtonLabel="Close"
          primaryButtonLabel="Save"
          onPrimaryAction={handleCreate}
          shouldCloseOnOverlayClickOrEsc={true}
        >
          <FormControl label="Name" fieldId="name" required>
            <TextField width="full"
              type="text"
              value={createTask.name}
              onChange={(e) =>
                setCreateTask({ ...createTask, name: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Description" fieldId="description">
            <TextArea width="full"
              value={createTask.description}
              onChange={(e) =>
                setCreateTask({ ...createTask, description: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Deadline" fieldId="deadline" required>
            <input
              type="date"
              value={createTask.deadline ? createTask.deadline.split("T")[0] : ""}
              onChange={(e) =>
                setCreateTask({ ...createTask, deadline: e.target.value})
              }
              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </FormControl>
          <FormControl label="Attachments" fieldId="attachments">
            <FileUploader width="medium"
              fileLabel="Attachments"
              multiple={true}
              onFileSelect={(files: FileList | File[]) => {
                const fileArray = Array.from(files);
                setNewFiles(fileArray);
              }}
              processingMessage="Uploading..."
            />
            {/* Display newly uploaded files */}
            {newFiles.map((file, index) => (
              <div key={index} className="flex items-center mt-2">
                <span>{file.name}</span>
                <Button
                  onClick={() => {
                    const updatedFiles = newFiles.filter((_, i) => i !== index);
                    setNewFiles(updatedFiles);
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

      {/* Edit Task Modal */}
      {editTask && (
        <TaskDialog
          id="edit-task-dialog"
          isOpen={Boolean(editTask)}
          title={`Edit ${selectedMainTask?.name}`}
          onRequestClose={() => setEditTask(null)}
          closeButtonLabel="Cancel"
          primaryButtonLabel="Save"
          onPrimaryAction={handleUpdate}
          shouldCloseOnOverlayClickOrEsc={true}
        >
          <FormControl label="Name" fieldId="edit-name" required>
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
          <FormControl label="Deadline" fieldId="edit-deadline" required>
            <input
              type="date"
              value={editTask.deadline ? editTask.deadline.split("T")[0] : ""}
              onChange={(e) =>
                setEditTask({ ...editTask, deadline: e.target.value })
              }
              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </FormControl>
          <FormControl label="Attachments" fieldId="attachments">
            <FileUploader
              fileLabel="Attachments"
              multiple={true}
              onFileSelect={(files: FileList | File[]) => {
                const fileArray = Array.from(files);
                setNewFiles(fileArray);
              }}
              processingMessage="Uploading..."
            />
            {/* Display existing attachments */}
            {editTask.attachments?.map((attachment, index) => (
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
                    if (attachment.id && editTask.id) {
                      handleRemoveAttachment(editTask.id, attachment.id);
                    }
                  }}
                  small
                  danger
                  ml={2}
                >
                  Remove
                </Button>
              </div>
            ))}
            {/* Display newly uploaded files */}
            {newFiles.map((file, index) => (
              <div key={index} className="flex items-center mt-2">
                <span>{file.name}</span>
                <Button
                  onClick={() => {
                    const updatedFiles = newFiles.filter((_, i) => i !== index);
                    setNewFiles(updatedFiles);
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

      {/* Delete Confirmation Modal */}
      {deleteTask && (
        <TaskDialog
        id="delete-task-dialog"
        isOpen={Boolean(deleteTask)}
        title="Are you sure you want to delete this checklist?"
        onRequestClose={() => setDeleteTask(null)}
        closeButtonLabel="Cancel"
        primaryButtonLabel="Delete"
        danger={true}
        onPrimaryAction={handleDelete}
        shouldCloseOnOverlayClickOrEsc={true}>
          <Paragraph textAlign="center">Name: {deleteTask.name}</Paragraph>
          <Paragraph textAlign="center">Created By: {deleteTask.user_name}</Paragraph>
          <SectionTitle headlineLevel={1} textAlign="center">Sub Tasks of this checklist will also be deleted.</SectionTitle>
          <div className="flex gap-2">
          </div>
        </TaskDialog>
      )}

      {/* View Sub Tasks Modal */}
      {viewSubTasksModalOpen && (
        <FullScreenModal isOpen={viewSubTasksModalOpen} title={`Sub Tasks for ${selectedMainTask?.name}`} onRequestClose={() => setViewSubTasksModalOpen(false)}>
          <SectionTitle>{selectedMainTask?.description}</SectionTitle>
          <Paragraph mt={0.5} mb={1}>Deadline: {selectedMainTask?.deadline ? (
                        new Date(selectedMainTask.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      ): ( "N/A")}</Paragraph>
          <Button onClick={() => setCreateSubTask({ name: "", description: "", deadline: "", users_id: currentUser?.sub })}  IconComponent={Plus} > Add Sub Task </Button>
            {subTasks.length === 0 ? (
              <Paragraph>No sub-tasks available.</Paragraph>
            ) : (
              <ListTable mt={1} mb={1}
                headers={[
                  { value: 'ID' },
                  { value: 'Name' },
                  { value: 'Description' },
                  { value: 'Deadline' },
                  { value: 'Created By' },
                  { value: '', alignRight: true },
                ]}
                rows={subTasks.map(subTask => ({
                  cells: [
                    { value: subTask.id },
                    {
                      value: subTask.attachments && subTask.attachments.length > 0 ? (
                        <a
                          href={subTask.attachments[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {subTask.name}
                        </a>
                      ) : (
                        subTask.name
                      ),
                    },
                    { value: subTask.description },
                    {
                      value: subTask.deadline ? (
                        new Date(subTask.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      ) : (
                        "N/A" 
                      ),
                    },
                    { value: subTask.user_name || "Unknown" },
                    {
                      value: (
                        <div>
                          <Button
                            onClick={() =>
                              setEditSubTask({
                                ...subTask,
                                existingAttachments: subTask.attachments || [],
                                attachments: [],
                                removedAttachmentIds: [],
                              })
                            }
                            small
                            mr={0.5}
                          >
                            Edit
                          </Button>
                          <Button IconComponent={Trash} onClick={() => setDeleteSubTask(subTask)} small danger appearance="tertiary"> Delete </Button>
                        </div>
                      ),
                      alignRight: true,
                    },
                  ],
                }))}
              />
            )}
          <Button onClick={() => setViewSubTasksModalOpen(false)} ma={0.5}>Close</Button>
        </FullScreenModal>
      )}

      {/* Create Sub Task Modal */}
      {createSubTask && (
        <TaskDialog
        id="create-sub-task-dialog"
        isOpen={Boolean(createSubTask)}
        title={`New Sub Task for ${selectedMainTask?.name}`}
        onRequestClose={() => setCreateSubTask(null)}
        closeButtonLabel="Close"
        primaryButtonLabel="Save"
        onPrimaryAction={handleCreateSubTask}
        shouldCloseOnOverlayClickOrEsc={true}
        >
          <FormControl label="Name" fieldId="sub-task-name" required>
            <TextField width="full"
              type="text"
              value={createSubTask.name}
              onChange={(e) =>
                setCreateSubTask({ ...createSubTask, name: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Description" fieldId="sub-task-description">
            <TextArea width="full"
              value={createSubTask.description}
              onChange={(e) =>
                setCreateSubTask({ ...createSubTask, description: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Deadline" fieldId="sub-task-deadline" required>
            <input
              type="date"
              value={createSubTask.deadline ? createSubTask.deadline.split("T")[0] : ""}
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
              setNewFiles(fileArray);
            }}
            processingMessage="Uploading..."
          />
            {createSubTask.attachments?.map((file, index: number) => (
              <div key={index} className="flex items-center mt-2">
                <span>{file.filename}</span>
                <Button
                  onClick={() => {
                    const updatedAttachments = createSubTask.attachments?.filter((_, i: number) => i !== index);
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
          title={`Edit ${editSubTask.name}`}
          onRequestClose={() => setEditSubTask(null)}
          closeButtonLabel="Close"
          primaryButtonLabel="Save"
          onPrimaryAction={handleUpdateSubTask}
          shouldCloseOnOverlayClickOrEsc={true}
        >
          <FormControl label="Name" fieldId="edit-sub-task-name" required>
            <TextField width="full"
              type="text"
              value={editSubTask.name}
              onChange={(e) =>
                setEditSubTask({ ...editSubTask, name: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Description" fieldId="edit-sub-task-description">
            <TextArea width="full"
              value={editSubTask.description}
              onChange={(e) =>
                setEditSubTask({ ...editSubTask, description: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Deadline" fieldId="edit-sub-task-deadline" required>
            <input
              type="date"
              value={editSubTask.deadline ? editSubTask.deadline.split("T")[0] : ""}
              onChange={(e) =>
                setEditSubTask({ ...editSubTask, deadline: e.target.value })
              }
            />
          </FormControl>
          <FormControl label="Attachments" fieldId="edit-sub-task-attachments">
            {/* Display existing attachments */}
            {(editSubTask.existingAttachments || []).map((attachment, index) => (
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
                    const updatedAttachments = (editSubTask.existingAttachments || []).filter((_, i) => i !== index);
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
                setNewFiles(fileArray);
              }}
              processingMessage="Uploading..."
            />
            {/* Display newly added attachments */}
            {newFiles.map((file, index) => (
              <div key={index} className="flex items-center mt-2">
                <span>{file.name}</span>
                <Button
                  onClick={() => {
                    const updatedFiles = newFiles.filter((_, i) => i !== index);
                    setNewFiles(updatedFiles);
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
        title="Are you sure you want to delete this Sub Task?"
        onRequestClose={() => setDeleteSubTask(null)}
        closeButtonLabel="Cancel"
        primaryButtonLabel="Delete"
        danger={true}
        onPrimaryAction={handleDeleteSubTask}
        shouldCloseOnOverlayClickOrEsc={true}>
          <Paragraph textAlign="center">Name: {deleteSubTask.name}</Paragraph>
          <Paragraph textAlign="center">Created By: {deleteSubTask.user_name}</Paragraph>
        </TaskDialog>
      )}
    </div>
  );
  };

export default AdminMainTasks;
