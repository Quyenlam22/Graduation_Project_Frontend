import { useRoutes } from "react-router-dom";
import { publicRoutes } from "../../routes/publicRoutes";
import { privateRoutes } from "../../routes/privateRoutes";

function AllRouter() {
    const elements = useRoutes([
        ...publicRoutes,
        ...privateRoutes,
    ]);

    return elements;
}

export default AllRouter;
