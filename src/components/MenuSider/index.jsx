import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { BiSolidAlbum } from "react-icons/bi";
import { TbMoodSing } from "react-icons/tb";
import { IoLibrary } from "react-icons/io5";
import { IoMdHome } from "react-icons/io";
import { PiPlaylistFill } from "react-icons/pi";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthProvider";
import { useTranslation } from "react-i18next";

function MenuSider () {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const path = location.pathname;

    const getSelectedKey = () => {
        if (path === '/') return '/';
        if (path.includes('favorite') || path.includes('library')) return '/my-favorite';
        return path;
    };

    const allItems = [
        {
            key: '/',
            icon: <IoMdHome />,
            label: <Link to={"/"}>{t('menu.home')}</Link>,
        },
        {
            key: '/my-favorite',
            icon: <IoLibrary />,
            label: <Link to={"/my-library"}>{t('menu.library')}</Link>,
            requiredAuth: true, 
        },
        {
            key: '/playlists',
            icon: <PiPlaylistFill />,
            label: <Link to={"/playlists"}>{t('menu.playlists')}</Link>,
        },
        {
            key: '/artists',
            icon: <TbMoodSing />,
            label: <Link to={"/artists"}>{t('menu.artists')}</Link>,
        },
        {
            key: '/albums',
            icon: <BiSolidAlbum />,
            label: <Link to={"/albums"}>{t('menu.albums')}</Link>,
        },
    ];

    const filteredItems = allItems.filter(item => !item.requiredAuth || (item.requiredAuth && user));

    return (
        <Menu
            selectedKeys={[getSelectedKey()]}
            mode="inline"
            items={filteredItems}
            theme="dark"
            style={{ backgroundColor: "transparent" }}
        />
    );
}

export default MenuSider;