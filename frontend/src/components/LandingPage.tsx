import { Button, CardBase, PageTitle, Paragraph } from "@freee_jp/vibes";
import { useNavigate } from "react-router-dom";
import '../../node_modules/@freee_jp/vibes/vibes_2021.css';
import likhalogo from "../assets/images/header_likhait-freee-logo.png";
import "./css/Custom.css";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="container">
            <CardBase paddingSize="large">
                <img 
                    src={likhalogo}
                    alt="Logo"
                    className="custom-logo"
                />
                <PageTitle ma={0.5} textAlign="center">FreeeBoarding</PageTitle>
                <Paragraph textAlign="center">An Automated Onboarding Checklist</Paragraph>
                <div className="button-container">
                    <Button ma={0.5} appearance="primary" large 
                        onClick={() => navigate("/sign_in")}
                    >
                        Login
                    </Button>
                </div>
            </CardBase>
        </div>
    );
};

export default LandingPage;
