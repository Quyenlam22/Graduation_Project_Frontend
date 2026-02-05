// import { createContext, useContext, useEffect, useMemo, useState } from "react";
// import { AuthContext } from "./AuthProvider";
import { createContext } from "react";
import { message } from "antd";

export const AppContext = createContext();

function AppProvider ({ children }) {
  // const { user } = useContext(AuthContext);
  const [messageApi, contextHolder] = message.useMessage();

  // const savedRoomId = sessionStorage.getItem("selectedRoomId");
  // const [selectedRoomId, setSelectedRoomId] = useState(savedRoomId || '');

  // useEffect(() => {
  //   if (selectedRoomId) {
  //     sessionStorage.setItem("selectedRoomId", selectedRoomId);
  //   } else {
  //     sessionStorage.removeItem("selectedRoomId");
  //   }
  // }, [selectedRoomId]);

  // const roomsCondition = useMemo(() => {
  //   if (!user?.uid) return null;
  //   return {
  //     fieldName: "members",
  //     operator: "array-contains",
  //     compareValue: user.uid
  //   };
  // }, [user?.uid])

  // const rooms = useFirestore("rooms", roomsCondition || {});

  // const selectedRoom = useMemo(() => (
  //   rooms.find(room => room.id === selectedRoomId)
  // ), [rooms, selectedRoomId]);

  // const roomBotsCondition = useMemo(() => {
  //   if (!user?.uid) return null;
  //   return {
  //     fieldName: "owner",
  //     operator: "==",
  //     compareValue: user.uid
  //   };
  // }, [user?.uid])

  // const roomBots = useFirestore("bots", roomBotsCondition);

  // const selectedRoomBot = useMemo(() => (
  //   roomBots.find(room => room.id === selectedRoomId)
  // ), [roomBots, selectedRoomId]);

  // const membersCondition = useMemo(() => {
  //   if (!selectedRoom?.members || selectedRoom.members.length === 0) return null;
  //   return {
  //     fieldName: 'uid',
  //     operator: "in",
  //     compareValue: selectedRoom.members
  //   };
  // }, [selectedRoom?.members]);

  // const members = useFirestore("users", membersCondition);

  // const membersInviteCondition = useMemo(() => {
  //   if (!selectedRoom?.members || selectedRoom.members.length === 0) return null;
  //   return {
  //     fieldName: 'uid',
  //     operator: "not-in",
  //     compareValue: selectedRoom.members
  //   };
  // }, [selectedRoom?.members]);

  // const membersInvite = useFirestore("users", membersInviteCondition);
  
  // const messagesCondition = useMemo(() => {
  //   if (!selectedRoom || !selectedRoom?.id) return null;
  //   return {
  //     fieldName: 'roomId',
  //     operator: '==',
  //     compareValue: selectedRoom.id
  //   };
  // }, [selectedRoom]);

  // const messages = useFirestore("messages", messagesCondition);

  // const friendsCondition = useMemo(() => {
  //   if (!user?.uid) return null;
  //   return {
  //     fieldName: "uid",
  //     operator: "!=",
  //     compareValue: user.uid
  //   };
  // }, [user?.uid])

  // const friends = useFirestore("users", friendsCondition || {});

  return (
    <>
      {contextHolder}
      <AppContext.Provider 
        value={
          {
        //     rooms, 
        //     selectedRoomId, 
        //     setSelectedRoomId, 
        //     selectedRoom, 
        //     roomBots,
        //     selectedRoomBot,
        //     members, 
        //     membersInvite, 
        //     messages,
            messageApi,
        //     friends
          }
        }
      >
        {children}
      </AppContext.Provider>
    </>
  )
}

export default AppProvider;