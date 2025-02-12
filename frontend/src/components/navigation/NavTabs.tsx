import { MdSupervisedUserCircle, MdOutlineFactCheck, MdOutlinePeopleOutline } from "react-icons/md";

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
        title: "Mentorships",
        url: "/admin/mentorship",
        IconComponent: MdSupervisedUserCircle,
        current: location.pathname == "/admin/mentorship" ? true : false,
    },
  ];

  const mentorNavLinks = [
    {
        title: "Onboarding Checklists",
        url: "/mentor/main-tasks",
        IconComponent: MdOutlinePeopleOutline,
        current: location.pathname == "/mentor/main-tasks" ? true : false,
    },
    {
        title: "My Mentees",
        url: "/mentor/view-mentees",
        IconComponent: MdOutlinePeopleOutline,
        current: location.pathname == "/mentor/mentees" ? true : false,
    }
  ];

  const menteeNavLinks = [
    {
        title: "My Mentors",
        url: "/mentee/view-mentors",
        IconComponent: MdOutlinePeopleOutline,
        current: location.pathname == "/mentee/view-mentors" ? true : false,
    },
    {
        title: "To DO",
        url: "/todos",
        IconComponent: MdOutlinePeopleOutline,
        current: location.pathname == "/todos" ? true : false,
    }
  ];

  let navLinks;

  if (role == "mentor") navLinks = mentorNavLinks;
  if (role == "mentee") navLinks = menteeNavLinks;
  if (role == "admin") navLinks = adminNavLinks;


  return <GlobalNavi hideHelpForm links={navLinks} />;
}

export default NavTabs;