/* eslint-disable react-hooks/exhaustive-deps */
import {
    Breadcrumbs,
    Button,
    CardBase,
    FileUploader,
    FloatingMessageBlock,
    FormControl,
    FullScreenModal,
    GridBlock,
    GridWrapper,
    ListTable,
    Pager,
    PageTitle,
    Paragraph,
    SearchField,
    SectionTitle,
    Stack,
    StatusIcon,
    SubSectionTitle,
    TableHeader,
    TaskDialog,
  } from "@freee_jp/vibes";
  import NavBar from "../navigation/NavBar";
  import { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { jwtDecode } from "jwt-decode";
  import axios from "axios";
  import "../css/Mentor.css";
  
  interface CustomJwtPayload {
    sub: number;
    name: string;
    role: string;
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
  
  interface AssignedMainTask {
    updated_at: string | number | Date;
    id: number;
    mentorships_id: number;
    mentee_name: string;
    mentorship_name: string;
    main_task_id: number;
    main_task_name: string;
    main_task_description: string;
    main_task_deadline: string;
    main_task_created_by: string;
    main_task_attachments: { url: string; filename: string }[];
    status: string;
    submissions?: { id: number; url: string; filename: string }[];
  }
  
  interface AssignedSubTask {
    id: number;
    mentorships_id: number;
    mentee_name: string;
    mentorship_name: string;
    assigned_main_tasks_id: number;
    sub_task_id: number;
    sub_task_name: string;
    sub_task_description: string;
    sub_task_deadline: string;
    sub_task_attachments: { url: string; filename: string }[];
    status: string;
    submissions?: { id: number; url: string; filename: string }[];
  }
  
  const menteeHeaders: TableHeader[] = [
    { value: "ID" },
    { value: "Mentee" },
    { value: "Onboarding Checklist" },
    { value: "Status", alignCenter: true },
    { value: "Submissions", alignCenter: true },
    { value: "", alignRight: true },
  ];
  
  const Mentorships = () => {
    const [currentUser, setCurrentUser] = useState<CustomJwtPayload | null>(null);
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [mentorships, setMentorships] = useState<Mentorship[]>([]);
    const [assignedSubTasks, setAssignedSubTasks] = useState<AssignedSubTask[]>([]);
    const [assignedMainTasks, setAssignedMainTasks] = useState<AssignedMainTask[]>([]);
    const [, setIsModalOpen] = useState(false);
    const [selectedMentorship] = useState<Mentorship | null>(null);
    const [, setModalAssignedMainTasks] = useState<AssignedMainTask[]>([]);
    const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
    const [selectedMainTask, setSelectedMainTask] = useState<AssignedMainTask | null>(null);
    const [isMainTaskSubmissionDialogOpen, setIsMainTaskSubmissionDialogOpen] = useState(false);
    const [isSubTaskSubmissionDialogOpen, setIsSubTaskSubmissionDialogOpen] = useState(false);
    const [selectedSubTask, setSelectedSubTask] = useState<AssignedSubTask | null>(null);
    const [newSubmissionFiles, setNewSubmissionFiles] = useState<File[]>([]);
    const [isConfirmSubTaskDialogOpen, setIsConfirmSubTaskDialogOpen] = useState(false);
    const [isConfirmMainTaskDialogOpen, setIsConfirmMainTaskDialogOpen] = useState(false);
    const [searchMenteeName, setSearchMenteeName] = useState<string>("");
    const [searchChecklistTitle, setSearchChecklistTitle] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
  
    useEffect(() => {
      const fetchCurrentUser = async () => {
        if (!token) {
          setError("No token found, please log in again");
          navigate("/sign_in");
          return;
        }
  
        try {
          const decodedToken = jwtDecode<CustomJwtPayload>(token);
          setCurrentUser(decodedToken);
  
          if (decodedToken.role !== "mentor") {
            setError("Unauthorized");
            navigate("/unauthorized");
          } else {
            fetchMentorships();
            fetchAssignedMainTasks(searchMenteeName, searchChecklistTitle, currentPage);
          }
        } catch {
          setError(`You are not logged in.`);
          navigate("/sign_in");
        }
      };
      fetchCurrentUser();
    }, [navigate]);
  
    const fetchMentorships = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/mentorships", {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setMentorships(response.data.mentorships || []);
      } catch {
        setError("Failed to fetch mentorships");
      }
    };
  
    const fetchAssignedMainTasks = async (menteeName: string, checklistTitle: string, page: number) => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/assigned_main_tasks", {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
          params: {
            q: {
              mentorship_mentee_name_cont: menteeName,
              main_task_name_cont: checklistTitle,
            },
            page: page,
            per_page: 10,
          },
        });
    
        const assignedMainTasks = response.data.assigned_main_tasks || [];
        setAssignedMainTasks(assignedMainTasks);
    
        const subTasksPromises = assignedMainTasks.map(async (task: AssignedMainTask) => {
          const subTasksResponse = await axios.get(
            `http://localhost:3000/api/v1/assigned_main_tasks/${task.id}/assigned_sub_tasks`,
            {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return subTasksResponse.data;
        });
    
        const subTasksResults = await Promise.all(subTasksPromises);
        const allSubTasks = subTasksResults.flat();
        setAssignedSubTasks(allSubTasks);
    
        setTotalPages(response.data.total_pages || 1);
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
  
    const fetchAssignedMainTasksForMentorship = async (mentorshipId: number) => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/assigned_main_tasks?mentorships_id=${mentorshipId}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setModalAssignedMainTasks(response.data.assigned_main_tasks);
      } catch {
        setError("Failed to fetch assigned main tasks for the selected mentorship");
      }
    };
  
    const calculateMentorshipStatus = (mentorship: Mentorship) => {
      const mentorMainTasks = assignedMainTasks.filter(
        (task) => task.mentorships_id === mentorship.id
      );
      const mentorSubTasks = assignedSubTasks.filter(
        (task) => task.mentorships_id === mentorship.id
      );
    
      const allTasks = [...mentorMainTasks, ...mentorSubTasks];
    
      if (allTasks.length === 0) {
        return "";
      }
    
      const hasPendingTasks = allTasks.every((task) => task.status === "not_started");
      const hasInProgressTasks = allTasks.some((task) => task.status === "in_progress" || task.status == "not_started");
      const allTasksCompleted = allTasks.every((task) => task.status === "completed");
    
      if (allTasksCompleted) {
        return "Completed";
      } else if (hasInProgressTasks) {
        return "In Progress";
      } else if (hasPendingTasks) {
        return "Not Started";
      }
    
      return "Not Started";
    };
    
    const calculateMentorshipCounts = () => {
      const mentorMentorships = mentorships.filter((mentorship) => mentorship.mentor_id === currentUser?.sub);
    
      const pendingMentorships = mentorMentorships.filter(
        (mentorship) => calculateMentorshipStatus(mentorship) === "Not Started"
      ).length;
      const inProgressMentorships = mentorMentorships.filter(
        (mentorship) => calculateMentorshipStatus(mentorship) === "In Progress"
      ).length;
      const completedMentorships = mentorMentorships.filter(
        (mentorship) => calculateMentorshipStatus(mentorship) === "Completed"
      ).length;
    
      return { pendingMentorships, inProgressMentorships, completedMentorships };
    };
    
    const { pendingMentorships, inProgressMentorships, completedMentorships } = calculateMentorshipCounts();
  
    const handleSearchMenteeName = (value: string) => {
      setSearchMenteeName(value);
      fetchAssignedMainTasks(value, searchChecklistTitle, currentPage);
    };
  
    const handleSearchChecklistTitle = (value: string) => {
      setSearchChecklistTitle(value);
      fetchAssignedMainTasks(searchMenteeName, value, currentPage);
    };
  
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
      fetchAssignedMainTasks(searchMenteeName, searchChecklistTitle, page);
    };
  
    const handleFileUpload = (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      setNewSubmissionFiles(fileArray);
    };
  
    const handleRemoveMainTaskSubmission = async (submissionId: number, filename: string, task: AssignedMainTask) => {
      try {
        const payload = {
          assigned_main_task: {
            remove_submission_ids: [submissionId],
          },
        };
  
        await axios.put(
          `http://localhost:3000/api/v1/assigned_main_tasks/${task.id}`,
          payload,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        setSuccessMessage(`Submission "${filename}" removed successfully`);
        setTimeout(() => setSuccessMessage(""), 3000);
  
        fetchAssignedMainTasks(searchMenteeName, searchChecklistTitle, currentPage);
      } catch (err) {
        console.error("Failed to remove submission:", err);
        setError("Failed to remove submission");
      }
    };
  
    const handleSubmitMainTaskSubmissions = async () => {
      if (!selectedMainTask) return;
  
      const formData = new FormData();
      newSubmissionFiles.forEach((file) => {
        formData.append("assigned_main_task[submissions][]", file);
      });
  
      try {
        await axios.put(
          `http://localhost:3000/api/v1/assigned_main_tasks/${selectedMainTask.id}`,
          formData,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        setSuccessMessage("Submissions updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
  
        fetchAssignedMainTasks(searchMenteeName, searchChecklistTitle, currentPage);
        setNewSubmissionFiles([]);
        setIsMainTaskSubmissionDialogOpen(false);
      } catch (err) {
        console.error("Failed to update submissions:", err);
        setError("Failed to update submissions");
      }
    };
  
    const handleRemoveSubTaskSubmission = async (submissionId: number, filename: string, task: AssignedSubTask) => {
      try {
        const payload = {
          assigned_sub_task: {
            remove_submission_ids: [submissionId],
          },
        };
  
        await axios.put(
          `http://localhost:3000/api/v1/assigned_main_tasks/${selectedMainTask?.id}/assigned_sub_tasks/${task.id}`,
          payload,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        setSuccessMessage(`Submission "${filename}" removed successfully`);
        setTimeout(() => setSuccessMessage(""), 3000);
  
        if (selectedMainTask) {
          fetchAssignedSubTasks(selectedMainTask.id);
        }
      } catch (err) {
        console.error("Failed to remove submission:", err);
        setError("Failed to remove submission");
      }
    };
  
    const handleSubmitSubTaskSubmissions = async () => {
      if (!selectedMainTask || !selectedSubTask) return;
  
      const formData = new FormData();
      newSubmissionFiles.forEach((file) => {
        formData.append("assigned_sub_task[submissions][]", file);
      });
  
      try {
        await axios.put(
          `http://localhost:3000/api/v1/assigned_main_tasks/${selectedMainTask.id}/assigned_sub_tasks/${selectedSubTask.id}`,
          formData,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        setSuccessMessage("Submissions updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchAssignedSubTasks(selectedMainTask.id);
        setNewSubmissionFiles([]);
        setIsSubTaskSubmissionDialogOpen(false);
      } catch (err) {
        console.error("Failed to update submissions:", err);
        setError("Failed to update submissions");
      }
    };
  
    const handleConfirmSubTaskCompletion = async () => {
      if (!selectedMainTask || !selectedSubTask) return;
  
      try {
        const payload = {
          assigned_sub_task: {
            status: "completed",
          },
        };
  
        await axios.put(
          `http://localhost:3000/api/v1/assigned_main_tasks/${selectedMainTask?.id}/assigned_sub_tasks/${selectedSubTask.id}`,
          payload,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (selectedMainTask.status === "not_started") {
          const mainTaskPayload = {
            assigned_main_task: {
              status: "completed",
            },
          };
    
          await axios.put(
            `http://localhost:3000/api/v1/assigned_main_tasks/${selectedMainTask.id}`,
            mainTaskPayload,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
  
        setSuccessMessage("Sub task marked as completed successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchAssignedSubTasks(selectedMainTask.id);
        calculateMentorshipCounts();
        setIsConfirmSubTaskDialogOpen(false);
      } catch (err) {
        console.error("Failed to update sub task status:", err);
        setError("Failed to update sub task status");
      }
    };
  
    const handleConfirmMainTaskCompletion = async () => {
      if (!selectedMainTask) return;
  
      try {
        const payload = {
          status: "completed",
        };
  
        await axios.patch(
          `http://localhost:3000/api/v1/assigned_main_tasks/${selectedMainTask.id}`,
          payload,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        setSuccessMessage("Main task marked as completed successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
  
        if (selectedMentorship) {
          await fetchAssignedMainTasksForMentorship(selectedMentorship.id);
        }
  
        await fetchMentorships();
        fetchAssignedMainTasks(searchMenteeName, searchChecklistTitle, currentPage);
        calculateMentorshipCounts();
        setIsConfirmMainTaskDialogOpen(false);
      } catch (err) {
        console.error("Failed to update main task status:", err);
        setError("Failed to update main task status");
      }
    };
  
    const assignedMainTaskRows = assignedMainTasks.map((task) => {
      const hasSubTasks = assignedSubTasks.some((subTask) => subTask.assigned_main_tasks_id === task.id);
      const allSubTasksCompleted = assignedSubTasks
        .filter((subTask) => subTask.assigned_main_tasks_id === task.id)
        .every((subTask) => subTask.status === "completed");
  
      let status;
      if (!hasSubTasks) {
        status = task.status === "completed" ? "Completed" : "Not Started";
      } else {
        if (allSubTasksCompleted) {
          status = "Completed";
        } else if (
          assignedSubTasks.some(
            (subTask) => subTask.assigned_main_tasks_id === task.id && subTask.status === "in_progress" || subTask.status == "not_started"
          )
        ) {
          status = "In Progress";
        } else {
          status = "Not Started";
        }
      }
  
      const isCompleted = status === "Completed";
      const completionDate = isCompleted
        ? new Date(task.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : null;
  
      return {
        cells: [
          { value: task.id },
          { value: task.mentee_name },
          {
            value: (
              <a href={task.main_task_attachments?.[0]?.url} target="_blank" rel="noopener noreferrer">
                {task.main_task_name}
              </a>
            ),
          },
          {
            value: (
              <div>
                {status === "Not Started" && (
                  <StatusIcon mt={0.5} ml={1} type="done" marginRight marginBottom>
                    Not Started
                  </StatusIcon>
                )}
                {status === "In Progress" && (
                  <StatusIcon mt={0.5} ml={1} type="progress" marginRight marginBottom>
                    In Progress
                  </StatusIcon>
                )}
                {status === "Completed" && (
                  <StatusIcon mt={0.5} ml={1} type="emphasis" marginRight marginBottom>
                    Completed
                  </StatusIcon>
                )}
              </div>
            ),
            alignCenter: true,
          },
          {
            value: (
              <div>
                {task.submissions?.map((submission, index) => (
                  <div key={index} className="flex items-center mt-2">
                    <a href={submission.url} target="_blank" rel="noopener noreferrer">
                      {submission.filename}
                    </a>
                    <Button
                      onClick={() => handleRemoveMainTaskSubmission(submission.id, submission.filename, task)}
                      small
                      danger
                      ml={2}
                      disabled={isCompleted}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ),
            alignCenter: true,
          },
          {
            value: isCompleted ? (
              <div>
              Completed on: {completionDate}
              {hasSubTasks && (
                <Button
                  onClick={() => {
                    setSelectedMainTask(task);
                    fetchAssignedSubTasks(task.id);
                    setIsSubTaskModalOpen(true);
                  }}
                  small
                  ml={2}
                >
                  View Sub Tasks
                </Button>
              )}
            </div>
            ) : (
              <div>
                {hasSubTasks ? (
                  <Button
                    onClick={() => {
                      setSelectedMainTask(task);
                      fetchAssignedSubTasks(task.id);
                      setIsSubTaskModalOpen(true);
                    }}
                    small
                  >
                    View Sub Tasks
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setSelectedMainTask(task);
                        setIsMainTaskSubmissionDialogOpen(true);
                      }}
                      small
                      appearance="primary"
                    >
                      Upload Submission
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedMainTask(task);
                        setIsConfirmMainTaskDialogOpen(true);
                      }}
                      small
                      appearance="primary"
                      ml={0.5}
                    >
                      Complete
                    </Button>
                  </>
                )}
              </div>
            ),
            alignRight: true,
          },
        ],
      };
    });
  
    return (
      <div>
        {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
        {error && <FloatingMessageBlock error>{error}</FloatingMessageBlock>}
        {successMessage && <FloatingMessageBlock success>{successMessage}</FloatingMessageBlock>}
        <PageTitle mt={1} ml={1}>
          Mentorships
        </PageTitle>
        <GridWrapper marginTop>
          <GridBlock size="oneThird">
            <CardBase marginLeft>
              <SubSectionTitle textAlign="left">{inProgressMentorships}</SubSectionTitle>
              <StatusIcon type="progress">In Progress</StatusIcon>
            </CardBase>
          </GridBlock>
          <GridBlock size="oneThird">
            <CardBase>
              <SubSectionTitle textAlign="left">{completedMentorships}</SubSectionTitle>
              <StatusIcon type="emphasis">Completed</StatusIcon>
            </CardBase>
          </GridBlock>
          <GridBlock size="oneThird">
            <CardBase marginRight>
              <SubSectionTitle textAlign="left">{pendingMentorships}</SubSectionTitle>
              <StatusIcon type="done">Not Started</StatusIcon>
            </CardBase>
          </GridBlock>
        </GridWrapper>
        <Stack direction="horizontal">
          <FormControl mb={0.5} ml={1} label={"Mentee Name"}>
            <SearchField
              id="search-mentee"
              label="Search"
              placeholder="Search by Mentee Name"
              name="search-mentee"
              width="medium"
              value={searchMenteeName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchMenteeName(e.target.value)}
            />
          </FormControl>
          <FormControl mb={0.5} ml={1} label={"Onboarding Checklist Title"}>
            <SearchField
              id="search-checklist"
              label="Search"
              placeholder="Search by Onboarding Checklist Title"
              name="search-checklist"
              width="medium"
              value={searchChecklistTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChecklistTitle(e.target.value)}
            />
          </FormControl>
        </Stack>
        <ListTable mt={2} headers={menteeHeaders} rows={assignedMainTaskRows} />
        <Pager currentPage={currentPage} pageCount={totalPages} onPageChange={handlePageChange} mt={1} ml={1} />
        <FullScreenModal
          id="assigned-sub-tasks-modal"
          isOpen={isSubTaskModalOpen}
          title={`Sub Tasks for ${selectedMainTask?.main_task_name}`}
          contentLabel="Assigned Sub Tasks Modal"
          onRequestClose={() => setIsSubTaskModalOpen(false)}
          disabled={false}
          shouldCloseOnEsc={true}
        >
          <Breadcrumbs
            label="Navigation"
            links={[
              {
                title: "Assigned Onboarding Checklists",
                onClick: () => {
                  setIsSubTaskModalOpen(false);
                  setIsModalOpen(true);
                },
              },
              {
                title: "Assigned Sub Tasks",
              },
            ]}
            marginSize="xxLarge"
          />
          <PageTitle mt={1}>{selectedMainTask?.main_task_name} for {selectedMainTask?.mentee_name}</PageTitle>
          <SectionTitle mt={0.5}>{selectedMainTask?.main_task_description}</SectionTitle>
          <Paragraph mt={0.5}>
                Deadline: {selectedMainTask?.main_task_deadline ? new Date(selectedMainTask.main_task_deadline).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
            </Paragraph>
          <ListTable
            mt={1}
            headers={[
              { value: "ID" },
              { value: "Title" },
              { value: "Description" },
              { value: "Deadline" },
              { value: "Submissions" },
              { value: "Status" },
              { value: "" },
            ]}
            rows={assignedSubTasks.map((task) => {
              let statusIcon;
              if (task.status === "completed") {
                statusIcon = (
                  <StatusIcon mt={1} type="emphasis" marginRight marginBottom>
                    Completed
                  </StatusIcon>
                );
              } else if (task.status === "pending") {
                statusIcon = (
                  <StatusIcon mt={1} type="disabled" marginRight marginBottom>
                    Pending
                  </StatusIcon>
                );
              } else if (task.status === "in_progress") {
                statusIcon = (
                  <StatusIcon mt={1} type="progress" marginRight marginBottom>
                    In Progress
                  </StatusIcon>
                );
              }
  
              return {
                cells: [
                  { value: task.id },
                  {
                    value: (
                      <a href={task.sub_task_attachments?.[0]?.url} target="_blank" rel="noopener noreferrer">
                        {task.sub_task_name}
                      </a>
                    ),
                  },
                  { value: task.sub_task_description || "N/A" },
                  {
                    value: task.sub_task_deadline ? (
                      new Date(task.sub_task_deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    ) : (
                      "N/A" 
                    ),
                  },
                  {
                    value: (
                      <div>
                        {task.submissions?.map((submission, index) => (
                          <div key={index} className="flex items-center mt-2">
                            <a href={submission.url} target="_blank" rel="noopener noreferrer">
                              {submission.filename}
                            </a>
                            <Button
                              onClick={() => handleRemoveSubTaskSubmission(submission.id, submission.filename, task)}
                              small
                              danger
                              ml={2}
                              disabled={task.status === "completed"}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  { value: statusIcon },
                  {
                    value: (
                      <div>
                        <Button
                          onClick={() => {
                            setSelectedSubTask(task);
                            setIsSubTaskSubmissionDialogOpen(true);
                          }}
                          small
                          appearance="primary"
                          disabled={task.status === "completed"}
                        >
                          Upload Submissions
                        </Button>
                        <Button
                          ml={0.5}
                          onClick={() => {
                            setSelectedSubTask(task);
                            setIsConfirmSubTaskDialogOpen(true);
                          }}
                          small
                          appearance="primary"
                          disabled={task.status === "completed"}
                        >
                          Submit
                        </Button>
                      </div>
                    ),
                  },
                ],
              };
            })}
          />
        </FullScreenModal>
        <TaskDialog
          id="main-task-submission-dialog"
          isOpen={isMainTaskSubmissionDialogOpen}
          title="Upload Submissions"
          onRequestClose={() => setIsMainTaskSubmissionDialogOpen(false)}
          closeButtonLabel="Cancel"
          primaryButtonLabel="Submit"
          onPrimaryAction={handleSubmitMainTaskSubmissions}
          shouldCloseOnOverlayClickOrEsc={true}
        >
          <FormControl label="Submissions" fieldId="main-task-submissions">
            <FileUploader
              fileLabel="Submissions"
              multiple={true}
              onFileSelect={handleFileUpload}
              processingMessage="Uploading..."
            />
            {newSubmissionFiles.map((file, index) => (
              <div key={index} className="flex items-center mt-2">
                <span>{file.name}</span>
                <Button
                  onClick={() => {
                    const updatedFiles = newSubmissionFiles.filter((_, i) => i !== index);
                    setNewSubmissionFiles(updatedFiles);
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
        <TaskDialog
          id="sub-task-submission-dialog"
          isOpen={isSubTaskSubmissionDialogOpen}
          title="Upload Submissions"
          onRequestClose={() => setIsSubTaskSubmissionDialogOpen(false)}
          closeButtonLabel="Cancel"
          primaryButtonLabel="Submit"
          onPrimaryAction={handleSubmitSubTaskSubmissions}
          shouldCloseOnOverlayClickOrEsc={true}
        >
          <FormControl label="Submissions" fieldId="sub-task-submissions">
            <FileUploader
              fileLabel="Submissions"
              multiple={true}
              onFileSelect={handleFileUpload}
              processingMessage="Uploading..."
            />
            {newSubmissionFiles.map((file, index) => (
              <div key={index} className="flex items-center mt-2">
                <span>{file.name}</span>
                <Button
                  onClick={() => {
                    const updatedFiles = newSubmissionFiles.filter((_, i) => i !== index);
                    setNewSubmissionFiles(updatedFiles);
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
        <TaskDialog
          id="confirm-sub-task-dialog"
          isOpen={isConfirmSubTaskDialogOpen}
          title="Confirm Sub Task Completion"
          onRequestClose={() => setIsConfirmSubTaskDialogOpen(false)}
          closeButtonLabel="Cancel"
          primaryButtonLabel="Confirm"
          onPrimaryAction={handleConfirmSubTaskCompletion}
          shouldCloseOnOverlayClickOrEsc={true}
        >
          <Paragraph>Are you sure you want to mark this sub task as completed?</Paragraph>
        </TaskDialog>
        <TaskDialog
          id="confirm-main-task-dialog"
          isOpen={isConfirmMainTaskDialogOpen}
          title="Confirm Main Task Completion"
          onRequestClose={() => setIsConfirmMainTaskDialogOpen(false)}
          closeButtonLabel="Cancel"
          primaryButtonLabel="Confirm"
          onPrimaryAction={handleConfirmMainTaskCompletion}
          shouldCloseOnOverlayClickOrEsc={true}
        >
          <Paragraph>Are you sure you want to mark this main task as completed?</Paragraph>
        </TaskDialog>
      </div>
    );
  };
  
  export default Mentorships;