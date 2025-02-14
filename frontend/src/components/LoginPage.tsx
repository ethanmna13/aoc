import { Button, CardBase, Container, FormControl, FormControlLabel, PageTitle, Paragraph, TextField } from "@freee_jp/vibes";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import likhalogo from "../assets/images/header_likhait-freee-logo.png";
import "./css/Custom.css";

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
        const { token, user } = response.data;
        console.log(token, user); 
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role == "admin"){ 
          navigate('/admin/users');
        } else if (user.role == "mentor"){
          navigate('/mentor/main-tasks')
        } else if (user.role == "mentee"){
          navigate('/mentee/TODO')
        } else {
          navigate('/unauthorized')
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="container">
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