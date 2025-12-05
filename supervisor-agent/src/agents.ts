import { createAgent } from "langchain";
import {createCalendarEvent, getAvailableTimeSlots, getContacts, manageContactTool, manageEmailTool, scheduleEventTool, sendEmail} from "./tools.ts";
import {model} from "./model.ts";
import { MemorySaver } from "@langchain/langgraph";

const CALENDAR_AGENT_PROMPT = `
You are a calendar scheduling assistant.
Parse natural language scheduling requests (e.g., 'next Tuesday at 2pm')
into proper ISO datetime formats.
Use get_available_time_slots to check availability when needed.
Use create_calendar_event to schedule events.
Always confirm what was scheduled in your final response.
Current date is ${new Date().toISOString().split('T')[0]}
`.trim();

const calendarAgent = createAgent({
    model: model,
    tools: [createCalendarEvent, getAvailableTimeSlots],
    systemPrompt: CALENDAR_AGENT_PROMPT,
});


const EMAIL_AGENT_PROMPT = `
You are an email assistant.
Compose professional emails based on natural language requests.
Extract recipient information and craft appropriate subject lines and body text.
Use send_email to send the message.
Always confirm what was sent in your final response.
`.trim();

const emailAgent = createAgent({
    model: model,
    tools: [sendEmail],
    systemPrompt: EMAIL_AGENT_PROMPT,
});



// Contact agent
const CONTACT_AGENT_PROMPT = `
    You are an contact agent.
    Find or create contact records as per requirement.
    Use get_contacts to get the contact list.
`.trim();

const contactAgent = createAgent({
    model: model,
    tools: [getContacts],
    systemPrompt: CONTACT_AGENT_PROMPT,
});


const SUPERVISOR_PROMPT = `
You are a helpful personal assistant.
You can schedule calendar events and send emails.
You will get contact information from contact tool before sending emails.
Break down user requests into appropriate tool calls and coordinate the results.
When a request involves multiple actions, use multiple tools in sequence.
`.trim();
const checkpointer = new MemorySaver();
const supervisorAgent = createAgent({
  model: model,
  tools: [scheduleEventTool, manageEmailTool, manageContactTool],
  systemPrompt: SUPERVISOR_PROMPT,
  checkpointer,
});


export {calendarAgent,emailAgent,contactAgent,supervisorAgent};
