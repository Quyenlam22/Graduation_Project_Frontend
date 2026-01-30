import { Outlet } from "react-router-dom";

const LayoutClient = () => {
    return (
        <>
          <header>HEADER</header>
            <Outlet />
          <footer>FOOTER</footer>
        </>
    );
};

export default LayoutClient;
