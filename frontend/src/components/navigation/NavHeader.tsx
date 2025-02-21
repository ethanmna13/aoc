import likhaLogo from "../../assets/images/header_likhait-freee-logo.png";
import { MdLogout } from "react-icons/md";
import { Header, Paragraph, Button, Stack, FloatingMessageBlock } from "@freee_jp/vibes";
import axios from "axios";
import { useState } from "react";

interface NavHeaderProps {
  name: string;
}

function NavHeader({ name }: NavHeaderProps) {
    const [error, setError] = useState<string>("");
    const handleLogout = async () => {
        try {
          const response = await axios.delete("http://localhost:3000/api/v1/users/sign_out", {
            withCredentials: true,
          });
          if (response.status === 200) {
            localStorage.clear();
            sessionStorage.clear(); 
            window.location.href = '/'; 
          }
        } catch {
          setError("Failed to log out");
        }
      };
  return (
    <div>
    {error && (<FloatingMessageBlock error>{error}</FloatingMessageBlock>)}
    <Header
      logo={<img src={likhaLogo} width="315px" height="40px"></img>}
      sectionNode={
        <Stack direction="horizontal">
          <Paragraph>Welcome, {name}!</Paragraph>
          <Button
            appearance="tertiary"
            IconComponent={MdLogout}
            onClick={handleLogout}
          ></Button>
        </Stack>
      }
    />
    </div>
  );
}

export default NavHeader;