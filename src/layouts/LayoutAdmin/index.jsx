import { Outlet } from "react-router-dom";

const LayoutAdmin = () => {
    return (
        <>
          <header>HEADER</header>
            <Outlet />
          <footer>FOOTER</footer>
        </>
    );
};

export default LayoutAdmin;