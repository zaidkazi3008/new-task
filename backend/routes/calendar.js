const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const User = require('../models/User');

router.get('/events', async (req, res) => {
    const userId = req.query.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.token });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    calendar.events.list(
        {
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
        },
        (err, result) => {
            if (err) return res.status(500).json({ msg: 'Error fetching events' });
            res.json(result.data.items);
        }
    );
});

router.post('/events', async (req, res) => {
    const { userId, event } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: user.token });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    calendar.events.insert(
        {
            calendarId: 'primary',
            resource: event
        },
        (err, result) => {
            if (err) return res.status(500).json({ msg: 'Error creating event' });
            res.json(result.data);
        }
    );
});

module.exports = router;
