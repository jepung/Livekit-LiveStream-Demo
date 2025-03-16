'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { getListEgress } from '../../utils/getListEgress'

export interface IRecording {
    roomName: string
    egressId: string
    status: string
    file: {
        filename: string
        location: string
    }
}

const RecordingsPage = () => {
    const [recordings, setRecordings] = useState<IRecording[]>([])

    const fetchRecordings = async () => {
        const egressList = (await getListEgress()) as IRecording[]
        setRecordings(egressList)
    }

    useEffect(() => {
        fetchRecordings()
    }, [])

    return (
        <div className="w-screen h-screen flex flex-col items-center  py-20">
            <div>
                <h1 className="text-3xl font-bold">List of Recordings</h1>
            </div>

            <div className="mt-5">
                {recordings.length > 0 ? (
                    <table className="border-collapse">
                        <thead className="border border-slate-500">
                            <tr>
                                <th className="border border-slate-500 py-2">
                                    Room
                                </th>
                                <th className="border border-slate-500">
                                    Status
                                </th>
                                <th className="border border-slate-500">
                                    Recording
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recordings.map((recording) => (
                                <tr
                                    key={recording.egressId}
                                    className="border border-slate-500"
                                >
                                    <td className="border border-slate-500 px-5 py-3">
                                        <h2>{recording.roomName}</h2>
                                    </td>
                                    <td className="border border-slate-500 px-5 py-3">
                                        <p>{recording.status}</p>
                                    </td>
                                    <td className="border border-slate-500 px-5 py-3">
                                        <Link
                                            target="_blank"
                                            className="cursor-pointer underline text-blue-500"
                                            href={`/recordings/playback?id=${recording.egressId}`}
                                        >
                                            {recording.file.filename}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    )
}

export default RecordingsPage
