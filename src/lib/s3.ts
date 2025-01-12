//upload file to s3

import AWS from 'aws-sdk'

export async function uploadToS3(file: File) {
    try {

        AWS.config.update({
            credentials: {
                accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY || ""
            },
        })

        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
            },
            region: 'us-east-1'
        })

        const file_key = `uploads/${Date.now().toString()}` + file.name.replace(' ', '-')// generate unique file Names + 

        const params = {
            Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
            Key: file_key,
            Body: file
        }
            // create progress bar
        const upload = s3.putObject(params).on("httpUploadProgress", evt => {
                console.log("uploading to s3...", parseInt((evt.loaded*100/evt.total).toString()) + "%");
        }).promise()

        await upload.then(() => {
            console.log("sucess uploaded to s3!", file_key)
        })

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