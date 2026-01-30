import { lazy } from "react";
import withSuspense from "../../utils/withSuspense";

import LayoutAdmin from "../../layouts/LayoutAdmin";
import LayoutClient from "../../layouts/LayoutClient";
import Dashboard from "../../pages/admin/Dashboard";
import Error404 from "../../pages/Error404";
import PrivateRouteAdmin from "../../components/PrivateRoute/admin";

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