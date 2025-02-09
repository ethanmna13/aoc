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
                <h1 className="text-3xl font-bold text-gray-900">FreeeBoarding</h1>
                <p className="text-gray-600">An Automated Onboarding Checklist</p>
                <button
                    onClick={() => navigate("/users/sign_in")}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Login
                </button>
            </div>
        </div>
    );
};
  
export default LandingPage;
