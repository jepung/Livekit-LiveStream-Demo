import { atomWithStorage } from "jotai/utils";

const isStreamingAtom = atomWithStorage<boolean>("isStreaming", false);
const streamingRoomNameAtom = atomWithStorage<string>("streamingRoomName", "");
const streamingTokenAtom = atomWithStorage<string>("streamingToken", "");

export { isStreamingAtom, streamingRoomNameAtom, streamingTokenAtom };
