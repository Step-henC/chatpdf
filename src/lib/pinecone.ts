/* eslint-disable prefer-const */
import {Pinecone, PineconeRecord } from '@pinecone-database/pinecone'
import {RecursiveCharacterTextSplitter, Document} from '@pinecone-database/doc-splitter'
import { downloadFromS3 } from './s3-server'
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf"


import { getEmbeddings } from './embeddings';
import  md5 from 'md5';
import {convertToASCII} from './utils'

// npm i @types/md5 && npm i md5
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
})


type PDFPage = { // saw this when console logging result of PDFLoader
    pageContent: string,
    metadata: {
        loc: {pageNumber: number} 
                                    
    }
}
export async function loadS3IntoPinecone(fileKey: string){
    //obtain pdf -> download and read from pdf
    console.log("downloading s3 into fileysystem")
    const file_name = await downloadFromS3(fileKey)

    //load file name path into pdf loader to parse into text
    if (!file_name) {
        throw new Error("Cannot download from s3")
    }
    const pages = (await new PDFLoader(file_name).load()) as PDFPage[]

    //split pdf into smaller documents, like two or three sentances, for vectorizing
    const documents = await Promise.all(pages.map(prepareDocument))

    // vectorize and embed individual docs
    const vectors = await Promise.all(documents.flat().map(embedDocuments))
    console.log("VECTORS", vectors)

    //upload to pinecone
    const index = pinecone.Index('chatpdf')

    console.debug("Inserting vectors into pinecone")

    //filekey must be in all ascii chars otherwise throw error in pinecone
    // ensure we are uploading and querying the same pdf file
    const namespace = convertToASCII(fileKey);

    // upsert vector chunks
    //Pinecone's upsertChunks funcion deprecated
    //So recreating here based on pinecone documentation
    const upsertChunks = chunks(vectors);
    await Promise.all(upsertChunks.map((chunk) => index.namespace(namespace).upsert(chunk)))
    return documents[0]
}

async function embedDocuments(doc: Document) {
    try {

        const embeddings = await getEmbeddings(doc.pageContent);

        //id embedding within pinecone
        const hash = md5(doc.pageContent)

        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        } as PineconeRecord//as Vector type but deprecated

    }catch (e) {
        console.log("error embeding document", e)
        throw e;
    }
}

// text in prepareDocument metadata may be too large for pinecone, so 
// I minimize it here
export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}
async function prepareDocument(page: PDFPage) {
    let {pageContent, metadata} = page;
    pageContent = pageContent.replace(/\n/g, '') // replace new line chars with nothing

    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([new Document({pageContent, metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000) //pinecone allows only 36,000 bytes
    }})]); //splite multi-page pdf

    return docs;
}

/**Pinecone's chunkedUpsert function is deprecated
 * This code is from documentation example
 * Chunks vector array (I know, redundant since vector is an arr)
 * Into an arr of len 200 
 * batchsize 10 is in former chunckSize of the deprecated function and totally arbitrated.
 */
export function chunks(arr: PineconeRecord[], batchSize: number = 10) {
    const chunks = []

    for (let i =0; i < arr.length; i += batchSize) {
        chunks.push(arr.slice(i, i + batchSize))
    }
    return chunks;
}