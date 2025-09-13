import { tool } from "@langchain/core/tools";
import { google } from "googleapis";
import { z } from "zod";
import tokens from "./tokens.json";
import crypto from "crypto";


const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

oauth2Client.setCredentials(tokens);
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export const getCalendarEvents = tool(
    async ({ query, timeMax, timeMin }) => {
        let events: any = [];
        console.log("✅ getEvents tool CALLED with query: ", query);
        try {

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
type attendees = {
    email: string
    displayName: string
}

type EventData = {
    summary: string;

    start: {
        timeZone: string;
        dateTime: string;
    };
    end: {
        timeZone: string;
        dateTime: string;
    };
    attendees: attendees[];
    description: string
}

export const createCalendarEvent = tool(
    async ({ title, description, start, end, attendees }) => {
        let event: any = [];
        try {
            event = await calendar.events.insert({
                calendarId: "primary",
                sendUpdates: "all",
                requestBody: {
                    summary: title,
                    description: description,
                    start: start,
                    end: end,
                    attendees: attendees,
                    conferenceData: {
                        createRequest: {
                            requestId: crypto.randomUUID(),
                            conferenceSolutionKey: {
                                type: "hangoutsMeet"
                            }
                        }
                    }
                },
                conferenceDataVersion:1
            })
            console.log(event.data);
        } catch (error) {
            console.log(error);
        }

        return JSON.stringify(event)
    },
    {
        name: "createCalendarEvent",
        description: "Use this tool to create a calendar event.",
        schema: z.object({
            title: z.string().describe("The title of the calendar event."),
            description: z.string().describe("The description of the calendar event."),
            start: z.object({ dateTime: z.string(), timeZone: z.string() }).describe("The start date and time of the calendar event."),
            end: z.object({ dateTime: z.string(), timeZone: z.string().describe("The end date and time of the calendar event. by default it will Kolkata time zone") }).describe("The end date and time of the calendar event."),
            attendees: z.array(z.object({ email: z.string(), displayName: z.string() })).describe("The attendees of the calendar event."),
        })
    }
);
