import Auth from "../../pages/client/Auth";
import LoginAdmin from "../../pages/admin/Login";

export const publicRoutes = [
    {
        path: "/auth",
        element: <Auth />,
    },
    {
        path: "/admin/login",
        element: <LoginAdmin />,
    },
];
