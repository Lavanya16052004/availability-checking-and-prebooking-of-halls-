import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LogOut, User, Home, Shield, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as UserEntity } from "@/entities/User";
import { useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

const navigationItems = [
    { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Home },
];

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);

    const checkAuth = React.useCallback(async() => {
        try {
            const currentUser = await UserEntity.me();
            if (!currentUser) {
                throw new Error("User not found");
            }

            setUser(currentUser);
            const adminStatus = currentUser.role === 'admin';
            setIsAdmin(adminStatus);

            if (!adminStatus && !currentUser.is_approved && currentPageName !== "PendingApproval") {
                navigate(createPageUrl("PendingApproval"));
            } else if (!adminStatus && currentUser.is_approved && currentPageName === "PendingApproval") {
                navigate(createPageUrl("Dashboard"));
            } else if (adminStatus && currentUser.is_approved === false) {
                await UserEntity.updateMyUserData({ is_approved: true });
            }


        } catch (error) {
            await UserEntity.loginWithRedirect(window.location.href);
        } finally {
            setLoading(false);
        }
    }, [navigate, currentPageName]);

    React.useEffect(() => {
        if (currentPageName !== "Shared") {
            checkAuth();
        } else {
            setLoading(false);
        }
    }, [checkAuth, currentPageName]);


    const handleLogout = async() => {
        await UserEntity.logout();
    };

    if (loading) {
        return ( < div className = "min-h-screen bg-slate-50 flex items-center justify-center" >
            <
            div className = "animate-pulse text-blue-600 font-semibold" > Loading Application... < /div> < /
            div >
        );
    }

    if (currentPageName === "PendingApproval") {
        return children;
    }

    return ( <
        div className = "min-h-screen flex flex-col bg-slate-50" >
        <
        header className = "sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm" >
        <
        div className = "w-full" >
        <
        img src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c92d443e553f898d12987d/9ef1d2e91_headerimg.png"
        alt = "College Header"
        className = "w-full h-auto object-contain" / >
        <
        /div> <
        div className = "container mx-auto flex h-16 items-center justify-between px-4 border-t" >
        <
        nav className = "hidden md:flex items-center gap-4" > {
            navigationItems.map((item) => ( <
                Link key = { item.title }
                to = { item.url }
                className = { `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.url
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }` } > { item.title } <
                /Link>
            ))
        } {
            isAdmin && ( <
                Link to = { createPageUrl("AdminPanel") }
                className = { `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === createPageUrl("AdminPanel")
                      ? "bg-amber-50 text-amber-800"
                      : "text-slate-600 hover:bg-slate-100"
                  }` } >
                <
                Shield className = "w-4 h-4" / > Admin Panel <
                /Link>
            )
        } <
        /nav>

        <
        div className = "md:hidden" >
        <
        Sheet open = { isSheetOpen }
        onOpenChange = { setIsSheetOpen } >
        <
        SheetTrigger asChild >
        <
        Button variant = "ghost"
        size = "icon" >
        <
        Menu className = "w-6 h-6" / >
        <
        /Button> < /
        SheetTrigger > <
        SheetContent side = "left" >
        <
        nav className = "flex flex-col gap-4 mt-8" > {
            navigationItems.map((item) => ( <
                Link key = { item.title }
                to = { item.url }
                onClick = {
                    () => setIsSheetOpen(false)
                }
                className = { `flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          location.pathname === item.url
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-100"
                        }` } >
                <
                item.icon className = "w-5 h-5" / > { item.title } <
                /Link>
            ))
        } {
            isAdmin && ( <
                Link to = { createPageUrl("AdminPanel") }
                onClick = {
                    () => setIsSheetOpen(false)
                }
                className = { `flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          location.pathname === createPageUrl("AdminPanel")
                            ? "bg-amber-50 text-amber-800"
                            : "text-slate-600 hover:bg-slate-100"
                        }` } >
                <
                Shield className = "w-5 h-5" / >
                Admin Panel <
                /Link>
            )
        } <
        /nav> < /
        SheetContent > <
        /Sheet> < /
        div >

        <
        div className = "flex items-center gap-4" >
        <
        DropdownMenu >
        <
        DropdownMenuTrigger asChild >
        <
        Button variant = "ghost"
        className = "flex items-center gap-2" >
        <
        div className = "w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center" >
        <
        User className = "w-4 h-4 text-slate-600" / >
        <
        /div> <
        span className = "hidden sm:inline font-medium text-slate-700" > { user ? .full_name } < /span> <
        ChevronDown className = "w-4 h-4 text-slate-500" / >
        <
        /Button> < /
        DropdownMenuTrigger > <
        DropdownMenuContent align = "end"
        className = "w-56" >
        <
        DropdownMenuLabel >
        <
        div className = "font-bold" > { user ? .full_name } < /div> <
        div className = "text-xs text-slate-500 font-normal truncate" > { user ? .email } < /div> < /
        DropdownMenuLabel > <
        DropdownMenuSeparator / >
        <
        DropdownMenuItem onClick = { handleLogout }
        className = "text-red-600 focus:bg-red-50 focus:text-red-700" >
        <
        LogOut className = "mr-2 h-4 w-4" / >
        <
        span > Logout < /span> < /
        DropdownMenuItem > <
        /DropdownMenuContent> < /
        DropdownMenu > <
        /div> < /
        div > <
        /header>

        <
        main className = "flex-1 w-full container mx-auto px-2 sm:px-4 py-8" > { children } <
        /main> < /
        div >
    );
}