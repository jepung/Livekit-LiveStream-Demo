import { atomWithStorage } from "jotai/utils";

const isStreamingAtom = atomWithStorage<boolean>("isStreaming", false);
const streamingRoomAtom = atomWithStorage<string>("streamingRoom", "");

export { isStreamingAtom, streamingRoomAtom };
