import { Box, VStack, Text, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, InputGroup, InputLeftElement, useToast, Flex, Icon, Badge, Tooltip } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiLogOut, FiPlus, FiSearch, FiUsers, FiTrash2, FiAlertTriangle } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
const Sidebar = ({ setSelectedGroup, socket }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupStats, setGroupStats] = useState({});
  const toast = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    checkAdminStatus();
    fetchGroups();
    fetchGroupStats();
  }, []);

  // Listen for real-time group deletion events
  useEffect(() => {
    if (!socket) return;
    const handleGroupDeleted = ({ groupId }) => {
      setGroups(prev => prev.filter(g => g._id !== groupId));
      setSelectedGroup(prev => prev?._id === groupId ? null : prev);
      fetchGroupStats();
      toast({
        title: 'Group Removed',
        description: 'A group has been deleted by the admin.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    };
    socket.on('group deleted', handleGroupDeleted);
    return () => socket.off('group deleted', handleGroupDeleted);
  }, [socket]);
  // check if login user is Admin
  const checkAdminStatus = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || {});
    setIsAdmin(userInfo?.isAdmin || false);
  }

  // fetch all groups
  const fetchGroups = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || {});
      const token = userInfo.token;
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/groups`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
      setGroups(data);

      const userGroupIds = data?.filter((group) => {
        return group?.members?.some((member) =>
          member?._id === userInfo?._id
        );
      }).map((group) => group._id);
      setUserGroups(userGroupIds);
    } catch (error) {
      toast({
        title: 'Error fetching groups',
        status: 'failed',
        duration: 3000,
        isClosable: true,
        description: error.message || 'An error occurred'
      });
    }
  }

  // fetch group stats from aggregation endpoint
  const fetchGroupStats = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo.token;
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/groups/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const statsMap = {};
      data.forEach(stat => { statsMap[stat._id] = stat; });
      setGroupStats(statsMap);
    } catch (error) {
      console.log("Stats error:", error.message);
    }
  };

  // debounced server-side group search using text index
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo.token;
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/groups/search`,
          {
            params: { q: searchQuery },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSearchResults(data);
      } catch (error) {
        console.log("Search error:", error.message);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // create groups
  const handleCreateGroup = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || {});
      const token = userInfo.token;
      await axios.post(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/groups`,
        {
          name: newGroupName,
          description: newGroupDescription
        }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      toast({
        title: 'Group Created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchGroups();
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (error) {
      toast({
        title: 'Error Group Created',
        status: 'failed',
        duration: 3000,
        isClosable: true,
        description: error.message || 'An error occurred'
      });
    }
  }

  // Join group
  const handleJoinGroup = async (groupId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || {});
      const token = userInfo.token;
      await axios.post(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/groups/${groupId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
      await fetchGroups();
      setSelectedGroup(groups.find(g => g._id === groupId))
      toast({
        title: 'Joined Group Successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: 'Error Joining Group',
        status: 'error',
        duration: 3000,
        isClosable: true,
        description: error.message || 'An error occurred'
      });
    }
  };

  // leave group
  const handleLeaveGroup = async (groupId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || {});
      const token = userInfo.token;
      await axios.post(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/groups/${groupId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
      await fetchGroups();
      setSelectedGroup(null)
      toast({
        title: 'Joined Left Successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: 'Error Leaving Group',
        status: 'error',
        duration: 3000,
        isClosable: true,
        description: error.message || 'An error occurred'
      });
    }
  };

  // delete group (admin only)
  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo.token;
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/groups/${groupToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onDeleteClose();
      setGroupToDelete(null);
      setSelectedGroup(null);
      await fetchGroups();
      await fetchGroupStats();
      toast({
        title: 'Group Deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Group',
        status: 'error',
        duration: 3000,
        isClosable: true,
        description: error.message || 'An error occurred'
      });
    }
  };

  // logout
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate("/login");
  }
  return (
    <Box
      h="100%"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      width="100%"
      display="flex"
      flexDirection="column"
    >
      <Flex
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
        position="sticky"
        top={0}
        zIndex={1}
        backdropFilter="blur(8px)"
        align="center"
        justify="space-between"
      >
        <Flex align="center">
          <Icon as={FiUsers} fontSize="24px" color="blue.500" mr={2} />
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Groups
          </Text>
        </Flex>
        {isAdmin && (
          <Tooltip label="Create New Group" placement="right">
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={onOpen}
              borderRadius="full"
            >
              <Icon as={FiPlus} fontSize="20px" />
            </Button>
          </Tooltip>
        )}
      </Flex>

      {/* Search Groups */}
      <Box px={4} pt={3} pb={1}>
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="lg"
            bg="gray.50"
            borderColor="gray.200"
            _hover={{ borderColor: "blue.300" }}
            _focus={{ borderColor: "blue.400", bg: "white" }}
          />
        </InputGroup>
      </Box>

      <Box flex="1" overflowY="auto" p={4} mb={16}>
        {searchQuery.trim().length >= 2 && (
          <Text fontSize="xs" color="gray.500" mb={2} px={1}>
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
          </Text>
        )}
        <VStack spacing={3} align="stretch">
          {(searchQuery.trim().length >= 2
            ? searchResults
            : searchQuery.trim().length === 1
              ? groups.filter((group) =>
                  group.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : groups
          ).map((group) => (
            <Box
            // ============= group.id ===========================
              key={group._id}
              p={4}
              cursor="pointer"
              borderRadius="lg"
              bg={userGroups.includes(group._id) ? "blue.50" : "gray.50"}
              borderWidth="1px"
              borderColor={userGroups.includes(group._id) ? "blue.200" : "gray.200"}
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "md",
                borderColor: "blue.300",
              }}
            >
              <Flex justify="space-between" align="center">
                <Box onClick={() => userGroups.includes(group?._id) && setSelectedGroup(group)}

                  flex="1">
                  <Flex align="center" mb={2}>
                    <Text fontWeight="bold" color="gray.800">
                      {group.name}
                    </Text>
                    {userGroups.includes(group._id) && (
                      <Badge ml={2} colorScheme="blue" variant="subtle">
                        Joined
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {group.description}
                  </Text>
                  {groupStats[group._id] && (
                    <Flex mt={1} gap={3} fontSize="xs" color="gray.400">
                      <Text>💬 {groupStats[group._id].totalMessages} msgs</Text>
                      <Text>👥 {groupStats[group._id].memberCount} members</Text>
                    </Flex>
                  )}
                </Box>
                <Button
                  size="sm"
                  colorScheme={userGroups.includes(group._id) ? "red" : "blue"}
                  variant={userGroups.includes(group._id) ? "ghost" : "solid"}
                  ml={3}
                  onClick={() => {
                    userGroups.includes(group._id)
                      ? handleLeaveGroup(group?._id)
                      : handleJoinGroup(group?._id)
                  }}
                  _hover={{
                    transform: userGroups.includes(group._id) ? "scale(1.05)" : "none",
                    bg: userGroups.includes(group._id) ? "red.50" : "blue.600",
                  }}
                  transition="all 0.2s"
                >
                  {userGroups.includes(group._id) ? (
                    <Text fontSize="sm" fontWeight="medium">
                      Leave
                    </Text>
                  ) : (
                    "Join"
                  )}
                </Button>
                {isAdmin && (
                  <Tooltip label="Delete group" placement="top">
                    <IconButton
                      icon={<Icon as={FiTrash2} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      ml={1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setGroupToDelete(group._id);
                        onDeleteOpen();
                      }}
                      _hover={{ bg: "red.50" }}
                      aria-label="Delete group"
                    />
                  </Tooltip>
                )}
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>

      <Box
        p={4}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        width="100%"
      >
        <Button
          onClick={handleLogout}
          variant="ghost"
          colorScheme="red"
          leftIcon={<Icon as={FiLogOut} />}
          _hover={{
            bg: "red.50",
            transform: "translateY(-2px)",
            shadow: "md",
          }}
          transition="all 0.2s"
        >
          Logout
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Create New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                focusBorderColor="blue.400"
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
                focusBorderColor="blue.400"
              />
            </FormControl>

            <Button
              colorScheme="blue"
              mr={3}
              mt={4}
              width="full"
              onClick={handleCreateGroup}
            >
              Create Group
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered size="sm">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <Flex align="center" gap={2}>
              <Icon as={FiAlertTriangle} color="red.500" fontSize="20px" />
              <Text>Delete Group</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="gray.600">
              Are you sure you want to delete this group? All messages will be <Text as="span" fontWeight="bold" color="red.500">permanently deleted</Text>. This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<Icon as={FiTrash2} />}
              onClick={handleDeleteGroup}
            >
              Delete Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;
