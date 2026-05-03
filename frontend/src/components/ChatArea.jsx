import {Box,VStack,HStack,Text,Input,Button,Flex,Icon,IconButton,Avatar,InputGroup,InputRightElement,InputLeftElement,Tooltip,useToast,Modal,ModalOverlay,ModalContent,ModalHeader,ModalBody,ModalCloseButton,Divider,Progress,Spinner,Badge} from "@chakra-ui/react";
import { FiSend, FiInfo, FiMessageCircle, FiSearch, FiX, FiChevronLeft, FiChevronRight, FiBarChart2 } from "react-icons/fi";
import UsersList from "./UsersList";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const ChatArea = ({ selectedGroup, socket }) => {

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const toast = useToast();

  // Message search states
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [messageSearchResults, setMessageSearchResults] = useState([]);
  const [isUsersListOpen, setIsUsersListOpen] = useState(window.innerWidth >= 1024);

  // Analytics modal states
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Auto-collapse members list on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsUsersListOpen(false);
      } else {
        setIsUsersListOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  useEffect(() => {
    if (selectedGroup && socket) {
      // Reset states when switching groups
      setMessages([]);
      setTypingUsers(new Set());
      setConnectedUsers([]);
      setShowMessageSearch(false);
      setMessageSearchQuery("");
      setMessageSearchResults([]);
      
      fetchMessages();
      
      socket.emit('join room', selectedGroup?._id);
      
      // Message received handler
      const handleMessageReceived = (newMessage) => {
        setMessages((prev) => {
          // Prevent duplicates by checking if message already exists
          const exists = prev.some(msg => msg._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      };
      
      const handleUsersInRoom = (users) => {
        setConnectedUsers(users);
      };
      
      const handleUserJoined = (user) => {
        setConnectedUsers((prev) => [...prev, user]);
      };
      
      const handleUserLeft = (userId) => {
        setConnectedUsers((prev) => prev.filter((user) => user?._id !== userId));
      };
      
      const handleNotification = (notification) => {
        toast({
          title: notification?.title === 'USER_JOINED' ? 'NEW USER' : 'Notification',
          description: notification.message,
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      };
      
      const handleUserTyping = ({username}) => {
        setTypingUsers((prev) => new Set(prev).add(username));
      };
      
      const handleUserStopTyping = ({username}) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      };
      
      // Attach listeners
      socket.on("message recieved", handleMessageReceived);
      socket.on("users in room", handleUsersInRoom);
      socket.on("users joined", handleUserJoined);
      socket.on("user left", handleUserLeft);
      socket.on("notification", handleNotification);
      socket.on('user typing', handleUserTyping);
      socket.on('user stop typing', handleUserStopTyping);

      // Clean up
      return () => {
        socket.emit('leave room', selectedGroup?._id);
        socket.off('message recieved', handleMessageReceived);
        socket.off('users in room', handleUsersInRoom);
        socket.off('users joined', handleUserJoined);
        socket.off('user left', handleUserLeft);
        socket.off('notification', handleNotification);
        socket.off('user typing', handleUserTyping);
        socket.off('user stop typing', handleUserStopTyping);
      };
    }
  }, [selectedGroup, socket, toast])

  const fetchMessages = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("userInfo") || {});
      const token = currentUser?.token;
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/messages/${selectedGroup?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(data);
    } catch (error) {
      console.log(error.message);
    }
  }

  // send message
  const sendMessage = async()=>{
    if(!newMessage.trim()){
      return;
    }
    try {
      const token = currentUser.token;
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/messages`,{
        content: newMessage,
        groupId: selectedGroup?._id,
      },{
        headers:{Authorization: `Bearer ${token}`},
      });
      
      // Emit to socket (other users will receive via "message recieved" event)
      socket.emit('new message',{
        ...data,
        groupId: selectedGroup._id
      });
      
      // Add to local state immediately (optimistic update)
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (error) {
      toast({
        title:"Error sending messages",
        status:'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }
  const handleTyping = (e)=>{
    setNewMessage(e.target.value);
    if(!isTyping && selectedGroup){
      setIsTyping(true);
      socket.emit('typing', {
        username: currentUser?.username,
        groupId: selectedGroup?._id
      });
    }
    //clear existing timeout
    if(typingTimeoutRef.current){
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(()=>{
      if(selectedGroup){
        socket.emit('stop typing',{
          groupId: selectedGroup?._id,
        })
      }
      setIsTyping(false);
    },2000);
  };

  // format time
  const formatTime = (date)=>{
    return new Date(date).toLocaleDateString("en-US",{
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  // debounced server-side message search using text index
  useEffect(() => {
    if (!messageSearchQuery.trim() || !selectedGroup) {
      setMessageSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const token = currentUser?.token;
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/messages/${selectedGroup._id}/search`,
          {
            params: { q: messageSearchQuery },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setMessageSearchResults(data);
      } catch (error) {
        console.log("Message search error:", error.message);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [messageSearchQuery, selectedGroup]);

  // determine which messages to display
  const displayedMessages = messageSearchQuery.trim() ? messageSearchResults : messages;

  // fetch group analytics from aggregation endpoint
  const fetchAnalytics = async () => {
    if (!selectedGroup) return;
    setAnalyticsLoading(true);
    try {
      const token = currentUser?.token;
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/messages/${selectedGroup._id}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalyticsData(data);
    } catch (error) {
      console.log("Analytics error:", error.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // render typing indicator
  const renderTypingIndicator = ()=>{
    if(typingUsers.size === 0) return null;
    const typingUsersArray = Array.from(typingUsers);

    return typingUsersArray.map((username)=>(
      <Box 
      key={username}
      alignSelf={
        username === currentUser?.username ? 'flex-end' : 'flex-start'
      }
      maxW="70%"
      >
        <Flex align='center'
        bg = {username === currentUser.username ? 'blue.50' : 'gray.50'}
        p={2}
        borderRadius='lg'
        gap={2}
        >
          {/* current user (You) */}
          {
            username === currentUser?.username ? (
              <>
              <Avatar size='xs' name={username} />
              <Flex align="center" gap={1} >
                <Text fontSize='sm' color='gray.500' fontStyle='italic' >
                  You are typing
                </Text>
                <Flex gap={1}>
                  {[1,2,3].map((dot)=>(
                    <Box key={dot} w='3px' borderRadius='full' bg='gray.500' />
                  ))}
                </Flex>
              </Flex>
              </>
            ) : (
              <>
                <Flex align="center" gap={1} >
                <Text fontSize='sm' color='gray.500' fontStyle='italic' >
                  {username} is typing
                </Text>
                <Flex gap={1}>
                  {[1,2,3].map((dot)=>(
                    <Box key={dot} w='3px' borderRadius='full' bg='gray.500' />
                  ))}
                </Flex>
              </Flex>
              <Avatar size='xs' name={username} />
              </>
            )
          }
        </Flex>
      </Box>
    ))
  }
  // Sample data for demonstration
  const sampleMessages = [
    {
      id: 1,
      content: "Hey team! Just pushed the new updates to staging.",
      sender: { username: "Sarah Chen" },
      createdAt: "10:30 AM",
      isCurrentUser: false,
    },
    {
      id: 2,
      content: "Great work! The new features look amazing 🚀",
      sender: { username: "Alex Thompson" },
      createdAt: "10:31 AM",
      isCurrentUser: false,
    },
    {
      id: 3,
      content: "Thanks! Let's review it in our next standup.",
      sender: { username: "You" },
      createdAt: "10:32 AM",
      isCurrentUser: true,
    },
  ];

  return (
    <Flex h="100%" position="relative">
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        bg="gray.50"
        minW="0"
      >
        {selectedGroup ? (
          <>
          {/* Chat Header */}
        <Flex
          px={6}
          py={4}
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          align="center"
          boxShadow="sm"
        >
          <Icon as={FiMessageCircle} fontSize="24px" color="blue.500" mr={3} />
          <Box flex="1">
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              {selectedGroup.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {selectedGroup.description}
            </Text>
          </Box>
          <Tooltip label="Search messages" placement="bottom">
            <Box>
              <Icon
                as={showMessageSearch ? FiX : FiSearch}
                fontSize="20px"
                color={showMessageSearch ? "red.400" : "gray.400"}
                cursor="pointer"
                _hover={{ color: showMessageSearch ? "red.500" : "blue.500" }}
                mr={3}
                onClick={() => {
                  setShowMessageSearch(!showMessageSearch);
                  setMessageSearchQuery("");
                  setMessageSearchResults([]);
                }}
              />
            </Box>
          </Tooltip>
          <Tooltip label="Group analytics" placement="bottom">
            <Box>
              <Icon
                as={FiBarChart2}
                fontSize="20px"
                color="gray.400"
                cursor="pointer"
                _hover={{ color: "blue.500" }}
                onClick={() => {
                  setShowAnalytics(true);
                  fetchAnalytics();
                }}
              />
            </Box>
          </Tooltip>
        </Flex>

        {/* Message Search Bar */}
        {showMessageSearch && (
          <Box px={6} py={2} bg="white" borderBottom="1px solid" borderColor="gray.200">
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search messages in this group..."
                value={messageSearchQuery}
                onChange={(e) => setMessageSearchQuery(e.target.value)}
                borderRadius="lg"
                bg="gray.50"
                _focus={{ borderColor: "blue.400", bg: "white" }}
                autoFocus
              />
            </InputGroup>
            {messageSearchQuery.trim() && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                {messageSearchResults.length} result{messageSearchResults.length !== 1 ? "s" : ""} found
              </Text>
            )}
          </Box>
        )}

        {/* Messages Area */}
        <VStack
          flex="1"
          overflowY="auto"
          spacing={4}
          align="stretch"
          px={6}
          py={4}
          position="relative"
          sx={{
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              width: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "gray.200",
              borderRadius: "24px",
            },
          }}
        >
          {displayedMessages.map((message) => (
            <Box
              key={message._id}
              alignSelf={message?.sender._id ===currentUser?._id ? "flex-end" : "flex-start"}
              maxW="70%"
            >
              <Flex direction="column" gap={1}>
                <Flex
                  align="center"
                  mb={1}
                  justifyContent={
                    message.sender._id ===currentUser?._id ? "flex-end" : "flex-start"
                  }
                  gap={2}
                >
                  {message.sender._id ===currentUser?._id ? (
                    <>
                      <Avatar size="xs" name={message.sender.username} />
                      <Text fontSize="xs" color="gray.500">
                        You • {formatTime(message.createdAt)}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text fontSize="xs" color="gray.500">
                        {message.sender.username} • {formatTime(message.createdAt)}
                      </Text>
                      <Avatar size="xs" name={message.sender.username} />
                    </>
                  )}
                </Flex>

                <Box
                  bg={message?.sender._id ===currentUser?._id ? "blue.500" : "white"}
                  color={message?.sender._id ===currentUser?._id ? "white" : "gray.800"}
                  p={3}
                  borderRadius="lg"
                  boxShadow="sm"
                >
                  <Text>{message.content}</Text>
                </Box>
              </Flex>
            </Box>
          ))}
          {renderTypingIndicator()}
          {/* Invisible div for auto-scroll */}
          <div ref={messageEndRef} />
        </VStack>

        {/* Message Input */}
        <Box
          p={4}
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
          position="relative"
          zIndex="1"
        >
          <InputGroup size="lg">
            <Input
              placeholder="Type your message..."
              pr="4.5rem"
              bg="gray.50"
              border="none"
              value={newMessage}
              onChange={(e) => handleTyping(e)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              _focus={{
                boxShadow: "none",
                bg: "gray.100",
              }}
            />
            <InputRightElement width="4.5rem">
              <Button
                onClick={sendMessage}
                h="1.75rem"
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                _hover={{
                  transform: "translateY(-1px)",
                }}
                transition="all 0.2s"
              >
                <Icon as={FiSend} />
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
          </>
        ) : (
          <>
            <Flex h="100%"
              direction="column"
              align="center"
              justify="center"
              p={8}
              textAlign="center"
            >
              <Icon 
                as={FiMessageCircle}
                fontSize="64px"
                color="gray.300"
                mb={4}
              />
              <Text fontSize='xl' fontWeight="medium" color="gray.500" mb={2}>
                Welcome to the ChitChat
              </Text>
              <Text color="gray.500" mb={2}>
                Select a group from the Sidebar to start chatting
              </Text>
            </Flex>
          </>
        )}
      </Box>

      {/* Analytics Modal */}
      <Modal isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} size="lg" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <Flex align="center" gap={2}>
              <Icon as={FiBarChart2} color="blue.500" />
              <Text>{selectedGroup?.name} — Analytics</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {analyticsLoading ? (
              <Flex justify="center" py={10}>
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : analyticsData ? (
              <VStack spacing={5} align="stretch">
                {/* Overall Stats */}
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={3} textTransform="uppercase">Overview</Text>
                  <Flex gap={4} wrap="wrap">
                    <Box flex="1" bg="blue.50" p={3} borderRadius="lg" minW="120px">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">{analyticsData.overall.totalMessages}</Text>
                      <Text fontSize="xs" color="gray.500">Total Messages</Text>
                    </Box>
                    <Box flex="1" bg="green.50" p={3} borderRadius="lg" minW="120px">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">{analyticsData.overall.activeMemberCount}</Text>
                      <Text fontSize="xs" color="gray.500">Active Members</Text>
                    </Box>
                    <Box flex="1" bg="purple.50" p={3} borderRadius="lg" minW="120px">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {analyticsData.overall.lastMessage
                          ? new Date(analyticsData.overall.lastMessage).toLocaleDateString()
                          : "N/A"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">Last Activity</Text>
                    </Box>
                  </Flex>
                </Box>

                <Divider />

                {/* Top Senders */}
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={3} textTransform="uppercase">Top Senders</Text>
                  <VStack spacing={3} align="stretch">
                    {analyticsData.topSenders.map((sender, index) => (
                      <Flex key={sender._id} align="center" gap={3}>
                        <Badge colorScheme={index === 0 ? "yellow" : index === 1 ? "gray" : "orange"} borderRadius="full" px={2} fontSize="xs">
                          #{index + 1}
                        </Badge>
                        <Avatar size="xs" name={sender.username} />
                        <Box flex="1">
                          <Flex justify="space-between" mb={1}>
                            <Text fontSize="sm" fontWeight="medium">{sender.username}</Text>
                            <Text fontSize="xs" color="gray.500">{sender.messageCount} msgs</Text>
                          </Flex>
                          <Progress
                            value={(sender.messageCount / analyticsData.overall.totalMessages) * 100}
                            size="xs"
                            colorScheme={index === 0 ? "blue" : "gray"}
                            borderRadius="full"
                          />
                        </Box>
                      </Flex>
                    ))}
                    {analyticsData.topSenders.length === 0 && (
                      <Text fontSize="sm" color="gray.400" textAlign="center">No messages yet</Text>
                    )}
                  </VStack>
                </Box>

                <Divider />

                {/* Daily Activity */}
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={3} textTransform="uppercase">Daily Activity (Last 7 Days)</Text>
                  {analyticsData.dailyActivity.length > 0 ? (
                    <VStack spacing={2} align="stretch">
                      {analyticsData.dailyActivity.map(day => (
                        <Flex key={day.date} align="center" gap={3}>
                          <Text fontSize="xs" color="gray.500" minW="80px">{day.date}</Text>
                          <Progress
                            flex="1"
                            value={(day.count / Math.max(...analyticsData.dailyActivity.map(d => d.count))) * 100}
                            size="sm"
                            colorScheme="blue"
                            borderRadius="full"
                          />
                          <Text fontSize="xs" fontWeight="bold" color="gray.600" minW="30px" textAlign="right">{day.count}</Text>
                        </Flex>
                      ))}
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color="gray.400" textAlign="center">No activity in the last 7 days</Text>
                  )}
                </Box>
              </VStack>
            ) : (
              <Text color="gray.400" textAlign="center" py={10}>No data available</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Collapsible UsersList */}
      <Box position="relative" flexShrink={0}>
        <IconButton
          aria-label="Toggle members"
          icon={isUsersListOpen ? <FiChevronRight /> : <FiChevronLeft />}
          size="xs"
          bg="white"
          shadow="md"
          borderRadius="full"
          position="absolute"
          left="-14px"
          top="50%"
          transform="translateY(-50%)"
          zIndex={10}
          onClick={() => setIsUsersListOpen(!isUsersListOpen)}
          _hover={{ bg: "blue.50", color: "blue.500" }}
          border="1px solid"
          borderColor="gray.200"
        />
        <Box
          w={isUsersListOpen ? { base: "220px", xl: "260px" } : "0px"}
          overflow="hidden"
          transition="width 0.3s ease"
          height="100%"
        >
          <Box w={{ base: "220px", xl: "260px" }} h="100%">
            {selectedGroup && <UsersList users={connectedUsers} />}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default ChatArea;