import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore, PineconeEmbeddings } from "@langchain/pinecone";


import dotenv from "dotenv";
dotenv.config();

const embeddings = new PineconeEmbeddings({
    apiKey: process.env.PINECONE_API_KEY,
    model:"multilingual-e5-large"
});


const pinecone =  new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY
});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  maxConcurrency: 5,
});

export async function indexTheDocs(filePath) {
    console.log("Indexing docs...");
    const loader = new PDFLoader(filePath,{
        splitPages: false
    })
    const docs = await loader.load()

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const chunks = await textSplitter.splitText(docs[0].pageContent);
    const indexedChunks = chunks.map((chunk) => {
      return {
        pageContent: chunk,
        metadata: docs[0].metadata,
      }
    });

    try {
        await vectorStore.addDocuments(indexedChunks);
        console.log("Indexed docs");
    } catch (error) {
        console.log(error);
    }
    return  indexedChunks;
}

