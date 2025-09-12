import { tool } from "@langchain/core/tools";
import { google } from "googleapis";
import { z } from "zod";
import tokens from "./tokens.json";
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

oauth2Client.setCredentials(tokens);


export const getCalendarEvents = tool(
    async ({ query,timeMax,timeMin }) => {
        let events:any = [];
        console.log("✅ getEvents tool CALLED with query: ", query);
        try {
            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
            const res = await calendar.events.list({
                calendarId: 'primary',
                q: query,
                timeMin,
                timeMax
            });
            events = res.data.items?.map((event) => {
                return {
                    id: event.id,
                    status: event.status,
                    created: event.created,
                    updated: event.updated,
                    summary: event.summary,
                    description: event.description,
                    location: event.location,
                    creator: event.creator,
                    organizer: event.organizer,
                    start: event.start,
                    end: event.end,
                    hangoutLink: event.hangoutLink,
                    attendees: event.attendees,
                    htmlLink: event.htmlLink,
                    eventType: event.eventType
                }
            });
        } catch (error) {
            console.log(error);
        }
        console.log(events)
        return JSON.stringify(events);
        // return JSON.stringify([
        //     {
        //         date: "2026-01-01",
        //         title: "My calendar event",
        //         description: "This is a description of my calendar event.",
        //         link: "https://example.com",
        //         location: "My location",
        //         recipient: ["H6kXo@example.com"],
        //         status: "CONFIRMED",
        //         startDateTime: "2023-01-01T00:00:00Z",
        //         endDateTime: "2023-01-01T01:00:00Z"
        //     }, {
        //         date: "2025-01-01",
        //         title: "My calendar event",
        //         description: "This is a description of my calendar event.",
        //         link: "https://example.com",
        //         location: "My location",
        //         recipient: ["H6kXo@example.com"],
        //         status: "CONFIRMED",
        //         startDateTime: "2023-01-01T00:00:00Z",
        //         endDateTime: "2023-01-01T01:00:00Z"
        //     },{
        //         date: "2025-09-11",
        //         title: "My calendar event",
        //         description: "This is a description of my calendar event.",
        //         link: "https://example.com",
        //         location: "My location",
        //         recipient: ["H6kXo@example.com"],
        //         status: "CONFIRMED",
        //         startDateTime: "2023-01-01T00:00:00Z",
        //         endDateTime: "2023-01-01T01:00:00Z"
        //     }
        // ])
    },
    {
        name: "getCalendarEvents",
        description: "Use this tool to get calendar events.",
        schema: z.object({
            query: z.string().describe("The query to search calendar events.  it can be one of these values: summary, description,location,display name, attendees email,organiser's email"),
            timeMin: z.string().describe("The start date and time of the calendar event.").optional(),
            timeMax: z.string().describe("The end date and time of the calendar event.").optional(),
        }),
    }
);

export const createCalendarEvent = tool(
    async (input: any ) => {
        const { title, description, startDateTime, endDateTime, recipient } = input as {
            title: string;
            description: string;
            startDateTime: string;
            endDateTime: string;
            recipient: string[];
        };
        return JSON.stringify({
            title,
            description,
            startDateTime,
            endDateTime,
            recipient
        });
    },
    {
        name: "createCalendarEvent",
        description: "Use this tool to create a calendar event.",
        schema: z.object({
            title: z.string().describe("The title of the calendar event."),
            description: z.string().describe("The description of the calendar event."),
            startDateTime: z.string().describe("The start date and time of the calendar event."),
            endDateTime: z.string().describe("The end date and time of the calendar event."),
            recipient: z.array(z.string()).describe("The list of recipient email addresses."),
        }),
    }
);
