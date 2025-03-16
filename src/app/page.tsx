'use client'

import { LocalTrackPublication, Room } from 'livekit-client'
import { EgressInfo } from 'livekit-server-sdk'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { getLiveKitToken } from '../utils/livekitTokenGenerator'

export default function Home() {
    const pathname = usePathname()
    const webcamRef = useRef<HTMLVideoElement>(null)

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
    const [microphoneStream, setMicrophoneStream] =
        useState<MediaStream | null>(null)
    const [streamingRoom, setStreamingRoom] = useState<Room | null>(null)
    const [egressId, setEgressId] = useState<string>('')
    const [roomName, setRoomName] = useState<string>('')
    const [isStreaming, setIsStreaming] = useState<boolean>(false)

    const setupMedia = async (
        device: 'WEBCAM' | 'MICROPHONE' | 'SCREEN',
        type: 'START' | 'STOP'
    ) => {
        let media: LocalTrackPublication | undefined

        if (type === 'START') {
            switch (device) {
                case 'WEBCAM': {
                    media =
                        await streamingRoom?.localParticipant.setCameraEnabled(
                            true
                        )
                    break
                }
                case 'MICROPHONE': {
                    media =
                        await streamingRoom?.localParticipant.setMicrophoneEnabled(
                            true
                        )
                    break
                }
                case 'SCREEN': {
                    media =
                        await streamingRoom?.localParticipant.setScreenShareEnabled(
                            true,
                            {
                                audio: true,
                            }
                        )
                    break
                }
            }
            const mediaStream = media?.track?.mediaStream
            if (mediaStream) {
                switch (device) {
                    case 'WEBCAM': {
                        webcamRef.current!.srcObject = mediaStream
                        setWebcamStream(mediaStream)
                        break
                    }
                    case 'MICROPHONE': {
                        setMicrophoneStream(mediaStream)
                        break
                    }
                    case 'SCREEN': {
                        setScreenStream(mediaStream)
                        break
                    }
                }
            }
        } else {
            switch (device) {
                case 'WEBCAM': {
                    streamingRoom?.localParticipant.setCameraEnabled(false)
                    setWebcamStream(null)
                    break
                }
                case 'MICROPHONE': {
                    streamingRoom?.localParticipant.setMicrophoneEnabled(false)
                    setMicrophoneStream(null)
                    break
                }
                case 'SCREEN': {
                    streamingRoom?.localParticipant.setScreenShareEnabled(false)
                    setScreenStream(null)
                    break
                }
            }
        }
    }

    const initStreamingRoom = async (room: string, isPageReload?: boolean) => {
        try {
            setIsLoading(true)
            /**
             * Create user token
             */
            const userToken = await getLiveKitToken({
                room: room,
                identity: `host-${crypto.randomUUID()}`,
            })

            /**
             *  Connecting to room using auth token
             */
            const newRoom = new Room()
            await newRoom.connect(
                process.env.NEXT_PUBLIC_LIVEKIT_URL!,
                userToken
            )
            alert('Room initialized')

            if (!isPageReload) {
                await startRecording(room)
            }

            /**
             *  Setting up state
             */
            setRoomName(room)
            setIsStreaming(true)
            setStreamingRoom(newRoom)
            localStorage.setItem('isStreaming', JSON.stringify(true))
            localStorage.setItem('streamingRoomName', JSON.stringify(room))
        } catch (e) {
            await stopStreaming()
            if (e instanceof Error) {
                alert(e.message)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const stopStreaming = async () => {
        await stopRecording(egressId)
        await streamingRoom?.disconnect()

        setIsStreaming(false)
        setRoomName('')

        setupMedia('WEBCAM', 'STOP')
        setupMedia('MICROPHONE', 'STOP')
        setupMedia('SCREEN', 'STOP')

        localStorage.setItem('egressId', JSON.stringify(''))
        localStorage.setItem('isStreaming', JSON.stringify(false))
        localStorage.setItem('streamingRoomName', JSON.stringify(''))

        alert('Streaming OFF')
    }

    const startRecording = async (room: string) => {
        try {
            const res = await fetch('/api/start-egress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomName: room,
                }),
            })

            const data = (await res.json()) as EgressInfo

            console.log('Recording started:', data)
            setEgressId(data.egressId)
            localStorage.setItem('egressId', JSON.stringify(data.egressId))
            alert('Recording started')
        } catch (e) {
            await stopStreaming()
            if (e instanceof Error) {
                console.log(e)
                alert('Start recording error')
            }
        }
    }

    const stopRecording = async (egressId: string) => {
        try {
            const res = await fetch('/api/stop-egress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    egressId: egressId,
                }),
            })

            const data = await res.json()
            console.log('Recording stopped:', data)
            alert('Recording stopped')
        } catch (e) {
            if (e instanceof Error) {
                console.log(e)
                alert('Stop recording error')
            }
        }
    }

    const reconnectHandler = () => {
        let streamingRoomName = localStorage.getItem('streamingRoomName')
        let isStreaming = localStorage.getItem('isStreaming')
        let egressId = localStorage.getItem('egressId')

        if (streamingRoomName) {
            streamingRoomName = JSON.parse(streamingRoomName)
        }

        if (isStreaming) {
            isStreaming = JSON.parse(isStreaming)
        }

        if (egressId) {
            egressId = JSON.parse(egressId)
        }

        if (streamingRoomName && isStreaming && egressId) {
            alert('reconnecting')
            initStreamingRoom(streamingRoomName as string, true)
            setIsStreaming(Boolean(isStreaming))
            setRoomName(streamingRoomName)
            setEgressId(egressId)
            alert('reconnected')
        }
    }

    // Handling reconnecting if page refreshed
    useEffect(() => {
        reconnectHandler()
        window.onbeforeunload = () => {
            streamingRoom?.disconnect()
        }
    }, [])

    return (
        <div className="flex flex-col justify-center items-center p-20">
            <div className="flex flex-col items-center">
                <h1 className="text-3xl font-bold">LiveKit</h1>
                <Link
                    href={'/recordings'}
                    className="text-center cursor-pointer text-blue-500 underline"
                >
                    Go to list recordings
                </Link>
            </div>
            <form
                action={(form) => {
                    const inputRoomName = form.get('input-roomname')
                    if (inputRoomName) {
                        setRoomName(inputRoomName as string)
                    }
                    initStreamingRoom(inputRoomName as string)
                }}
                className="mt-10 flex gap-5"
            >
                <input
                    className="border px-5 py-3 rounded-md"
                    placeholder="Input room name"
                    name="input-roomname"
                />
                <button
                    disabled={isLoading}
                    type="submit"
                    className="px-5 py-3 border border-slate-500 rounded cursor-pointer"
                >
                    {isLoading ? 'Loading...' : 'Create'}
                </button>
            </form>
            {isStreaming && (
                <div className="flex gap-5 mt-5">
                    <button
                        onClick={() =>
                            webcamStream
                                ? setupMedia('WEBCAM', 'STOP')
                                : setupMedia('WEBCAM', 'START')
                        }
                        className={`bg-slate-800 py-2 px-5 rounded-md cursor-pointer`}
                    >
                        {webcamStream ? 'Stop Webcam' : 'Start Webcam'}
                    </button>
                    <button
                        onClick={() =>
                            microphoneStream
                                ? setupMedia('MICROPHONE', 'STOP')
                                : setupMedia('MICROPHONE', 'START')
                        }
                        className={`bg-slate-800 py-2 px-5 rounded-md cursor-pointer`}
                    >
                        {microphoneStream
                            ? 'Stop Microphone'
                            : 'Start Microphone'}
                    </button>
                    <button
                        onClick={() =>
                            screenStream
                                ? setupMedia('SCREEN', 'STOP')
                                : setupMedia('SCREEN', 'START')
                        }
                        className={`bg-slate-800 py-2 px-5 rounded-md cursor-pointer`}
                    >
                        {screenStream
                            ? 'Stop ShareScreen'
                            : 'Start ShareScreen'}
                    </button>
                    {isStreaming && (
                        <button
                            onClick={stopStreaming}
                            className={`bg-red-800 py-2 px-5 rounded-md cursor-pointer`}
                        >
                            Stop Streaming
                        </button>
                    )}
                </div>
            )}
            <div className="mt-5">
                <p className="text-center">
                    Status: {isStreaming ? 'Live on' : 'Live off'}
                </p>
                {isStreaming && (
                    <Link
                        href={pathname + `viewer?room=${roomName}`}
                        target="_blank"
                        className="text-center underline text-blue-500 cursor-pointer"
                    >
                        Go to viewer screen
                    </Link>
                )}
            </div>
            <div className="mt-10 border border-slate-500">
                <video
                    ref={webcamRef}
                    height={600}
                    width={500}
                    autoPlay
                    playsInline
                />
            </div>
        </div>
    )
}
