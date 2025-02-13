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
        url: "/admin/mentorships",
        IconComponent: MdSupervisedUserCircle,
        current: location.pathname == "/admin/mentorships" ? true : false,
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
        current: location.pathname == "/mentor/view-mentees" ? true : false,
    },
    {
      title: "To Do Page",
      url: "/mentor/TODO",
      IconComponent: MdOutlinePeopleOutline,
      current: location.pathname == "/mentor/TODO" ? true : false,
  }
  ];

  const menteeNavLinks = [
    {
        title: "To DO",
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