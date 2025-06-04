import { Box } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider"; // Assuming ChatProvider is correctly imported and set up
import SideDrawer from "../Components/miscellaneous/SideDrawer";
import MyChats from "../Components/MyChats";
import ChatBox from "../Components/ChatBox";
import { useState } from "react";

const Chatpage = () => {
  // Assuming ChatState() returns an object containing 'user'
  const { user } = ChatState(); // Check if this returns a valid user object
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {/* Ensure user exists before rendering SideDrawer */}
      {user && <SideDrawer />}

      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
