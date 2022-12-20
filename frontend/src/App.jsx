import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { useCompositeState } from "ds4biz-core";
import {
  Box,
  Button,
  Flex,
  Spacer,
  Stack,
  Table,
  Tbody,
  Th,
  Tr,
  Td,
  Textarea,
  Thead,
  Tag,
  Heading,
  Center,
  Input,
  Text,
  HStack,
  Select,
  InputGroup,
  InputLeftAddon,
  Divider,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Image,
  Link,
} from "@chakra-ui/react";
import axios from "axios";
import urlJoin from "url-join";
import { RiDatabase2Fill, RiPlayLine } from "react-icons/ri";
import { TbWorld } from "react-icons/tb";
const baseURL = import.meta.env.VITE_BASE_URL || "/";
import icon from "./assets/images/favicon.ico";

function LivePanel({ state }) {
  return (
    <Flex w="100%" p="2rem">
      <Stack w="30%" h="100%">
        <Heading size="md">Text to be masked</Heading>
        <Textarea
          resize="none"
          value={state.value}
          h="80%"
          onChange={(e) => {
            state.anon = "";
            state.entities = [];
            state.value = e.target.value;
          }}
          placeholder="insert text to be masked"
          borderRadius={"15px"}
        />
        <InputGroup>
          <InputLeftAddon children="Url" />
          <Input
            type="text"
            value={state.url}
            placeholder="insert a url"
            onChange={(e) => (state.url = e.target.value)}
          />
        </InputGroup>
        <Button
          w="30%"
          isLoading={state.processing}
          onClick={(e) => {
            state.anon = "";
            state.entities = [];
            state.processing = true;
            axios
              .post(urlJoin(baseURL, "anonymize"), state.value, {
                headers: { "Content-Type": "application/json" },
              })
              .then((resp) => {
                state.anon = resp.data;
              })
              .finally(() => {
                state.processing = false;
              });
            axios
              .post(urlJoin(baseURL, "entities"), state.value, {
                headers: { "Content-Type": "application/json" },
              })
              .then((resp) => {
                if (Array.isArray(resp.data)) {
                  state.entities = resp.data;
                }
                if (resp.data?.label) {
                  state.entities = [resp.data];
                }
              });
          }}
          colorScheme="blue"
        >
          Mask
        </Button>
      </Stack>
      <Spacer />
      <Stack w="40%" px="4">
        {state.anon && (
          <>
            <Heading size="md">Masked result</Heading>
            <Box bg={"blue.50"} borderRadius="20px" p="1rem" overflowY={"auto"}>
              {state.anon}
            </Box>
          </>
        )}
      </Stack>
      <Spacer />
      <Stack w="25%">
        {state.entities.length > 0 && (
          <>
            <Heading size="md">Extracted entities</Heading>
            <Box w="100%" overflowY="auto">
              <Table>
                <Thead overflowY="auto">
                  <Tr>
                    <Th>Entities</Th>
                    <Th>Type</Th>
                  </Tr>
                </Thead>

                <Tbody h="40%">
                  {state.entities.map((el, i) => (
                    <Tr key={i}>
                      <Td>{el.text}</Td>
                      <Td>{el.label}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </>
        )}
      </Stack>
      <Spacer />
    </Flex>
  );
}
function URLProcessor({ state }) {
  return (
    <Flex p="2rem" w="100%" h="100%" direction="column">
      <InputGroup>
        <InputLeftAddon children="Url" />
        <Input
          type="text"
          value={state.url}
          placeholder="insert a url"
          onChange={(e) => (state.url = e.target.value)}
        />
      </InputGroup>
      <Spacer />
      <Button
        colorScheme={"blue"}
        w="20%"
        onClick={(e) =>
          axios
            .get(urlJoin(baseURL, "pdf/text"), {
              params: { url: state.url },
            })
            .then((resp) => {
              console.log(resp.data);
              state.value = resp.data;
              state.entities = [];
              state.anon = "";
            })
        }
      >
        Extract text
      </Button>
      <Spacer />
    </Flex>
  );
}
function DBProcessor({ state }) {
  const state2 = useCompositeState({ collections: {} });
  useEffect(() => {
    axios.get(urlJoin(baseURL, "collections")).then((resp) => {
      state2.collections = resp.data;
    });
  }, []);
  return (
    <Flex p="2rem" w="60%" h="50%" direction="column">
      <InputGroup>
        <InputLeftAddon children="Select collection" />
        <Select
          value={state.collection}
          onChange={(e) => (state.collection = e.target.value)}
        >
          <option />
          {Object.entries(state2.collections).map(([k, n]) => (
            <option key={k}>{k}</option>
          ))}
        </Select>
      </InputGroup>
      <Spacer />
      {state.collection && (
        <>
          <Stat
            bg="green.100"
            border={"1px"}
            p="1rem"
            borderRadius={"20px"}
            borderColor={"blue.100"}
            w="20%"
          >
            <StatLabel>Number of records:</StatLabel>
            <StatNumber>{state2.collections[state.collection]}</StatNumber>
          </Stat>
          <Spacer />
          <HStack>
            <Badge p="0.5rem" borderRadius="10px" colorScheme="red">
              Target collection
            </Badge>
            <Box fontWeight="bold">{state.collection}_masked</Box>
          </HStack>
          <Spacer />
          <Button
            colorScheme={"blue"}
            mt="2rem"
            w="20%"
            isLoading={state.dbprocessing}
            onClick={(e) => {
              state.dbprocessing = true;
              axios
                .post(urlJoin(baseURL, "maskdb"), state.value, {
                  headers: { "Content-Type": "application/json" },
                })
                .then((resp) => {
                  alert(`${resp.data.length} documents masked`);
                })
                .finally(() => {
                  state.dbprocessing = false;
                });
            }}
          >
            Mask collection
          </Button>
        </>
      )}
    </Flex>
  );
}

function App() {
  const state = useCompositeState({
    value: "",
    entities: [],
    selectedApp: "live",
    collection: "",
    apps: [
      { name: "Live demo", value: "live", icon: <RiPlayLine /> },
      // { name: "Web upload", value: "upload", icon: <TbWorld /> },
      //{ name: "Database masking", value: "db", icon: <RiDatabase2Fill /> },
    ],
    url: "",
    processing: false,
  });
  useEffect(() => {
    if (state.url) {
      state.entities = [];
      state.value = "";
      state.anon = "";
      axios
        .get(urlJoin(baseURL, "pdf/text"), {
          params: { url: state.url },
        })
        .then((resp) => {
          console.log(resp.data);
          state.value = resp.data;
        });
    }
  }, [state.url]);

  return (
    <Flex direction="column" h="100vh">
      <Flex w="100vw" h="98vh" fontFamily={"Arial, Helvetica, sans-serif"}>
        <Flex
          color="white"
          w="15%"
          backgroundImage={"linear-gradient(195deg,#42424a,#191919)"}
          m="1rem"
          border="1px"
          direction="column"
          borderRadius="20px"
          p="2rem"
        >
          <HStack>
            <Link href="https://loko-ai.com/" target="_blank">
              <Image mr="0.5rem" w="22px" src={icon} />
            </Link>
            <Heading size="md" py="2rem">
              Loko masking dashboard
            </Heading>
          </HStack>
          <Divider />
          <Stack w="100%" mt="2rem" textAlign="left">
            {state.apps.map((el) => {
              const flag = el.value === state.selectedApp;
              return (
                <Button
                  p="1rem"
                  h="3rem"
                  justifyContent="flex-start"
                  cursor="pointer"
                  borderRadius={"10px"}
                  key={el.value}
                  colorScheme={flag ? "orange" : "blue.50"}
                  as="div"
                  leftIcon={el.icon}
                  fontWeight={flag ? "bold" : "none"}
                  onClick={(e) => (state.selectedApp = el.value)}
                >
                  {el.name}
                </Button>
              );
            })}
          </Stack>
        </Flex>
        <Flex
          w="100%"
          m="1rem"
          borderRadius="20px"
          border={"1px"}
          borderColor={"blackAlpha.400"}
        >
          {state.selectedApp === "live" && <LivePanel state={state} />}
          {state.selectedApp === "upload" && <URLProcessor state={state} />}
          {state.selectedApp === "db" && <DBProcessor state={state} />}
        </Flex>
      </Flex>
      <Link href="http://loko-ai.com" target="_blank">
        <Center size="sm" h="10px">
          Powered by Loko.ai
        </Center>
      </Link>
    </Flex>
  );
}

export default App;
