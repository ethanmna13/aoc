import { Container, PageTitle, Paragraph, TableHeader } from "@freee_jp/vibes";
import NavBar from "../navigation/NavBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const mentorHeaders: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Mentor Name', ordering: 'asc' },
  { value: 'Actions', alignRight: true }
];

const menteeHeaders: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Mentee Name', ordering: 'asc' },
  { value: 'Actions', alignRight: true }
];

const mentorshipHeaders: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Mentor' },
  { value: 'Mentee' },
  { value: 'Assigned Main Tasks' },
  { value: 'Status' },
  { value: 'Submissions' },
  { value: 'Actions', alignRight: true }
];



const MentorshipPage = () => {
    const [currentUser] = useState(localStorage.getItem("user") || "[]");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCurrentUser = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("No token found, please log in again");
            navigate('/users/sign_in');
            return;
        }
        console.log(token);
        console.log(JSON.parse(currentUser));
        };
        fetchCurrentUser();
    }, []);
        return (
            <div>
            <NavBar name={JSON.parse(currentUser).name || ""} role={JSON.parse(currentUser).role || ""} />
            <Container>
            <PageTitle>This is the admin's mentorship page</PageTitle>
            <Paragraph>(In Progress)</Paragraph>
            </Container>
            </div>
        )
}

export default MentorshipPage;