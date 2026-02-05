import { useState, useContext } from "react";
import { Button, Input, Card, Avatar, Typography, Flex, Divider, Spin } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthProvider";
import useTitle from "../../../hooks/useTitle";
import { getSongs, getSongsBySource } from "../../../services/songService";
import { getArtist } from "../../../services/artistService";
import { getAlbum } from "../../../services/albumService";

const { Meta } = Card;
const { Text } = Typography;

function Home() {
    const { user } = useContext(AuthContext);
    // const { messageApi } = useContext(AppContext);

    useTitle("Muzia");

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
            console.log(res);
            
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

    if (!user) return <Card style={{ textAlign: "center", margin: 50 }}><Link to="/auth"><Button type="primary">Login</Button></Link></Card>;
    
    return (
        <div>
            <h2 level={2}>Music Flow Web</h2>

            {/* PHẦN 1: BÀI HÁT */}
            <section style={{ marginBottom: 40 }}>
                <h2 level={4}>1. Tìm bài hát</h2>
                <Flex gap={10} style={{ marginBottom: 20 }}>
                    <Input placeholder="Tên bài hát..." value={songKey} onChange={e => setSongKey(e.target.value)} />
                    <Button type="primary" onClick={handleSearchSongs} loading={loadings.s}>Tìm</Button>
                </Flex>
                <Flex wrap="wrap" gap="middle">
                    {songs.map(s => (
                        <Card key={s.id} hoverable style={{ width: 220 }}>
                            <Meta avatar={<Avatar src={s.cover} shape="square" />} title={s.title} description={s.artist} />
                            <audio src={s.audio} controls style={{ width: '100%', marginTop: 10 }} />
                        </Card>
                    ))}
                </Flex>
            </section>

            <Divider />

            {/* PHẦN 2: NGHỆ SĨ */}
            <section style={{ marginBottom: 40 }}>
                <h2 level={4}>2. Tìm nghệ sĩ (Click để xem nhạc tiêu biểu)</h2>
                <Flex gap={10} style={{ marginBottom: 20 }}>
                    <Input placeholder="Tên nghệ sĩ..." value={artistKey} onChange={e => setArtistKey(e.target.value)} />
                    <Button type="primary" onClick={handleSearchArtists} loading={loadings.a}>Tìm</Button>
                </Flex>
                <Flex wrap="wrap" gap="middle">
                    {artists.map(a => (
                        <Card key={a._id} hoverable style={{ width: 180, textAlign: 'center' }} onClick={() => fetchTracks(a.deezerId, 'artist', a.name)}>
                            <Avatar src={a.avatar} size={80} />
                            <div style={{ marginTop: 10 }}><Text strong>{a.name}</Text></div>
                        </Card>
                    ))}
                </Flex>
            </section>

            <Divider />

            {/* PHẦN 3: ALBUM */}
            <section style={{ marginBottom: 40 }}>
                <h2 level={4}>3. Tìm Album (Click để xem danh sách bài hát)</h2>
                <Flex gap={10} style={{ marginBottom: 20 }}>
                    <Input placeholder="Tên album..." value={albumKey} onChange={e => setAlbumKey(e.target.value)} />
                    <Button type="primary" onClick={handleSearchAlbums} loading={loadings.al}>Tìm</Button>
                </Flex>
                <Flex wrap="wrap" gap="middle">
                    {albums.map(al => (
                        <Card key={al._id} hoverable style={{ width: 200 }} cover={<img src={al.avatar} alt="cover" />} onClick={() => fetchTracks(al.deezerId, 'album', al.title)}>
                            <Meta title={al.title} description={`${al.artistName} (${al.nb_tracks} bài)`} />
                        </Card>
                    ))}
                </Flex>
            </section>

            <Divider />

            {/* PHẦN 4: HIỂN THỊ DANH SÁCH NHẠC (Từ Album hoặc Nghệ sĩ) */}
            <section>
                <h2 level={4}>4. Danh sách bài hát: {trackSourceTitle}</h2>
                {loadings.t ? <Spin /> : (
                    <Flex vertical gap="small">
                        {displayTracks.map(t => (
                            <Card size="small" key={t._id}>
                                <Flex justify="space-between" align="center">
                                    <Text strong>{t.title}</Text>
                                    <audio src={t.audio} controls />
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