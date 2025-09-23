import express from "express"
import { google } from 'googleapis'
const app = express()

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)



app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.get("/auth/google", (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/blogger',
        'https://www.googleapis.com/auth/calendar'
    ];

    const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        prompt: 'consent',
        // If you only need one scope, you can pass it as a string
        scope: scopes
    });

    console.log(`Url: ${url}`)
    res.redirect(url)
})

app.get('/google/callback', async (req, res) => {
    const code = req.query.code as string

    const tokens = await oauth2Client.getToken(code)
    console.log(`Tokens: ${JSON.stringify(tokens.tokens)}`)
    // exchange code for access token and refresh token

    res.send("Connected. You can close the tab now.");
})


app.listen(3000, () => {
    console.log("Server started on port 3000")
})