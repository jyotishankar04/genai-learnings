import { tool } from "@langchain/core/tools";
import { google } from "googleapis";
import { z } from "zod";
import crypto from "crypto";
import { TavilySearch } from "@langchain/tavily";


const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    access_token: process.env.GOOGLE_ACCESS_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export const getCalendarEvents = tool(
    async ({ query, timeMax, timeMin }) => {
        let events: any = [];
        // console.log("✅ getEvents tool CALLED with query: ", query);
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
        // console.log(events)
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

export const createCalendarEvent = tool(
    async ({ title, description, start, end, attendees, addMeetLink = false }) => {
        let event: any = null; // Changed from [] to null
        try {
            const requestBody: any = {
                summary: title,
                description: description,
                start: start,
                end: end,
                attendees: attendees
            };

            // Only add conference data if meeting link is requested
            if (addMeetLink) {
                requestBody.conferenceData = {
                    createRequest: {
                        requestId: crypto.randomUUID(),
                        conferenceSolutionKey: {
                            type: "hangoutsMeet"
                        }
                    }
                };
            }

            event = await calendar.events.insert({
                calendarId: "primary",
                sendUpdates: "all",
                conferenceDataVersion: addMeetLink ? 1 : 0, // Dynamic version based on meet link
                requestBody: requestBody
            });

            // console.log('Event created successfully:', event.data);
            return JSON.stringify(event.data); // Return event.data instead of event
        } catch (error) {
            console.error('Error creating calendar event:', error);
            throw error; // Re-throw error for better debugging
        }
    },
    {
        name: "createCalendarEvent",
        description: "Use this tool to create a calendar event with optional Google Meet link.",
        schema: z.object({
            title: z.string().describe("The title of the calendar event."),
            description: z.string().describe("The description of the calendar event."),
            start: z.object({
                dateTime: z.string(),
                timeZone: z.string().describe("Current IANA timezone string")
            }).describe("The start date and time of the calendar event."),
            end: z.object({
                dateTime: z.string(),
                timeZone: z.string().describe("Current IANA timezone string")
            }).describe("The end date and time of the calendar event."),
            attendees: z.array(z.object({
                email: z.string(),
                displayName: z.string()
            })).describe("The attendees of the calendar event."),
            addMeetLink: z.boolean().optional().default(false).describe("Whether to add a Google Meet link to the event.")
        })
    }
);

export const updateCalendarEvent = tool(
    async ({ eventId, title, description, start, end, attendees, addMeetLink, removeMeetLink = false }) => {
        let event: any = null;
        try {
            // STEP 1: Get existing event to preserve all fields
            const existingEvent = await calendar.events.get({
                calendarId: "primary",
                eventId: eventId
            });

            // STEP 2: Merge changes with existing data
            const updatedEvent = {
                ...existingEvent.data,
                // Only update fields that are explicitly provided
                ...(title && { summary: title }),
                ...(description && { description: description }),
                ...(start && { start: start }),
                ...(end && { end: end }),
                ...(attendees && { attendees: attendees })
            };

            // Handle conference data
            let conferenceDataVersion = 0;

            if (removeMeetLink) {
                // Remove existing conference data
                delete updatedEvent.conferenceData;
                delete updatedEvent.hangoutLink;
                conferenceDataVersion = 1;
            } else if (addMeetLink) {
                // Add new conference data
                updatedEvent.conferenceData = {
                    createRequest: {
                        requestId: crypto.randomUUID(),
                        conferenceSolutionKey: {
                            type: "hangoutsMeet"
                        }
                    }
                };
                conferenceDataVersion = 1;
            } else if (existingEvent.data.conferenceData) {
                // Preserve existing conference data
                conferenceDataVersion = 1;
            }

            // STEP 3: Update with complete event object
            event = await calendar.events.update({
                calendarId: "primary",
                eventId: eventId,
                sendUpdates: "all",
                conferenceDataVersion: conferenceDataVersion,
                requestBody: updatedEvent
            });

            // console.log('Event updated successfully:', event.data);
            return JSON.stringify(event.data);
        } catch (error) {
            console.error('Error updating calendar event:', error);
            throw error;
        }
    },
    {
        name: "updateCalendarEvent",
        description: "Use this tool to update an existing calendar event while preserving all existing data.",
        schema: z.object({
            eventId: z.string().describe("The ID of the event to update."),
            title: z.string().optional().describe("The new title of the calendar event."),
            description: z.string().optional().describe("The new description of the calendar event."),
            start: z.object({
                dateTime: z.string(),
                timeZone: z.string()
            }).optional().describe("The new start date and time."),
            end: z.object({
                dateTime: z.string(),
                timeZone: z.string()
            }).optional().describe("The new end date and time."),
            attendees: z.array(z.object({
                email: z.string(),
                displayName: z.string()
            })).optional().describe("The new attendees list."),
            addMeetLink: z.boolean().optional().describe("Whether to add a Google Meet link to the event."),
            removeMeetLink: z.boolean().optional().default(false).describe("Whether to remove the existing Google Meet link.")
        })
    }
);

export const deleteCalendarEvent = tool(
    async ({ eventId }) => {
        await calendar.events.delete({
            calendarId: "primary",
            eventId: eventId
        });
        console.log('Event deleted successfully');
        return "Event deleted successfully";
    },
    {
        name: "deleteCalendarEvent",
        description: "Use this tool to delete a calendar event.",
        schema: z.object({
            eventId: z.string().describe("The ID of the event to delete.")
        })
    }
);

// Tavili search tool 
export const TavilyWebSearch = new TavilySearch({
    maxResults: 3,
    topic: "general",
});