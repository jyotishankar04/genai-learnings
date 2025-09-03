import { indexTheDocs } from "./prepare.js";




export async function main() {
    const filePath = "./qwikish.pdf";
    const chunks = await indexTheDocs(filePath);
    console.log(chunks);
}

main();