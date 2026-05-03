import { Box, Flex, IconButton } from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
const ENDPOINT = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  // Auto-collapse sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || {});
    const newSocket = io(ENDPOINT, {
      auth: { user: userInfo }
    })
    setSocket(newSocket);
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);
  return (
    <Flex h="100vh">
      {/* Collapsible Sidebar */}
      <Box position="relative" flexShrink={0}>
        <Box
          w={isSidebarOpen ? { base: "250px", xl: "300px" } : "0px"}
          h="100%"
          overflow="hidden"
          transition="width 0.3s ease"
          borderRight={isSidebarOpen ? "1px solid" : "none"}
          borderColor="gray.200"
        >
          <Box w={{ base: "250px", xl: "300px" }} h="100%">
            <Sidebar setSelectedGroup={setSelectedGroup} />
          </Box>
        </Box>
        <IconButton
          aria-label="Toggle sidebar"
          icon={isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
          size="xs"
          bg="white"
          shadow="md"
          borderRadius="full"
          position="absolute"
          right="-14px"
          top="50%"
          transform="translateY(-50%)"
          zIndex={10}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          _hover={{ bg: "blue.50", color: "blue.500" }}
          border="1px solid"
          borderColor="gray.200"
        />
      </Box>

      {/* Chat area */}
      <Box flex="1" minW="0">
        {socket && <ChatArea selectedGroup={selectedGroup} socket={socket} />}
      </Box>
    </Flex>
  );
};

export default Chat;
