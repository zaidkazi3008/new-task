import { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Fetch user data from the server (if already authenticated)
        axios.get('/api/auth/me').then(response => {
            setUser(response.data);
            if (response.data) {
                fetchEvents(response.data._id);
            }
        });
    }, []);

    const fetchEvents = (userId) => {
        axios.get(`/api/calendar/events?userId=${userId}`).then(response => {
            setEvents(response.data);
        });
    };

    const handleAddEvent = () => {
        const event = {
            summary: 'New Event',
            start: {
                dateTime: new Date().toISOString(),
            },
            end: {
                dateTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
            }
        };
        axios.post('/api/calendar/events', { userId: user._id, event }).then(response => {
            fetchEvents(user._id);
        });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl">Tutor Calendar System</h1>
            {user ? (
                <div>
                    <h2 className="text-xl">Welcome, {user.name}</h2>
                    <button onClick={handleAddEvent} className="bg-blue-500 text-white p-2 rounded">
                        Add Event
                    </button>
                    <ul>
                        {events.map(event => (
                            <li key={event.id}>{event.summary} at {new Date(event.start.dateTime).toLocaleString()}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <a href="/api/auth/google" className="bg-blue-500 text-white p-2 rounded">Login with Google</a>
            )}
        </div>
    );
};

export default App;
