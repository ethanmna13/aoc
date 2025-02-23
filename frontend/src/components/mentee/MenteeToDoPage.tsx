import { Breadcrumbs, Button, CardBase, FileUploader, FloatingMessageBlock, FormControl, FullScreenModal, GridBlock, GridWrapper, ListTable, PageTitle, Paragraph, SectionTitle, StatusIcon, SubSectionTitle, TableHeader, TaskDialog } from "@freee_jp/vibes";
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
    id: number;
    mentorships_id: number;
    mentorship_name: string;
    main_task_id: number;
    main_task_name: string;
    main_task_description: string,
    main_task_deadline: string,
    main_task_created_by: string,
    status: string;
}

interface AssignedSubTask {
    id: number;
    mentorships_id: number;
    mentorship_name: string;
    assigned_main_tasks_id: number;
    sub_task_id: number;
    sub_task_name: string;
    sub_task_description: string;
    sub_task_deadline: string;
    sub_task_attachments: { url: string; filename: string }[];
    status: string;
    submissions?: {id: number; url: string; filename: string }[];
}

const mentorHeaders: TableHeader[] = [
    { value: 'Name', ordering: 'asc' },
    { value: 'Email' },
    { value: '# of Tasks' },
    { value: 'Status' }
];

const MenteeDashboard = () => {
    const [currentUser, setCurrentUser] = useState<CustomJwtPayload | null>(null);
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [mentorships, setMentorships] = useState<Mentorship[]>([]);
    const [assignedSubTasks, setAssignedSubTasks] = useState<AssignedSubTask[]>([]);
    const [assignedMainTasks, setAssignedMainTasks] = useState<AssignedMainTask[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMentorship, setSelectedMentorship] = useState<Mentorship | null>(null);
    const [modalAssignedMainTasks, setModalAssignedMainTasks] = useState<AssignedMainTask[]>([]);
    const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
    const [selectedMainTask, setSelectedMainTask] = useState<AssignedMainTask | null>(null);
    const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
    const [selectedSubTask, setSelectedSubTask] = useState<AssignedSubTask | null>(null);
    const [newSubmissionFiles, setNewSubmissionFiles] = useState<File[]>([]);
    const [isConfirmSubTaskDialogOpen, setIsConfirmSubTaskDialogOpen] = useState(false);
    const [isConfirmMainTaskDialogOpen, setIsConfirmMainTaskDialogOpen] = useState(false);
    const navigate = useNavigate();
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

                if (decodedToken.role !== "mentee") {
                    setError("Unauthorized");
                    navigate('/unauthorized');
                } else {
                    console.log(decodedToken.sub);
                    await fetchMentorships();
                    await fetchAssignedMainTasks();
                }
            } catch {
                setError(`You are not logged in.`);
                navigate('/sign_in');
            }
        };
        fetchCurrentUser();
    }, [navigate]);

    useEffect(() => {
        if (currentUser) {
            fetchMentorships();
            fetchAssignedMainTasks();
        }
    }, [currentUser]);

    const fetchMentorships = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/v1/mentorships", {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            });

            const menteeMentorships = response.data.filter((mentorship: Mentorship) => mentorship.mentee_id === currentUser?.sub);
            setMentorships(menteeMentorships);

        } catch {
            setError("Failed to fetch mentorships");
        }
    };


    const fetchAssignedSubTasks = async (assignedMainTaskId: number) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/assigned_main_tasks/${assignedMainTaskId}/assigned_sub_tasks`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            });
            setAssignedSubTasks(response.data);
        } catch {
            setError("Failed to fetch assigned sub tasks");
        }
    };

    const fetchAssignedMainTasks = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/v1/assigned_main_tasks", {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            });
            setAssignedMainTasks(response.data);
        } catch {
            setError("Failed to fetch assigned main tasks");
        }
    };

    const fetchAssignedMainTasksForMentorship = async (mentorshipId: number) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/assigned_main_tasks?mentorships_id=${mentorshipId}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            });
            setModalAssignedMainTasks(response.data);
        } catch {
            setError("Failed to fetch assigned main tasks for the selected mentorship");
        }
    };

    const calculateMentorshipStatus = (mentorship: Mentorship) => {
        const mentorMainTasks = assignedMainTasks.filter(task => task.mentorships_id === mentorship.id);
        const mentorSubTasks = assignedSubTasks.filter(task => task.mentorships_id === mentorship.id);
        
        const allTasks = [...mentorMainTasks, ...mentorSubTasks];
    
        if (allTasks.length === 0) {
            return 'Pending';
        }

        if (allTasks.some(task => task.status === 'pending')) {
            return 'Pending';
        }
    
        if (allTasks.some(task => task.status === 'in_progress')) {
            return 'In Progress';
        }
    
        if (allTasks.every(task => task.status === 'completed')) {
            return 'Completed';
        }
    
        return 'Pending';
    };

    const calculateMentorshipCounts = () => {
        const menteeMentorships = mentorships.filter(mentorship => mentorship.mentee_id === currentUser?.sub);
    
        const pendingMentorships = menteeMentorships.filter(mentorship => calculateMentorshipStatus(mentorship) === 'Pending').length;
        const inProgressMentorships = menteeMentorships.filter(mentorship => calculateMentorshipStatus(mentorship) === 'In Progress').length;
        const completedMentorships = menteeMentorships.filter(mentorship => calculateMentorshipStatus(mentorship) === 'Completed').length;
        const totalMentorships = menteeMentorships.length;
    
        return { pendingMentorships, inProgressMentorships, completedMentorships, totalMentorships };
    };

    const mentorRows = mentorships
        .filter(mentorship => mentorship.mentee_id === currentUser?.sub)
        .map(mentorship => {
            const mentorshipStatus = calculateMentorshipStatus(mentorship);
            const mentorMainTasks = assignedMainTasks.filter(task => task.mentorships_id === mentorship.id);
            const mentorSubTasks = assignedSubTasks.filter(task => task.mentorships_id === mentorship.id);
            const totalTasks = mentorMainTasks.length + mentorSubTasks.length;

            let statusIcon;
            if (mentorshipStatus === 'Completed') {
                statusIcon = (
                    <StatusIcon mt={1} type="emphasis" marginRight marginBottom>
                        Completed
                    </StatusIcon>
                );
            } else if (mentorshipStatus === 'Pending') {
                statusIcon = (
                    <StatusIcon mt={1} type="disabled" marginRight marginBottom>
                        Pending
                    </StatusIcon>
                );
            } else if (mentorshipStatus === 'In Progress') {
                statusIcon = (
                    <StatusIcon mt={1} type="progress" marginRight marginBottom>
                        In Progress
                    </StatusIcon>
                );
            }

            return {
                cells: [
                    { value: mentorship.mentor_name },
                    { value: mentorship.mentor_email },
                    { value: totalTasks },
                    { value: statusIcon },
                ],
                onClick: () => {
                    setSelectedMentorship(mentorship);
                    fetchAssignedMainTasksForMentorship(mentorship.id);
                    setIsModalOpen(true);
                }
            };
        });

    const { pendingMentorships, inProgressMentorships, completedMentorships, totalMentorships } = calculateMentorshipCounts();

    const handleMainTaskClick = async (mainTask: AssignedMainTask) => {
        setSelectedMainTask(mainTask);
        setAssignedSubTasks([]); 
        await fetchAssignedSubTasks(mainTask.id); 
        setIsSubTaskModalOpen(true);
    };

    const handleFileUpload = (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        setNewSubmissionFiles(fileArray);
    };

    const handleRemoveSubmission = async (submissionId: number, filename: string, task: AssignedSubTask) => {
        setSelectedSubTask(task);
        if (!selectedMainTask || !task) {
            return;
        }
    
        try {
            const payload = {
                assigned_sub_task: {
                    remove_submission_ids: [submissionId],
                },
            };
    
            await axios.put(
                `http://localhost:3000/api/v1/assigned_main_tasks/${selectedMainTask.id}/assigned_sub_tasks/${task.id}`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            setSuccessMessage(`Submission "${filename}" removed successfully`);
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchAssignedSubTasks(selectedMainTask.id);
        } catch (err) {
            console.error("Failed to remove submission:", err);
            setError("Failed to remove submission");
        }
    };

    const handleSubmitSubmissions = async () => {
        if (!selectedMainTask || !selectedSubTask) return;

        const formData = new FormData();
        newSubmissionFiles.forEach((file) => {
            formData.append('assigned_sub_task[submissions][]', file);
        });

        try {
            await axios.put(
                `http://localhost:3000/api/v1/assigned_main_tasks/${selectedMainTask.id}/assigned_sub_tasks/${selectedSubTask.id}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setSuccessMessage("Submissions updated successfully");
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchAssignedSubTasks(selectedMainTask.id);
            setNewSubmissionFiles([]);
            setIsSubmissionDialogOpen(false);
        } catch (err) {
            console.error("Failed to update submissions:", err);
            setError("Failed to update submissions");
        }
    };

    const handleConfirmSubTaskCompletion = async () => {
        if (!selectedSubTask) return;
    
        try {
            const payload = {
                assigned_sub_task: {
                    status: 'completed',
                },
            };
    
            await axios.put(
                `http://localhost:3000/api/v1/assigned_main_tasks/${selectedMainTask?.id}/assigned_sub_tasks/${selectedSubTask.id}`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            setSuccessMessage("Sub task marked as completed successfully");
            setTimeout(() => setSuccessMessage(""), 3000);
    
            if (selectedMainTask) {
                await fetchAssignedSubTasks(selectedMainTask.id);
            }
    
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
                status: 'completed',
            };
    
            await axios.patch(
                `http://localhost:3000/api/v1/assigned_main_tasks/${selectedMainTask.id}`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            setSuccessMessage("Main task marked as completed successfully");
            setTimeout(() => setSuccessMessage(""), 3000);
    
            if (selectedMentorship) {
                await fetchAssignedMainTasksForMentorship(selectedMentorship.id);
            }

            await fetchMentorships();
    
            setIsConfirmMainTaskDialogOpen(false);
        } catch (err) {
            console.error("Failed to update main task status:", err);
            setError("Failed to update main task status");
        }
    };

    const areAllSubTasksCompleted = (mainTaskId: number) => {
        const subTasks = assignedSubTasks.filter(task => task.assigned_main_tasks_id === mainTaskId);
        return subTasks.every(task => task.status === 'completed');
    };


    return (
        <div>
            {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
            {error && (<FloatingMessageBlock error>{error}</FloatingMessageBlock>)}
            {successMessage && (<FloatingMessageBlock success>{successMessage}</FloatingMessageBlock>)}
            <PageTitle mt={1} ml={1}>Welcome to LiKHA, {currentUser?.name}!</PageTitle>
            <Paragraph  ml={1}>Here's a summary of your current mentorships</Paragraph>
            <GridWrapper marginTop>
                <GridBlock size="oneThird">
                    <CardBase marginLeft>
                        <SubSectionTitle textAlign="left">{pendingMentorships}</SubSectionTitle>
                        <SectionTitle textAlign="left" headlineLevel={6}>Pending Mentorships</SectionTitle>
                    </CardBase>
                </GridBlock>
                <GridBlock size="oneThird">
                    <CardBase>
                        <SubSectionTitle textAlign="left">{inProgressMentorships}</SubSectionTitle>
                        <SectionTitle textAlign="left" headlineLevel={6}>In Progress Mentorships</SectionTitle>
                    </CardBase>
                </GridBlock>
                <GridBlock size="oneThird">
                    <CardBase marginRight>
                        <SubSectionTitle textAlign="left">{completedMentorships}/{totalMentorships}</SubSectionTitle>
                        <SectionTitle textAlign="left" headlineLevel={6}>Completed Mentorships</SectionTitle>
                    </CardBase>
                </GridBlock>
            </GridWrapper>
            <PageTitle mt={1} ml={1} mb={1}>Your Mentors</PageTitle>
            <ListTable headers={mentorHeaders} rows={mentorRows} />
            <FullScreenModal
                id="assigned-tasks-modal"
                isOpen={isModalOpen}
                title="Assigned Main Tasks"
                contentLabel="Assigned Main Tasks Modal"
                onRequestClose={() => setIsModalOpen(false)}
                disabled={false}
                shouldCloseOnEsc={true}
            >
                <Breadcrumbs
                    label="Navigation"
                    links={[
                        {
                            title: 'Mentors',
                            onClick: () => setIsModalOpen(false),
                        },
                        {
                            title: 'Assigned Main Tasks',
                        },
                    ]}
                    marginSize="xxLarge"
                />
                <ListTable ma={1}
                    headers={[
                        { value: 'Name' },
                        { value: 'Description' },
                        { value: 'Deadline' },
                        { value: 'Created By' },
                        { value: 'Status' },
                        { value: 'Actions' }
                    ]}
                    rows={modalAssignedMainTasks.map(task => {
                        let statusIcon;
                        if (task.status === 'completed') {
                            statusIcon = (
                                <StatusIcon mt={1} type="emphasis" marginRight marginBottom>
                                    Completed
                                </StatusIcon>
                            );
                        } else if (task.status === 'pending') {
                            statusIcon = (
                                <StatusIcon mt={1} type="disabled" marginRight marginBottom>
                                    Pending
                                </StatusIcon>
                            );
                        } else if (task.status === 'in_progress') {
                            statusIcon = (
                                <StatusIcon mt={1} type="progress" marginRight marginBottom>
                                    In Progress
                                </StatusIcon>
                            );
                        }

                        return {
                            cells: [
                                { value: task.main_task_name },
                                { value: task.main_task_description || 'N/A' },
                                { value: task.main_task_deadline || 'N/A' },
                                { value: task.main_task_created_by || 'N/A' },
                                { value: statusIcon },
                                {
                                    value: (
                                        <Button
                                            onClick={() => {
                                                setSelectedMainTask(task);
                                                setIsConfirmMainTaskDialogOpen(true);
                                            }}
                                            small
                                            appearance="primary"
                                            disabled={!areAllSubTasksCompleted(task.id) || task.status === 'completed'}
                                        >
                                            Submit
                                        </Button>
                                    )
                                }
                            ],
                            onClick: () => handleMainTaskClick(task)
                        };
                    })}
                />
            </FullScreenModal>
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
                            title: 'Mentors',
                            onClick: () => setIsModalOpen(false),
                        },
                        {
                            title: 'Assigned Main Tasks',
                            onClick: () => {
                                setIsSubTaskModalOpen(false);
                                setIsModalOpen(true);
                            },
                        },
                        {
                            title: 'Assigned Sub Tasks',
                        },
                    ]}
                    marginSize="xxLarge"
                />
                <ListTable ma={1}
                    headers={[
                        { value: 'Name' },
                        { value: 'Description' },
                        { value: 'Deadline' },
                        { value: 'Attachments' },
                        { value: 'Submissions' },
                        { value: 'Status' },
                        { value: 'Actions' }
                    ]}
                    rows={assignedSubTasks.map(task => {
                        let statusIcon;
                        if (task.status === 'completed') {
                            statusIcon = (
                                <StatusIcon mt={1} type="emphasis" marginRight marginBottom>
                                    Completed
                                </StatusIcon>
                            );
                        } else if (task.status === 'pending') {
                            statusIcon = (
                                <StatusIcon mt={1} type="disabled" marginRight marginBottom>
                                    Pending
                                </StatusIcon>
                            );
                        } else if (task.status === 'in_progress') {
                            statusIcon = (
                                <StatusIcon mt={1} type="progress" marginRight marginBottom>
                                    In Progress
                                </StatusIcon>
                            );
                        }

                        return {
                            cells: [
                                { value: task.sub_task_name },
                                { value: task.sub_task_description || 'N/A' },
                                { value: task.sub_task_deadline || 'N/A' },
                                {
                                    value: (
                                        <div>
                                            {task.sub_task_attachments?.map((attachment, index) => (
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
                                    )
                                },
                                {
                                    value: (
                                        <div>
                                            {task.submissions?.map((submission, index) => (
                                                <div key={index} className="flex items-center mt-2">
                                                    <a
                                                        href={submission.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {submission.filename}
                                                    </a>
                                                    <Button
                                                        onClick={() => {handleRemoveSubmission(submission.id, submission.filename, task)}
                                                        }
                                                        small
                                                        danger
                                                        ml={2}
                                                        disabled={task.status === 'completed'}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                },
                                { value: statusIcon },
                                {
                                    value: (
                                        <div>
                                            <Button
                                                onClick={() => {
                                                    setSelectedSubTask(task);
                                                    setIsSubmissionDialogOpen(true);
                                                }}
                                                small
                                                appearance="primary"
                                                disabled={task.status === 'completed'}
                                            >
                                                Upload Submissions
                                            </Button>
                                            <Button ml={0.5}
                                                onClick={() => {
                                                    setSelectedSubTask(task);
                                                    setIsConfirmSubTaskDialogOpen(true);
                                                }}
                                                small
                                                appearance="primary"
                                                disabled={task.status === 'completed'}
                                            >
                                                Submit
                                            </Button>
                                        </div>
                                    ),
                                }
                            ]
                        };
                    })}
                />
            </FullScreenModal>
            <TaskDialog
                id="submission-dialog"
                isOpen={isSubmissionDialogOpen}
                title="Upload Submissions"
                onRequestClose={() => setIsSubmissionDialogOpen(false)}
                closeButtonLabel="Cancel"
                primaryButtonLabel="Submit"
                onPrimaryAction={handleSubmitSubmissions}
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

export default MenteeDashboard;