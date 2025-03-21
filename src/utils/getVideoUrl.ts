import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function getSignedVideoUrl(id: string, filePath: string) {
    try {
        const s3 = new S3Client({
            region: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION,
            credentials: {
                accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY!,
                secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY!,
            },
        })
        const command = new GetObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
            Key: filePath,
        })
        const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: 18000,
        })
        return signedUrl
    } catch (e) {
        console.log(e)
    }
}
