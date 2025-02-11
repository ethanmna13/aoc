import { Button, PageTitle, Paragraph } from "@freee_jp/vibes";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();
  
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-center p-4">
            <div className="flex flex-col items-center space-y-4">
                <img
                    src="https://likhait.com/wp-content/themes/likhait/assets/media/common/header_likhait-freee-logo.png"
                    alt="Logo"
                    className="w-32 h-32"
                />
                <PageTitle>FreeeBoarding</PageTitle>
                <Paragraph>An Automated Onboarding Checklist</Paragraph>
                <Button
                    onClick={() => navigate("/users/sign_in")}
                >
                    Login
                </Button>
            </div>
        </div>
    );
};
  
export default LandingPage;
