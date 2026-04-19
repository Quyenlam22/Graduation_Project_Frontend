import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { BiSolidAlbum } from "react-icons/bi";
import { TbMoodSing } from "react-icons/tb";
import { IoLibrary } from "react-icons/io5";
import { IoMdHome } from "react-icons/io";
import { PiPlaylistFill } from "react-icons/pi";
import { GiLoveSong } from "react-icons/gi";
import { useTranslation } from "react-i18next";

function MenuSiderAdmin () {
    const { t } = useTranslation();
    const location = useLocation();
    const path = location.pathname;

    const getSelectedKey = () => {
        if (path === '/admin') return '/admin/';
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
            label: <Link to={"/admin/users"}>{t('user.management')}</Link>,
        },
        {
            key: '/admin/songs',
            icon: <GiLoveSong />,
            label: <Link to={"/admin/songs"}>{t('song.management')}</Link>,
        },
        {
            key: '/admin/playlists',
            icon: <PiPlaylistFill />,
            label: <Link to={"/admin/playlists"}>{t('playlist.management')}</Link>,
        },
        {
            key: '/admin/artists',
            icon: <TbMoodSing />,
            label: <Link to={"/admin/artists"}>{t('artist.management')}</Link>,
        },
        {
            key: '/admin/albums',
            icon: <BiSolidAlbum />,
            label: <Link to={"/admin/albums"}>{t('album.management')}</Link>,
        },
    ];

    return (
        <>
            <Menu
                selectedKeys={[getSelectedKey()]}
                mode="inline"
                items={items}
            />
        </>
    )
}

export default MenuSiderAdmin;