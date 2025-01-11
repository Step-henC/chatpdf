import {Pinecone, PineconeRecord, } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server'
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf"

//Pinecone should have recursive text splitter but cannot find in docs
// Pinecone docs show langchain as the text splitter, so going with that
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; 
import { getEmbeddings } from './embeddings';
import md5 from 'md5';
import {convertToASCII} from './utils'

// npm i @types/md5
let pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
    maxRetries: 5,
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

    //upload to pinecone
    const index = pinecone.Index('chatpdf')

    console.debug("Inserting vectors into pinecone")

    const namespace = convertToASCII(fileKey);

    await index.upsert(vectors)

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
            metadata: doc.metadata

        } as PineconeRecord//as Vector type but not found in module

    }catch (e) {
        console.log("error embeding document", e)
        throw e;
    }
}

//applicable to pinecones text splitter so we will see if langchain is fine
export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}
async function prepareDocument(page: PDFPage) {
    let {pageContent, metadata} = page;
    pageContent = pageContent.replace(/\n/g, '') // replace new line chars with nothing

    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([new Document({pageContent, metadata})]);

    return docs;
}