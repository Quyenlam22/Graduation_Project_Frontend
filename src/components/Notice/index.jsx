import { Button, Dropdown } from "antd";
import { BellOutlined } from '@ant-design/icons';
import Link from "antd/es/typography/Link";
import './Notice.scss';
import { useLocation } from "react-router";

function Notice() {
    const location = useLocation();
    const path = location.pathname;

    const items = [
        {
            label: (
                <>
                    <div className="notice__item">
                        <div className="notice__item-icon">
                            <BellOutlined/>
                        </div>
                        <div className="notice__item-content">
                            <div className="notice__item-title">
                                You received a new message
                            </div>
                            <div className="notice__item-time">
                                8 minutes ago
                            </div>
                        </div>
                    </div>
                </>
            ),
            key: '0',
        },
        {
            label: (
                <>
                    <div className="notice__item">
                        <div className="notice__item-icon">
                            <BellOutlined/>
                        </div>
                        <div className="notice__item-content">
                            <div className="notice__item-title">
                                You received a new message
                            </div>
                            <div className="notice__item-time">
                                8 minutes ago
                            </div>
                        </div>
                    </div>
                </>
            ),
            key: '1',
        },
        // {
        //     type: 'divider',
        // },
        {
            label: (
                <>
                    <div className="notice__item">
                        <div className="notice__item-icon">
                            <BellOutlined/>
                        </div>
                        <div className="notice__item-content">
                            <div className="notice__item-title">
                                You received a new message
                            </div>
                            <div className="notice__item-time">
                                8 minutes ago
                            </div>
                        </div>
                    </div>
                </>
            ),
            key: '3',
        },
        {
            label: (
                <>
                    <div className="notice__item">
                        <div className="notice__item-icon">
                            <BellOutlined/>
                        </div>
                        <div className="notice__item-content">
                            <div className="notice__item-title">
                                You received a new message
                            </div>
                            <div className="notice__item-time">
                                8 minutes ago
                            </div>
                        </div>
                    </div>
                </>
            ),
            key: "4"
        }
    ];

    return (
        <>
            <Dropdown 
                menu={{ items }} 
                trigger={['click']}
                popupRender={menu => (
                    <>
                        <div className="notice__dropdown">
                            <div className="notice__header">
                                <div className="notice__header-title">
                                    <BellOutlined /> Notification
                                </div>
                                <div className="notice__header-link">
                                    <Link href="/">View All</Link>
                                </div>
                            </div>
                            <div className="notice__body">
                                {menu}
                            </div>    
                        </div>
                    </>
                )}
            >
                <Button size="large" icon={<BellOutlined style={path.includes("admin") ? {color: "#000"} : {color: "#fff"}} />} type="text"/>
            </Dropdown>
        </>
    )
}

export default Notice;