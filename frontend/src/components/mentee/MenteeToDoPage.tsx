import { Container, PageTitle, Paragraph } from "@freee_jp/vibes";
import NavBar from "../navigation/NavBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const MenteeToDoPage = () => {
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
        <PageTitle>This is the mentee's TODO page</PageTitle>
        <Paragraph>(In Progress)</Paragraph>
        </Container>
        </div>
    )
}

export default MenteeToDoPage;