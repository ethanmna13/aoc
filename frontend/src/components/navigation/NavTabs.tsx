import { MdSupervisedUserCircle, MdOutlineFactCheck, MdOutlinePeopleOutline } from "react-icons/md";

import { GlobalNavi } from "@freee_jp/vibes";

import { useLocation } from "react-router";

interface NavTabsProps {
  role: number;
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
        url: "/admin/onboarding-checklists",
        IconComponent: MdOutlineFactCheck,
        current: location.pathname == "/admin/onboarding-checklists" ? true : false,
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
        url: "/mentor/onboard-checklists",
        IconComponent: MdOutlinePeopleOutline,
        current: location.pathname == "/mentor/onboard-checklists" ? true : false,
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

  if (role == 1) navLinks = mentorNavLinks;
  if (role == 2) navLinks = menteeNavLinks;
  if (role == 0) navLinks = adminNavLinks;


  return <GlobalNavi hideHelpForm links={navLinks} />;
}

export default NavTabs;