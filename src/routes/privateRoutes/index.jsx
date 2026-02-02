import { lazy } from "react";
import withSuspense from "../../utils/withSuspense";

import LayoutAdmin from "../../layouts/LayoutAdmin";
import LayoutClient from "../../layouts/LayoutClient";
import Dashboard from "../../pages/admin/Dashboard";
import Error404 from "../../pages/Error404";
import PrivateRouteAdmin from "../../components/PrivateRoute/admin";
import MyFavorite from "../../pages/client/MyFavorite";
import UserInfo from "../../pages/client/UserInfo";

const Home = lazy(() => import("../../pages/client/Home"));

export const privateRoutes = [
    {
        path: "/",
        element: <LayoutClient />,
        children: [
            {
                index: true,
                element: withSuspense(Home),
            },
            {
                path: "/my-library",
                element: <MyFavorite/>,
            },
            {
                path: "/user-info",
                element: <UserInfo/>,
            },
            {
                path: "*",
                element: <Error404/>,
            },
        ],
    },
    {
        element: <PrivateRouteAdmin/>,
        children: [
            {
                path: "/admin",
                element: <LayoutAdmin />,
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: "dashboard",
                        element: <Dashboard/>,
                    },
                    // {
                    //     path: "*",
                    //     element: <Error404/>,
                    // },
                ],
            }
        ]
    },
];