"use client";

import React, { useState } from "react";
import { usePage, Link } from "@inertiajs/react";
import {
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Clock,
    Archive,
    CalendarClock,
    ArrowLeftRight,
    UserCircle,
    UserCog,
    LogOut,
    User,
    MapPin,
    LandPlot,
    Plane,
    Building2,
    MapPinned,
    Network,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ApplicationLogo from "./ApplicationLogo";

export function AppSidebar({ active, user, ...props }) {
    const [isAdminOpen, setAdminOpen] = useState(true);
    const [isHROpen, setHROpen] = useState(true);
    const [isEmployeeOpen, setEmployeeOpen] = useState(true);
    const [isServicesOpen, setServicesOpen] = useState(true);

    const { url } = usePage();

    const { auth } = usePage().props;

    console.log("Auth object:", auth);
    console.log("Logged in user:", auth?.user);
    console.log("Employee:", auth?.user?.employee);

    return (
        <Sidebar {...props}>
            <SidebarHeader className="bg-blue-700 p-0">
                <div className="px-5 py-4 pb-5">
                    <div className="border-b border-blue-400 ">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild>
                                    <Link
                                        href="/"
                                        className="flex items-center gap-4 py-11 text-white w-full"
                                    >
                                        <div className="flex size-11 aspect-square items-center justify-center text-primary-foreground">
                                            <ApplicationLogo className="h-11 w-auto" />
                                        </div>
                                        <div className="flex flex-col gap-0.5 leading-tight text-white">
                                            <span className="text-[14px] font-semibold tracking-tight">
                                                TimeVault
                                            </span>
                                            <span className="text-[9px] font-medium uppercase tracking-wide opacity-80 leading-[1rem]">
                                                Securing Attendance and
                                                Tardiness Data with Biometrics
                                            </span>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-blue-700 text-white p-0">
                <div className="px-5">
                    <div className="border-b border-blue-400 pb-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-left text-white px-3 py-2 rounded-md">
                            <MapPin className="h-5 w-5 text-blue-200" />
                            {auth?.user?.employee?.station?.name ||
                                "No Station"}
                        </div>
                    </div>
                </div>
                <SidebarGroup>
                    <SidebarMenu>
                        {/* Administrator */}
                        <SidebarMenuItem>
                            <Button
                                variant="ghost"
                                className="w-full justify-between px-3 py-2 text-left font-semibold hover:bg-blue-900 hover:text-blue-100"
                                onClick={() => setAdminOpen(!isAdminOpen)}
                            >
                                <span className="flex items-center gap-2">
                                    <UserCog className="h-5 w-5" />
                                    Administrator
                                </span>
                                {isAdminOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>

                            {isAdminOpen && (
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                active === "employeemanagement"
                                            }
                                        >
                                            <Link
                                                href={route(
                                                    "employeemanagement",
                                                )}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <UserCog
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "employeemanagement"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Employee Management
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                active ===
                                                "departmentmanagement"
                                            }
                                        >
                                            <Link
                                                href={route(
                                                    "departmentmanagement",
                                                )}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <Building2
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "departmentmanagement"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Organization Management
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                active === "stationmanagement"
                                            }
                                        >
                                            <Link
                                                href={route(
                                                    "stationmanagement",
                                                )}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <LandPlot
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "stationmanagement"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Station Management
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                active ===
                                                "attendancemanagement"
                                            }
                                        >
                                            <Link
                                                href={route(
                                                    "attendancemanagement",
                                                )}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <CalendarDays
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "attendancemanagement"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Attendance Management
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={url.startsWith(
                                                "/dailytimerecord",
                                            )}
                                        >
                                            <Link
                                                href={route("dailytimerecord")}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <Clock
                                                    className={`h-4 w-4 ${
                                                        url.startsWith(
                                                            "/dailytimerecord",
                                                        )
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Daily Time Record
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={url.startsWith(
                                                "/tardysummary",
                                            )}
                                        >
                                            <Link
                                                href={route("tardysummary")}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <CalendarClock
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "tardysummary"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Tardiness Summary
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={url.startsWith(
                                                "/position",
                                            )}
                                        >
                                            <Link
                                                href={route("position.index")}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <Network
                                                    className={`h-4 w-4 ${
                                                        active === "/position"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                List of Positions
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            )}
                        </SidebarMenuItem>

                        {/* Human Resource */}
                        <SidebarMenuItem>
                            <Button
                                variant="ghost"
                                className="w-full justify-between px-3 py-2 text-left font-semibold hover:bg-blue-900 hover:text-blue-100"
                                onClick={() => setHROpen(!isHROpen)}
                            >
                                <span className="flex items-center gap-2">
                                    <UserCircle className="h-5 w-5" />
                                    Human Resource
                                </span>
                                {isHROpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>

                            {isHROpen && (
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                active === "tardyconvertion"
                                            }
                                        >
                                            <Link
                                                href={route("tardyconvertion")}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <ArrowLeftRight
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "tardyconvertion"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Tardiness Convertion
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                active === "tardyarchieve" ||
                                                active === "batch-record"
                                            }
                                        >
                                            <Link
                                                href={route("tardyarchieve")}
                                                className="flex items-center gap-2 text-xs hover:bg-blue-900"
                                            >
                                                <Archive
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                            "tardyarchieve" ||
                                                        active ===
                                                            "batch-record"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                <span
                                                    className={`${
                                                        active ===
                                                            "tardyarchieve" ||
                                                        active ===
                                                            "batch-record"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                >
                                                    Tardiness Archive
                                                </span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={url.startsWith(
                                                "/employeeleavecard",
                                            )}
                                        >
                                            <Link
                                                href={route(
                                                    "employeeleavecard",
                                                )}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <CalendarClock
                                                    className={`h-4 w-4 ${
                                                        url.startsWith(
                                                            "/employeeleavecard",
                                                        )
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Employee Leave Card
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            )}
                        </SidebarMenuItem>

                        {/* Employee */}
                        <SidebarMenuItem>
                            <Button
                                variant="ghost"
                                className="w-full justify-between px-3 py-2 text-left font-semibold hover:bg-blue-900 hover:text-blue-100"
                                onClick={() => setEmployeeOpen(!isEmployeeOpen)}
                            >
                                <span className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Employee
                                </span>
                                {isEmployeeOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>

                            {isEmployeeOpen && (
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={active === "travelorder"}
                                        >
                                            <Link
                                                href={route("travelorder")}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <Plane
                                                    className={`h-4 w-4 ${
                                                        active === "travelorder"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Travel Order
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                active === "locator-slips"
                                            }
                                        >
                                            <Link
                                                href={route("locator-slips")}
                                                className={`flex items-center gap-2 text-xs p-2 rounded ${
                                                    active ===
                                                    "locator-slips.index"
                                                        ? "bg-blue-100 text-black"
                                                        : "text-white hover:bg-blue-900 hover:text-blue-100"
                                                }`}
                                            >
                                                <MapPinned
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "locator-slips"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Locator Slip
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            )}
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {user && (
                    <SidebarGroup className="mt-auto">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-center items-center gap-2 hover:bg-blue-900 hover:text-blue-100"
                                        >
                                            <User className="h-4 w-4" />
                                            {user.name}
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={route("profile.edit")}
                                                className="flex items-center gap-2"
                                            >
                                                <User className="h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="flex items-center gap-2 w-full text-left"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Log Out
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>
        </Sidebar>
    );
}

export default AppSidebar;
