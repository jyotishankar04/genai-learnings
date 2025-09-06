/*
** Biryani **
--start-- ----> Node !inbuilt
1. cut the vagitables ---> Node
2. boil the vagitables ----> Node
3. add the salt ----> Node
4. taste the biryani ----> Node
--end-- ----> Node !inbuilt
**/

import { END, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { writeFileSync } from "fs";
function cutTheVagitables(state) {
  console.log("cut the vagitables");
  return state;
}

function boilTheVagitables(state) {
  console.log("boil the vagitables");
  return state;
}

function addTheSalt(state) {
  console.log("add the salt");
  return state
}

function tasteTheBiryani(state) {
  console.log("taste the biryani");
  return state
}
// Where to go
function whereToGo() {
  if (true) {
    return "__end__";
  } else {
    return "addTheSalt";
  }
}

const graph = new StateGraph(MessagesAnnotation)
  .addNode("cutTheVagitables", cutTheVagitables)
  .addNode("boilTheVagitables", boilTheVagitables)
  .addNode("addTheSalt", addTheSalt)
  .addNode("tasteTheBiryani", tasteTheBiryani)
  .addEdge("__start__", "cutTheVagitables")
  .addEdge("cutTheVagitables", "boilTheVagitables")
  .addEdge("boilTheVagitables", "addTheSalt")
  .addEdge("addTheSalt", "tasteTheBiryani")
  .addConditionalEdges("tasteTheBiryani", whereToGo,{
    __end__: END,
    addTheSalt:"addTheSalt" 
  });

const biryaniProcess = graph.compile();
  try {
    const drawableGraphState = await biryaniProcess.getGraphAsync();
    const graphStateImage = await drawableGraphState.drawMermaidPng();
    const graphStateArrayBuffer = await graphStateImage.arrayBuffer();
    const filePath = "./biryani-graph.png";
    writeFileSync(filePath, Buffer.from(graphStateArrayBuffer));
    console.log("Graph saved to graph.png");
  } catch (error) {
    console.log("Could not save graph visualization:", error.message);
  }
async function main() {
  const finalState = await biryaniProcess.invoke({
    messages: [],
    console: true,
  });
  console.log(finalState);
}

main();
