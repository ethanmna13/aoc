import likhaLogo from "../../assets/images/header_likhait-freee-logo.png";
import { MdLogout } from "react-icons/md";
import { Header, Paragraph, Button, Stack } from "@freee_jp/vibes";
import axios from "axios";

interface NavHeaderProps {
  name: string;
}

function NavHeader({ name }: NavHeaderProps) {
    const handleLogout = async () => {
        try {
          const response = await axios.delete("http://localhost:3000/api/v1/users/sign_out", {
            withCredentials: true,
          });
          if (response.status === 200) {
            window.location.href = '/'; 
          }
        } catch (err) {
          ("Failed to log out");
        }
      };
  return (
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
  );
}

export default NavHeader;