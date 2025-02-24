import { Button, CardBase, FloatingMessageBlock, FormControl, PageTitle, Paragraph, TextField } from "@freee_jp/vibes";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import { RootState, AppDispatch } from "../app/store";
import { useNavigate } from "react-router-dom"; 
import likhalogo from "../assets/images/header_likhait-freee-logo.png";
import "./css/Custom.css";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch: AppDispatch = useDispatch();
  const error = useSelector((state: RootState) => state.auth.error);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const role = await dispatch(login(email, password));

    if (role) {
      if (role === "admin") {
        navigate('/admin/users');
      } else if (role === "mentor") {
        navigate('/mentor/mentorships');
      } else if (role === "mentee") {
        navigate('/mentee/TODO');
      } else {
        navigate('/unauthorized');
      }
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