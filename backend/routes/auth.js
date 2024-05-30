const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const config = require('../config');
const User = require('../models/User');

const oauth2Client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
);

router.get('/google', (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
    });
    const { data } = await oauth2.userinfo.get();

    let user = await User.findOne({ googleId: data.id });
    if (!user) {
        user = new User({
            googleId: data.id,
            email: data.email,
            name: data.name,
            token: tokens.access_token
        });
        await user.save();
    } else {
        user.token = tokens.access_token;
        await user.save();
    }

    res.redirect('/');  // Redirect to the frontend
});

module.exports = router;
