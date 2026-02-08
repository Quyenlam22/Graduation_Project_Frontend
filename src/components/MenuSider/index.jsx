import { Menu } from "antd";
import { GiLoveSong } from "react-icons/gi";
import { Link, useLocation } from "react-router-dom";
import { BiSolidAlbum } from "react-icons/bi";
import { TbMoodSing } from "react-icons/tb";
import { IoLibrary } from "react-icons/io5";
import { IoMdHome } from "react-icons/io";
import { PiPlaylistFill } from "react-icons/pi";

function MenuSider () {
    const location = useLocation();
    const path = location.pathname;
    const getSelectedKey = () => {
        if (path === '/') return '/';
        if (path.includes('favorite') || path.includes('library')) return '/my-favorite';
        return path;
    };
    
    const items = [
        {
            key: '/',
            icon: <IoMdHome />,
            label: <Link to={"/"}>Home</Link>,
        },
        {
            key: '/my-favorite',
            icon: <IoLibrary />,
            label: <Link to={"/my-library"}>My Library</Link>,
        },
        // {
        //     key: '/songs',
        //     icon: <GiLoveSong />,
        //     label: <Link to={"/songs"}>Songs</Link>,
        // },
        {
            key: '/playlists',
            icon: <PiPlaylistFill />,
            label: <Link to={"/playlists"}>Playlists</Link>,
        },
        {
            key: '/artists',
            icon: <TbMoodSing />,
            label: <Link to={"/artists"}>Artists</Link>,
        },
        {
            key: '/albums',
            icon: <BiSolidAlbum />,
            label: <Link to={"/albums"}>Albums</Link>,
        },
    ];

    return (
        <>
            <Menu
                defaultSelectedKeys={[path]}
                selectedKeys={[getSelectedKey()]}
                mode="inline"
                items={items}
                theme="dark"
                style={{ backgroundColor: "transparent" }}
            />
        </>
    )
}

export default MenuSider;