import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { BiSolidAlbum } from "react-icons/bi";
import { TbMoodSing } from "react-icons/tb";
import { IoLibrary } from "react-icons/io5";
import { IoMdHome } from "react-icons/io";
import { PiPlaylistFill } from "react-icons/pi";
import { GiLoveSong } from "react-icons/gi";

function MenuSiderAdmin () {
    const location = useLocation();
    const path = location.pathname;
    const getSelectedKey = () => {
        if (path === '/admin') return '/admin';
        if (path.includes('favorite') || path.includes('library')) return '/my-favorite';
        return path;
    };
    
    const items = [
        {
            key: '/admin/',
            icon: <IoMdHome />,
            label: <Link to={"/admin/"}>Dashboard</Link>,
        },
        {
            key: '/admin/users',
            icon: <IoLibrary />,
            label: <Link to={"/admin/users"}>User Management</Link>,
        },
        {
            key: '/admin/songs',
            icon: <GiLoveSong />,
            label: <Link to={"/admin/songs"}>Songs</Link>,
        },
        {
            key: '/admin/playlists',
            icon: <PiPlaylistFill />,
            label: <Link to={"/admin/playlists"}>Playlist Management</Link>,
        },
        {
            key: '/admin/artists',
            icon: <TbMoodSing />,
            label: <Link to={"/admin/artists"}>Artist Management</Link>,
        },
        {
            key: '/admin/albums',
            icon: <BiSolidAlbum />,
            label: <Link to={"/admin/albums"}>Album Management</Link>,
        },
    ];

    return (
        <>
            <Menu
                defaultSelectedKeys={[path]}
                selectedKeys={[getSelectedKey()]}
                mode="inline"
                items={items}
            />
        </>
    )
}

export default MenuSiderAdmin;