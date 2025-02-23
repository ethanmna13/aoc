import { CardBase, FloatingMessageBlock, FullScreenModal, GridBlock, GridWrapper, ListTable, PageTitle, Paragraph, SectionTitle, SubSectionTitle, TableHeader } from "@freee_jp/vibes";
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
    submissions?: { url: string; filename: string }[];
}

const menteeHeaders: TableHeader[] = [
    { value: 'Name', ordering: 'asc' },
    { value: 'Email' },
    { value: '# of Tasks' },
    { value: 'Status' }
];

const MentorDashboard = () => {
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

                if (decodedToken.role !== "mentor") {
                    setError("Unauthorized");
                    navigate('/unauthorized');
                } else {
                    console.log(decodedToken.sub);
                    fetchMentorships();
                    fetchAssignedMainTasks();
                }
            } catch {
                setError(`You are not logged in.`);
                navigate('/sign_in');
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

            setMentorships(response.data);
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
        const mentorMentorships = mentorships.filter(mentorship => mentorship.mentor_id === currentUser?.sub);
    
        const pendingMentorships = mentorMentorships.filter(mentorship => calculateMentorshipStatus(mentorship) === 'Pending').length;
        const inProgressMentorships = mentorMentorships.filter(mentorship => calculateMentorshipStatus(mentorship) === 'In Progress').length;
        const completedMentorships = mentorMentorships.filter(mentorship => calculateMentorshipStatus(mentorship) === 'Completed').length;
        const totalMentorships = mentorMentorships.length;
    
        return { pendingMentorships, inProgressMentorships, completedMentorships, totalMentorships };
    };

    const menteeRows = mentorships
        .filter(mentorship => mentorship.mentor_id === currentUser?.sub)
        .map(mentorship => {
            const mentorshipStatus = calculateMentorshipStatus(mentorship);
            const menteeMainTasks = assignedMainTasks.filter(task => task.mentorships_id === mentorship.id);
            const menteeSubTasks = assignedSubTasks.filter(task => task.mentorships_id === mentorship.id);
            const totalTasks = menteeMainTasks.length + menteeSubTasks.length;

            return {
                cells: [
                    { value: mentorship.mentee_name },
                    { value: mentorship.mentee_email },
                    { value: totalTasks },
                    { value: mentorshipStatus },
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

    return (
        <div>
            {currentUser && <NavBar name={currentUser.name} role={currentUser.role} />}
            {error && (<FloatingMessageBlock error>{error}</FloatingMessageBlock>)}
            {successMessage && (<FloatingMessageBlock success>{successMessage}</FloatingMessageBlock>)}
            <PageTitle mt={1} ml={1}>Hello, {currentUser?.name}!</PageTitle>
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
            <PageTitle mt={1} ml={1} mb={1}>Your Mentees</PageTitle>
            <ListTable headers={menteeHeaders} rows={menteeRows} />
            <FullScreenModal
                id="assigned-tasks-modal"
                isOpen={isModalOpen}
                title="Assigned Main Tasks"
                contentLabel="Assigned Main Tasks Modal"
                onRequestClose={() => setIsModalOpen(false)}
                disabled={false}
                shouldCloseOnEsc={true}
            >
                <ListTable ma={1}
                    headers={[
                        { value: 'Name' },
                        { value: 'Description' },
                        { value: 'Deadline' },
                        { value: 'Created By' },
                        { value: 'Status' }
                    ]}
                    rows={modalAssignedMainTasks.map(task => ({
                        cells: [
                            { value: task.main_task_name },
                            { value: task.main_task_description || 'N/A' },
                            { value: task.main_task_deadline || 'N/A' },
                            { value: task.main_task_created_by || 'N/A' },
                            { value: task.status }
                        ],
                        onClick: () => handleMainTaskClick(task)
                    }))}
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
                <ListTable ma={1}
                    headers={[
                        { value: 'Name' },
                        { value: 'Description' },
                        { value: 'Deadline' },
                        { value: 'Attachments' },
                        { value: 'Status' }
                    ]}
                    rows={assignedSubTasks.map(task => ({
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
                            { value: task.status }
                        ]
                    }))}
                />
            </FullScreenModal>
        </div>
    );
};

export default MentorDashboard;