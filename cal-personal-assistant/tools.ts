import { tool } from "@langchain/core/tools";
import { z } from "zod";
export const getCalendarEvents = tool(
    async ({ query }) => {
        return JSON.stringify([
            {
                date: "2026-01-01",
                title: "My calendar event",
                description: "This is a description of my calendar event.",
                link: "https://example.com",
                location: "My location",
                recipient: ["H6kXo@example.com"],
                status: "CONFIRMED",
                startDateTime: "2023-01-01T00:00:00Z",
                endDateTime: "2023-01-01T01:00:00Z"
            }, {
                date: "2025-01-01",
                title: "My calendar event",
                description: "This is a description of my calendar event.",
                link: "https://example.com",
                location: "My location",
                recipient: ["H6kXo@example.com"],
                status: "CONFIRMED",
                startDateTime: "2023-01-01T00:00:00Z",
                endDateTime: "2023-01-01T01:00:00Z"
            }
        ])
    },
    {
        name: "getCalendarEvents",
        description: "Use this tool to get calendar events.",
        schema: z.object({
            query: z.string().describe("The query to search calendar events."),
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
