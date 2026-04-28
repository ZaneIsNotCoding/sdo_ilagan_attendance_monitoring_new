"use client";

import React from "react";
import { usePage } from "@inertiajs/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import useToastResponse from "@/hooks/useToastResponse";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Toaster } from "sonner";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth?.user;
    const active = route().current();
    useToastResponse();

    // Always normalize to array
    const breadcrumbItems = Array.isArray(header) ? header : [header];

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden bg-muted/50">
                {/* Sidebar */}
                <aside>
                    <AppSidebar user={user} active={active} />
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-3">
                        <SidebarTrigger />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />

                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbItems.map((item, index) => {
                                    const isLast =
                                        index === breadcrumbItems.length - 1;
                                    return (
                                        <React.Fragment key={index}>
                                            {index > 0 && (
                                                <BreadcrumbSeparator className="hidden md:block" />
                                            )}
                                            <BreadcrumbItem>
                                                {isLast ? (
                                                    <BreadcrumbPage>
                                                        {item}
                                                    </BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink href="#">
                                                        {item}
                                                    </BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                        </React.Fragment>
                                    );
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </header>

                    {/* Main */}
                    <main className="overflow-auto flex-1 p-3">
                        <div className="p-3">
                            {children}
                            <Toaster richColors position="top-right" />
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
