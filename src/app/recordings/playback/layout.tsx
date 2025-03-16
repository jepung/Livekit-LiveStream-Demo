import React, { ReactNode, Suspense } from 'react'

const PlaybackLayout = ({ children }: { children: ReactNode }) => {
    return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
}

export default PlaybackLayout
