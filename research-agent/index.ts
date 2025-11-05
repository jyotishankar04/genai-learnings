import workflow, {langfuseHandler} from "./src/graph.ts";
import readline from "readline/promises";
import {AIMessage} from "@langchain/core/messages";


import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";

const sdk = new NodeSDK({
    spanProcessors: [new LangfuseSpanProcessor()],
});

sdk.start();

async  function  main(){
   try {
       const app = workflow.compile()
       const rl = readline.createInterface({
           input: process.stdin,
           output: process.stdout,
       })
       while (true){
           const question = await rl.question("User: ")
           if(question == '/bye' || question == 'exit'){
               break;
           }

           console.log("  Thinking...")
           const result = await app.invoke({
               messages: [
                   {
                       role: "user",
                       content: question,
                   }
               ]
           },{
               callbacks:[langfuseHandler]
           })

           console.log("=".repeat(80))
           console.log(`Final answer:`)
           console.log("=".repeat(80))
           const lastMessage = result.messages[result.messages.length-1]
           console.log((JSON.parse(lastMessage?.content as string).answer))

       }
       rl.close()
   }catch (error){
       console.error("Error:", error)
   }
}

main();
