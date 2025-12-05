import { createAgent, tool } from "langchain";
import { z } from "zod";
import { calendarAgent, contactAgent, emailAgent } from "./agents";

const createCalendarEvent = tool(
    async ({ title, startTime, endTime, attendees, location }) => {
        // Stub: In practice, this would call Google Calendar API, Outlook API, etc.
        return `Event created: ${title} from ${startTime} to ${endTime} with ${attendees.length} attendees`;
    },
    {
        name: "create_calendar_event",
        description: "Create a calendar event. Requires exact ISO datetime format.",
        schema: z.object({
            title: z.string(),
            startTime: z.string().describe("ISO format: '2024-01-15T14:00:00'"),
            endTime: z.string().describe("ISO format: '2024-01-15T15:00:00'"),
            attendees: z.array(z.string()).describe("email addresses"),
            location: z.string().optional(),
        }),
    }
);

const sendEmail = tool(
    async ({ to, subject, body, cc }) => {
        // Stub: In practice, this would call SendGrid, Gmail API, etc.
        return `Email sent to ${to.join(', ')} - Subject: ${subject}`;
    },
    {
        name: "send_email",
        description: "Send an email via email API. Requires properly formatted addresses.",
        schema: z.object({
            to: z.array(z.string()).describe("email addresses"),
            subject: z.string(),
            body: z.string(),
            cc: z.array(z.string()).optional(),
        }),
    }
);

const getAvailableTimeSlots = tool(
    async ({ attendees, date, durationMinutes }) => {
        // Stub: In practice, this would query calendar APIs
        return ["09:00", "14:00", "16:00"];
    },
    {
        name: "get_available_time_slots",
        description: "Check calendar availability for given attendees on a specific date.",
        schema: z.object({
            attendees: z.array(z.string()),
            date: z.string().describe("ISO format: '2024-01-15'"),
            durationMinutes: z.number(),
        }),
    }
);

const getContacts = tool(async ({ search }) => {
    return JSON.stringify([
        { id: 1, team: "design", name: "Vijay", email: "vijay@qwikish.com" },
        { id: 2, team: "design", name: "Raj", email: "raj@qwikish.com" },
        { id: 3, team: "development", name: "Ravi", email: "ravi@qwikish.com" },
        { id: 4, team: "design", name: "Ramesh", email: "ramesh@qwikish.com" },
        { id: 5, team: "development", name: "Shyam", email: "shyam@qwikish.com" },
    ])
}, {
    name: "get_contacts",
    description: "get contacts list",
    schema: z.object({
        search: z.string().describe("search term to get contacts. eg: design or raj")
    })
})





// Agent tools 
const scheduleEventTool = tool(
    async ({ request }) => {
        const result = await calendarAgent.invoke({
            messages: [{ role: "user", content: request }]
        });
        const lastMessage = result.messages[result.messages.length - 1];
        return lastMessage?.text;
    },
    {
        name: "schedule_event",
        description: `
Schedule calendar events using natural language.

Use this when the user wants to create, modify, or check calendar appointments.
Handles date/time parsing, availability checking, and event creation.

Input: Natural language scheduling request (e.g., 'meeting with design team next Tuesday at 2pm')
    `.trim(),
        schema: z.object({
            request: z.string().describe("Natural language scheduling request"),
        }),
    }
);

const manageEmailTool = tool(
    async ({ request }) => {
        const result = await emailAgent.invoke({
            messages: [{ role: "user", content: request }]
        });
        const lastMessage = result.messages[result.messages.length - 1];
        return lastMessage?.text;
    },
    {
        name: "manage_email",
        description: `
Send emails using natural language.

Use this when the user wants to send notifications, reminders, or any email communication.
Handles recipient extraction, subject generation, and email composition.

Input: Natural language email request (e.g., 'send them a reminder about the meeting')
    `.trim(),
        schema: z.object({
            request: z.string().describe("Natural language email request"),
        }),
    }
);

const manageContactTool = tool(
    async ({ request }) => {
        const result = await contactAgent.invoke({
            messages: [{ role: "user", content: request }]
        });
        const lastMessage = result.messages[result.messages.length - 1];
        return lastMessage?.text;
    },
    {
        name: "manage_contact",
        description: `
Manage contacts using natural language.

Use this when the user wants to get contacts or single contact.
Handles recipient extraction, subject generation, and email composition.

Input: Natural language email request (e.g., 'Give me all contacts of design team')
    `.trim(),
        schema: z.object({
            request: z.string().describe("Natural language email request"),
        }),
    }
);








export { createCalendarEvent, sendEmail, getAvailableTimeSlots, getContacts, scheduleEventTool, manageEmailTool, manageContactTool };