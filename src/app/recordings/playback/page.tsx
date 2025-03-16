'use client'

import { getEgressById } from '@/utils/getEgressById'
import { getSignedVideoUrl } from '@/utils/getVideoUrl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { IRecording } from '../page'

const PlaybackPage = () => {
    const id = useSearchParams().get('id')
    const videoRef = useRef<HTMLVideoElement>(null)
    const [egress, setEgress] = useState<IRecording>()
    const [videoUrl, setVideoUrl] = useState<string>('')

    const fetchEgress = async () => {
        const res = await getEgressById(id!)
        if (res) {
            setEgress(res)
        }
    }

    const fetchRecording = async () => {
        const res = await getSignedVideoUrl(
            egress!.file.location,
            egress!.file.filename
        )
        if (res) {
            setVideoUrl(res)
        }
    }

    /**
     * Fetch egress data first
     */
    useEffect(() => {
        if (id) {
            fetchEgress()
        }
    }, [id])

    /**
     * Fetch recording if egress exist
     */
    useEffect(() => {
        if (egress) {
            fetchRecording()
        }
    }, [egress])

    return (
        <div className="flex flex-col items-center pt-20">
            <h1 className="text-3xl font-bold">Playback From S3 AWS</h1>
            <div className="mt-10">
                {videoUrl && (
                    <video ref={videoRef} src={videoUrl} autoPlay controls />
                )}
            </div>
        </div>
    )
}

export default PlaybackPage
