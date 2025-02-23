import { Button, CardBase, FloatingMessageBlock, FormControl, PageTitle, Paragraph, TextField } from "@freee_jp/vibes";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import likhalogo from "../assets/images/header_likhait-freee-logo.png";
import { jwtDecode } from 'jwt-decode';
import "./css/Custom.css";

interface CustomJwtPayload {
  id: number;
  role: string;
  name: string;
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/v1/users/sign_in', {
        user: {
          email,
          password,
        },
      }, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      });

      if (response.status === 200) {
        const { token } = response.data;
        console.log(token);

        localStorage.setItem('authToken', token);

        const decoded = jwtDecode<CustomJwtPayload>(token);
        console.log(decoded);

        if (decoded && decoded.role) {
          const userRole = decoded.role.trim().toLowerCase();
          console.log("User Role:", userRole);

          if (userRole === "admin") {
            navigate('/admin/users');
          } else if (userRole === "mentor") {
            navigate('/mentor/mentorships');
          } else if (userRole === "mentee") {
            navigate('/mentee/TODO');
          } else {
            console.log("Redirecting to unauthorized - Role not recognized:", userRole);
            navigate('/unauthorized');
          }
        } else {
          console.log("Missing or invalid role in token");
          navigate('/unauthorized');
        }
      }
    } catch {
      setError("There was an error logging you in. Please try again.");
    }
  };

  return (
    <div className="container">
       {error && (<FloatingMessageBlock error>{error}</FloatingMessageBlock>)}
      <CardBase paddingSize="large">
        <img 
          src={likhalogo}
          alt="Workflow"
          className="custom-logo"
        />
        <PageTitle textAlign="center">FreeeBoarding</PageTitle>
        <Paragraph textAlign="center">Sign in to your account</Paragraph>
        <FormControl label="Email" marginLeft>
          <TextField 
            id="email"
            width="large"
            type="email"
            required={true}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl label="Password" marginLeft>
          <TextField 
            id="password"
            width="large"
            type="password"
            required={true}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="button-container">
          <Button onClick={handleSubmit} appearance="primary" width="default">
            Log in
          </Button>
        </div>
      </CardBase>
    </div>
  );
};

export default LoginPage;
