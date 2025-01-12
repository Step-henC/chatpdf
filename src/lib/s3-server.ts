import {GetObjectCommand, S3Client} from '@aws-sdk/client-s3'
import toast from 'react-hot-toast'
import fs from 'node:fs'



export async function downloadFromS3(fileKey: string){ //from local computer
    try {
        const s3Client = new S3Client({
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY || ""
            }
        })
            const fileObj = await s3Client.send(
                new GetObjectCommand({
                    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
                    Key: fileKey
                })
            );
            const file_name = `/tmp/pdf-${Date.now()}.pdf` //download into our file syyst
            const localFile = await fileObj.Body?.transformToByteArray();
            if (!localFile) {
                throw new Error("cannot get file from s3");
            }
            fs.writeFileSync(file_name, localFile as Buffer)
            return file_name;
    } catch (e) {
        toast.error("Cannot obtain file")
        console.log(e)
        return null;
    }
}