const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const axios = require('axios');

class IntegrationService {
  constructor() {
    this.oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    this.zoomHeaders = {
      'Authorization': `Bearer ${process.env.ZOOM_JWT_TOKEN}`,
      'Content-Type': 'application/json'
    };
  }

  async createBlankCalendarEvent(date, timeSlot) {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + 30); // 30-minute slots

    const event = {
      summary: 'Available for Booking',
      description: 'This slot is available for booking a consultation.',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      transparency: 'transparent', // Shows as 'Free' in calendar
      colorId: '9', // Light blue
    };

    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async updateCalendarEvent(eventId, appointment) {
    const [hours, minutes] = appointment.timeSlot.split('-')[1].split(':').map(Number);
    const startTime = new Date(appointment.date);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + 30);

    // Create Zoom meeting first
    const zoomMeeting = await this.createZoomMeeting(
      `Consultation with ${appointment.name}`,
      startTime,
      endTime
    );

    const event = {
      summary: `Consultation with ${appointment.name}`,
      description: `Consultation appointment with ${appointment.name}\n\n` +
                  `Company: ${appointment.companyName || 'N/A'}\n` +
                  `Services: ${appointment.services.join(', ')}\n\n` +
                  `Join Zoom Meeting:\n${zoomMeeting.join_url}\n\n` +
                  `Notes: ${appointment.notes || 'None'}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      attendees: [
        { email: appointment.email }
      ],
      conferenceData: {
        createRequest: {
          requestId: appointment.id,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      colorId: '1', // Blue
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours
          { method: 'popup', minutes: 30 }
        ]
      }
    };

    try {
      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      });

      return {
        calendarEvent: response.data,
        zoomMeeting
      };
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  async createZoomMeeting(topic, startTime, endTime) {
    try {
      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic,
          type: 2, // Scheduled meeting
          start_time: startTime.toISOString(),
          duration: 30, // 30 minutes
          timezone: 'America/Los_Angeles',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: true,
            mute_upon_entry: true,
            waiting_room: true,
            meeting_authentication: true
          }
        },
        { headers: this.zoomHeaders }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      throw error;
    }
  }
}

module.exports = new IntegrationService(); 