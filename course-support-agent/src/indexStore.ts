import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PineconeStore, PineconeEmbeddings } from '@langchain/pinecone';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';


const embeddings = new PineconeEmbeddings({
    model: 'multilingual-e5-large',
})
const pinecone = new PineconeClient();
const indexName = process.env.PINECONE_INDEX;
if (!indexName) {
    throw new Error("PINECONE_INDEX_NAME environment variable not set!");
}

const pineconeIndex = pinecone.Index(indexName);

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
});

export async function indexTheDocument() {
    try {
        console.log("Loading PDF...");
        const loader = new PDFLoader(`${process.cwd()}/learning.pdf`, { splitPages: false });
        const doc = await loader.load();
        console.log("PDF Loaded");

        console.log("Splitting text...");
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 100,
        });

        const texts = await textSplitter.splitText(doc[0]!.pageContent);
        console.log("Text Split", texts);

        const documents = texts.map((chunk, index) => {
            return {
                id: `page-${index}`,
                pageContent: chunk,
                metadata: doc[0]!.metadata,
            };
        });

        console.log("Documents prepared");

        console.log("Adding documents to vector store..." + documents.length);
        const startTime = Date.now();
        await vectorStore.addDocuments(documents);
        const endTime = Date.now();
        console.log(`Documents added in ${endTime - startTime} ms`);
    } catch (error) {
        console.error("Error indexing document:", error);
    }
}
// indexTheDocument();
