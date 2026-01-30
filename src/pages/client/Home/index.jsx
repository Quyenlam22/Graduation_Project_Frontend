import { useState, useContext } from "react";
import { Button, Input, Card, Avatar, Typography, Flex, Divider, Spin } from "antd";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";
import { auth } from "../../../firebase/config";
import { AuthContext } from "../../../Context/AuthProvider";
import useTitle from "../../../hooks/useTitle";
import { AppContext } from "../../../Context/AppProvider";
import { getSongs, getSongsBySource } from "../../../services/songService";
import { getArtist } from "../../../services/artistService";
import { getAlbum } from "../../../services/albumService";
import { changeStatus } from "../../../services/authService";

const { Meta } = Card;
const { Title, Text } = Typography;

function Home() {
    const user = useContext(AuthContext);
    // const { messageApi } = useContext(AppContext);
    const navigate = useNavigate();

    useTitle("Home");

    // States cho 4 phần
    const [songKey, setSongKey] = useState("");
    const [songs, setSongs] = useState([]);
    const [artistKey, setArtistKey] = useState("");
    const [artists, setArtists] = useState([]);
    const [albumKey, setAlbumKey] = useState("");
    const [albums, setAlbums] = useState([]);
    const [displayTracks, setDisplayTracks] = useState([]);
    const [trackSourceTitle, setTrackSourceTitle] = useState("");

    const [loadings, setLoadings] = useState({ s: false, a: false, al: false, t: false });

    // 1. Tìm Bài Hát
    const handleSearchSongs = async () => {
        setLoadings(p => ({ ...p, s: true }));
        try {
            const res = await getSongs(songKey);
            setSongs(res);
        } catch (e) { console.error(e); }
        setLoadings(p => ({ ...p, s: false }));
    };

    // 2. Tìm Nghệ Sĩ
    const handleSearchArtists = async () => {
        setLoadings(p => ({ ...p, a: true }));
        try {
            const res = await getArtist(artistKey);
            setArtists(res);
        } catch (e) { console.error(e); }
        setLoadings(p => ({ ...p, a: false }));
    };

    // 3. Tìm Album
    const handleSearchAlbums = async () => {
        setLoadings(p => ({ ...p, al: true }));
        try {
            const res = await getAlbum(albumKey);
            setAlbums(res);
        } catch (e) { console.error(e); }
        setLoadings(p => ({ ...p, al: false }));
    };

    // 4. Lấy nhạc theo Nguồn (Nghệ sĩ hoặc Album)
    const fetchTracks = async (id, type, title) => {
        setLoadings(p => ({ ...p, t: true }));
        setTrackSourceTitle(title);
        const endpoint = type === 'artist' ? `artists/${id}/top` : `albums/${id}/tracks`;
        try {
            const res = await getSongsBySource(endpoint);
            setDisplayTracks(res);
        } catch (e) { console.error(e); }
        setLoadings(p => ({ ...p, t: false }));
    };

    const handleLogout = async () => {
        if (user?.uid) {
            try {
                // const token = await auth.currentUser.getIdToken();
                await changeStatus({ uid: user.uid, state: "offline" });
            } catch (e) { console.error(e); }
        }
        localStorage.removeItem("accessToken");
        await signOut(auth);
        navigate("/auth");
    };

    if (!user) return <Card style={{ textAlign: "center", margin: 50 }}><Link to="/auth"><Button type="primary">Login</Button></Link></Card>;

    return (
        <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: 40 }}>
                <Title level={2}>Music Flow Web</Title>
                <Button icon={<LogoutOutlined />} danger onClick={handleLogout}>Logout</Button>
            </Flex>

            {/* PHẦN 1: BÀI HÁT */}
            <section style={{ marginBottom: 40 }}>
                <Title level={4}>1. Tìm bài hát</Title>
                <Flex gap={10} style={{ marginBottom: 20 }}>
                    <Input placeholder="Tên bài hát..." value={songKey} onChange={e => setSongKey(e.target.value)} />
                    <Button type="primary" onClick={handleSearchSongs} loading={loadings.s}>Tìm</Button>
                </Flex>
                <Flex wrap="wrap" gap="middle">
                    {songs.map(s => (
                        <Card key={s.id} hoverable style={{ width: 220 }}>
                            <Meta avatar={<Avatar src={s.cover} shape="square" />} title={s.title} description={s.artist} />
                            <audio src={s.preview} controls style={{ width: '100%', marginTop: 10 }} />
                        </Card>
                    ))}
                </Flex>
            </section>

            <Divider />

            {/* PHẦN 2: NGHỆ SĨ */}
            <section style={{ marginBottom: 40 }}>
                <Title level={4}>2. Tìm nghệ sĩ (Click để xem nhạc tiêu biểu)</Title>
                <Flex gap={10} style={{ marginBottom: 20 }}>
                    <Input placeholder="Tên nghệ sĩ..." value={artistKey} onChange={e => setArtistKey(e.target.value)} />
                    <Button type="primary" onClick={handleSearchArtists} loading={loadings.a}>Tìm</Button>
                </Flex>
                <Flex wrap="wrap" gap="middle">
                    {artists.map(a => (
                        <Card key={a.id} hoverable style={{ width: 180, textAlign: 'center' }} onClick={() => fetchTracks(a.id, 'artist', a.name)}>
                            <Avatar src={a.picture} size={80} />
                            <div style={{ marginTop: 10 }}><Text strong>{a.name}</Text></div>
                        </Card>
                    ))}
                </Flex>
            </section>

            <Divider />

            {/* PHẦN 3: ALBUM */}
            <section style={{ marginBottom: 40 }}>
                <Title level={4}>3. Tìm Album (Click để xem danh sách bài hát)</Title>
                <Flex gap={10} style={{ marginBottom: 20 }}>
                    <Input placeholder="Tên album..." value={albumKey} onChange={e => setAlbumKey(e.target.value)} />
                    <Button type="primary" onClick={handleSearchAlbums} loading={loadings.al}>Tìm</Button>
                </Flex>
                <Flex wrap="wrap" gap="middle">
                    {albums.map(al => (
                        <Card key={al.id} hoverable style={{ width: 200 }} cover={<img src={al.cover} alt="cover" />} onClick={() => fetchTracks(al.id, 'album', al.title)}>
                            <Meta title={al.title} description={`${al.artist} (${al.nb_tracks} bài)`} />
                        </Card>
                    ))}
                </Flex>
            </section>

            <Divider />

            {/* PHẦN 4: HIỂN THỊ DANH SÁCH NHẠC (Từ Album hoặc Nghệ sĩ) */}
            <section>
                <Title level={4}>4. Danh sách bài hát: {trackSourceTitle}</Title>
                {loadings.t ? <Spin /> : (
                    <Flex vertical gap="small">
                        {displayTracks.map(t => (
                            <Card size="small" key={t.id}>
                                <Flex justify="space-between" align="center">
                                    <Text strong>{t.title}</Text>
                                    <audio src={t.preview} controls />
                                </Flex>
                            </Card>
                        ))}
                    </Flex>
                )}
            </section>
        </div>
    );
}

export default Home;