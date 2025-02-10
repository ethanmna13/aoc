import NavHeader from "./NavHeader";
import NavTabs from "./NavTabs";

interface NavBarProps {
  name: string;
  role: number;
}

function NavBar({ name, role }: NavBarProps) {
  return (
    <div id="navbar">
      <NavHeader name={name} />
      <NavTabs role={role} />
    </div>
  );
}

export default NavBar;