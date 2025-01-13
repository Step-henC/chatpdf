//upload file to s3

import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3'


export async function uploadToS3(file: File) {
    try {

        const s3Client = new S3Client({
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY || ""
            },
        })
        
        const file_key = `uploads/${Date.now().toString()}` + file.name.replace(' ', '-')// generate unique file Names + 

        const upload = await s3Client.send(
            new PutObjectCommand({
                Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
                Key: file_key,
                Body: file,
            })
        )
    
            if(upload) {
                console.log("sucess uploaded to s3!", file_key)
            }

        return Promise.resolve({
            file_key,
            file_name: file.name
        })
    } catch(e) {
        console.log("ERROR Uploading to S3: ", e)
    }
}


export function getS3Url(file_key: string) {
   return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${file_key}`
}