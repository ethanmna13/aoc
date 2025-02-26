import { MdOutlineFactCheck, MdOutlinePeopleOutline, MdCheck } from "react-icons/md";
import { FaUserCheck } from "react-icons/fa";
import { GlobalNavi } from "@freee_jp/vibes";

import { useLocation } from "react-router";

interface NavTabsProps {
  role: string;
}

function NavTabs({ role }: NavTabsProps) {

  const location = useLocation();

  const adminNavLinks = [
    {
        title: "Users",
        url: "/admin/users",
        IconComponent: MdOutlinePeopleOutline,
        current: location.pathname == "/admin/users" ? true : false,
    },
    {
        title: "Onboarding Checklist",
        url: "/admin/main-tasks",
        IconComponent: MdOutlineFactCheck,
        current: location.pathname == "/admin/main-tasks" ? true : false,
    },
    {
        title: "Assign Mentors",
        url: "/admin/mentorships",
        IconComponent: FaUserCheck,
        current: location.pathname == "/admin/mentorships" ? true : false,
    },
    {
      title: "Assign Tasks",
      url: "/admin/assign",
      IconComponent: MdCheck,
      current: location.pathname == "/admin/assign" ? true : false,
    }
  ];

  const mentorNavLinks = [
    {
        title: "Mentorships",
        url: "/mentor/dashboard",
        IconComponent: FaUserCheck,
        current: location.pathname == "/mentor/dashboard" ? true : false,
    }
  ];

  const menteeNavLinks = [
    {
        title: "To Do",
        url: "/mentee/TODO",
        IconComponent: MdOutlinePeopleOutline,
        current: location.pathname == "/mentee/TODO" ? true : false,
    }
  ];

  let navLinks;

  if (role == "mentor") navLinks = mentorNavLinks;
  if (role == "mentee") navLinks = menteeNavLinks;
  if (role == "admin") navLinks = adminNavLinks;


  return <GlobalNavi hideHelpForm links={navLinks} />;
}

export default NavTabs;