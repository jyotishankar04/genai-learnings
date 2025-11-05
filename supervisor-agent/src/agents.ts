import { createAgent } from "langchain";
import {createCalendarEvent, getAvailableTimeSlots, sendEmail} from "./tools.ts";
import {model} from "./model.ts";

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


export {calendarAgent};
