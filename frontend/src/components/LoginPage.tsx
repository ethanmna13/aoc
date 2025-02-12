import { Button, FormControlLabel, PageTitle, Paragraph, TextField } from "@freee_jp/vibes";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        navigate('/admin/users');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.message);
    }
  };

  return (
    <div>
      <div>
        <img
          className="mx-auto h-12 w-auto"
          src="https://likhait.com/wp-content/themes/likhait/assets/media/common/header_likhait-freee-logo.png"
          alt="Workflow"
        />
        <PageTitle>FreeeBoarding</PageTitle>
        <Paragraph>Sign in to your account</Paragraph>
      </div>
      <div id="login-form">
        <FormControlLabel htmlFor="email">Email</FormControlLabel>
        <TextField
          id="email"
          width="large"
          type="email"
          required={true}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormControlLabel htmlFor="password">Password</FormControlLabel>
        <TextField
          id="password"
          width="large"
          type="password"
          required={true}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <Button onClick={handleSubmit} appearance="primary" width="default">
        Log in
      </Button>
    </div>
  );
};

export default LoginPage;