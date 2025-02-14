import { Button, CardBase, Container, DropdownButton, FormControl, FullScreenModal, ListTable, PageTitle, Paragraph, SelectBox, TableHeader } from "@freee_jp/vibes";
import NavBar from "../navigation/NavBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";

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

interface Mentorships {
    id?: number;
    mentor: string;
    mentee: string;
    assignedMainTask: string;
    status: string;
    submissions: File;
}

const mentorHeaders: TableHeader[] = [
  { value: 'User ID', ordering: 'asc' },
  { value: 'Mentor Name', ordering: 'asc' },
  { value: 'Email' }
];

const menteeHeaders: TableHeader[] = [
  { value: 'User ID', ordering: 'asc' },
  { value: 'Mentee Name', ordering: 'asc' },
  { value: 'Email' }
];

const mentorshipHeaders: TableHeader[] = [
  { value: 'Mentorship ID', ordering: 'asc' },
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
    const [isOpen, setOpen] = React.useState<boolean>(false);
    const toggle = () => setOpen(!isOpen);
    const options = ['Main Task 1', 'Main Task 2'];

    useEffect(() => {
        const fetchCurrentUser = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError("No token found, please log in again");
            navigate('/sign_in');
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
                <PageTitle mt={1} ml={1} >Mentorships</PageTitle>
                <Button  mb={1} ml={1} onClick={toggle}>Create</Button>
                <FullScreenModal isOpen={isOpen} title={"Create a Mentorship"} onRequestClose={toggle}>
                    <FormControl label="Select a Mentor" fieldId="selectBox-1">
                        <SelectBox id="selectBox-1" name="selectBox" options={[
                            {
                                name: 'Mentor Name',
                                value: 'Sample'
                            }
                        ]}
                        marginRight/>
                    </FormControl>
                    <FormControl label="Select a Mentee" fieldId="selectBox-1">
                        <SelectBox id="selectBox-1" name="selectBox" options={[
                            {
                                name: 'Mentee Name',
                                value: 'Sample'
                            }
                        ]}
                        marginRight/>
                    </FormControl>
                    <FormControl label="Assign a Main Task" fieldId="selectBox-1">
                        <DropdownButton buttonLabel="eyyy" dropdownContents={options.map((opt, idx) => ({
                            type: 'checkbox',
                            text: opt,
                            
                        }))}/>
                    </FormControl>
                </FullScreenModal>
                <CardBase>
                    <ListTable headers={menteeHeaders} rows={menteeRows}></ListTable>
                </CardBase>
            </Container>
            </div>
        )
}

export default MentorshipPage;