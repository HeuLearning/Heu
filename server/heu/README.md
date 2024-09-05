# API Documentation

## Endpoints

### `GET /get-user-role`
**Description**: Gets the user role. Possible roles include:
- `admin` ("ad")
- `instructor` ("in")
- `learner` ("st")

### `GET /user-sessions`
**Description**: Fetches all available learner sessions that have been viewed and approved by the admin. Later, instructors will be sorted into these sessions.

### `GET /admin-sessions`
**Description**: Fetches the learning organization that the admin is in charge of, including all their locations and all sessions for those locations.

### `GET /admin-sessions-location/{locationId}`
**Description**: Fetches all sessions for a specific location within the learning organization.

### `POST /admin-sessions-location`
**Description**: Admin can create sessions in bulk without specifying a location.

### `DELETE /admin-session-detail/{sessionId}`
**Description**: Deletes a session identified by the session ID.

### `GET /session-requirements/{locationId}`
**Description**: Gets session requirements for a specific location. Sessions created by the admin must meet these requirements.

### `GET /instructor-application-template`
**Description**: Used by the admin to retrieve the application template or form link for instructors to apply.

### `GET /instructor-applications-admin/{templateId}`
**Description**: Views all instructor applications for a given template.

### `POST /instructor-applications-admin`
**Description**: Admin can approve or reject an instructor application.

### `GET /instructor-sessions`
**Description**: Retrieves all sessions for an instructor, including confirmed, pending, or canceled sessions.

### `GET /instructor-sessions/{sessionId}/phases`
**Description**: Returns the learning plan for a session, including phases, modules, and exercises.

### `GET /instructor-sessions/{phaseId}/modules`
**Description**: Returns modules for a given phase. Note: This route is not currently used.

### `POST /instructor-sessions-detail/{sessionId}`
**Description**: Can confirm or cancel a session given the session ID.

### `GET /instructor-application-instance/{templateId}`
**Description**: Allows instructors to view the status of their application for a given template and location.

### `PUT /instructor-application-instance/put/{templateId}`
**Description**: Instructors can submit an application for a given template.

### `DELETE /instructor-application-instance/delete/{templateId}`
**Description**: Instructors can withdraw or delete their application for a given template.

