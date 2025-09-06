import { writeFileSync } from "fs";

export async function printGraph(agent,graphPath){
      try {
        const drawableGraphState = await agent.getGraphAsync();
        const graphStateImage = await drawableGraphState.drawMermaidPng();
        const graphStateArrayBuffer = await graphStateImage.arrayBuffer();
        const filePath = graphPath;
        writeFileSync(filePath, Buffer.from(graphStateArrayBuffer));
        console.log("Graph saved to graph.png");
      } catch (error) {
        console.log("Could not save graph visualization:", error.message);
      }
}