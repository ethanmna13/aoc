import { CardBase, Container, ListTable, PageTitle, Paragraph, TableHeader } from "@freee_jp/vibes";
import NavBar from "../navigation/NavBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Mentors {
  id?: number;
  name: string;
  email: string;
}

interface Mentees {
    id?: number;
    name: string;
    email: string;
  }

const mentorHeaders: TableHeader[] = [
  { value: 'ID', ordering: 'asc' },
  { value: 'Mentor Name', ordering: 'asc' },
  { value: 'Email' }
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
    const [mentors, setMentors] = useState<Mentors[]>([]);
    const [mentee, setMentees] = useState<Mentees[]>([]);

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
        fetchMentors();
        fetchMentees();
        };
        fetchCurrentUser();
    }, []);

    const fetchMentors = async () => {
        const token = localStorage.getItem('authToken');
        try {
          const response = await axios.get("http://localhost:3000/api/v1/mentors", {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          });
          setMentors(response.data);
        } catch (err) {
          setError("Failed to fetch users");
        }
      };

      const fetchMentees = async () => {
        const token = localStorage.getItem('authToken');
        try {
          const response = await axios.get("http://localhost:3000/api/v1/mentees", {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          });
          setMentees(response.data);
        } catch (err) {
          setError("Failed to fetch users");
        }
      };

    const mentorValues = Object.values(mentors);
    const mentorRows = mentorValues.map(mentor => ({
    cells: [
      { value: mentor.id },
      { value: mentor.name },
      { value: mentor.email}
        ],
    }));

    const menteeValues = Object.values(mentee);
    const menteeRows = menteeValues.map(mentee => ({
    cells: [
      { value: mentee.id },
      { value: mentee.name },
      { value: mentee.email}
        ],
    }));
        return (
            <div>
            <NavBar name={JSON.parse(currentUser).name || ""} role={JSON.parse(currentUser).role || ""} />
            <Container >
                <PageTitle ma={1} mb={1}>Mentors</PageTitle>
                <CardBase>
                    <ListTable headers={mentorHeaders} rows={mentorRows}></ListTable>
                </CardBase>
                <PageTitle ma={1} mb={1} >Mentees</PageTitle>
                <CardBase>
                    <ListTable headers={menteeHeaders} rows={menteeRows}></ListTable>
                </CardBase>

            </Container>
            </div>
        )
}

export default MentorshipPage;