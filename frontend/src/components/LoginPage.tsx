import { Button, FormControlLabel, TextField } from "@freee_jp/vibes";
import { useState } from "react";
import axios from "axios";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    

  const handleSubmit = async (e: React.FormEvent) => {
    try {
        const response = await axios.post('http://localhost:3000/api/v1/users/sign_in', {
          user: {
            email,
            password,
          },
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          withCredentials: true,
        });
  
        if (response.status === 200) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          window.location.href = '/admin/users'; 
        }
      } catch (error: any) {
        setError(error.response?.data?.error || 'An error occurred. Please try again.');
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            FreeeBoarding
          </h2>
          <p className="mt-3 text-center text-3xs text-gray-900">
            Sign in to your account
          </p>
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
                    <FormControlLabel htmlFor="password">
                        Password
                    </FormControlLabel>
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