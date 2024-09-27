Assignment 1 - Web Server - Response to Criteria
================================================

Overview
------------------------------------------------

- **Name:** Samuel Nance
- **Student number:** n11611553
- **Application name:** Video converter
- **Two line description:** Application that lets users upload video files and convert them between formats, using ffmpeg.


Core criteria
------------------------------------------------

### Docker image


- **ECR Repository name:** n11611553-video-converter
- **Video timestamp:** 0:01
- **Relevant files:**
    - /Dockerfile

### Docker image running on EC2

- **EC2 instance ID:** i-01d211df2b3d20020
- **Video timestamp:** 0:24

### User login functionality

- **One line description:** Login screen with hard coded username and password list for two users, uses express-session
- **Video timestamp:** 0:26
- **Relevant files:**
    - /public/login.html
    - /src/app.js : 14, 61

### User dependent functionality

- **One line description:** Users can only access their own files and upload to their own directory
- **Video timestamp:** 0:59
- **Relevant files:**
    - /uploads/user1
    - /app.js 37, 71
    - /public/login.html


### Web client

- **One line description:** Multiple page client using seperate html pages.
- **Video timestamp:** 2:43
- **Relevant files:**
    - /public*
    - /app.js: 34, 40

### REST API

- **One line description:** Endpoints with http methods (POST, GET) for uploading and converting files
- **Video timestamp:** 1:24
- **Relevant files:**
    - /src/app.js
    - /src/routes

### Two kinds of data

#### First kind

- **One line description:** Stored video files in uploads folder
- **Type:** Unstrctured data
- **Rationale:** Large video files stored in directory
- **Video timestamp:** 2:24
- **Relevant files:**
    - /uploads
    - /app.js:27, 32 
    - /app.js: 107:109
    - /src/uploadController.js

#### Second kind

- **One line description:** Video file names, ownership
- **Type:** Structured
- **Rationale:** Video filenames are stored in seperate directories for each user
- **Video timestamp:**
- **Relevant files:**
  - /uploads

### CPU intensive task

- **One line description:** Converting video files to different formats
- **Video timestamp:** 2:30
- **Relevant files:**
    - /src/convertController.js
    - /app.js: 111, 122

### CPU load testing method

- **One line description:** Interacting with the web client is sufficient for demonstration, uses ffmpeg to convert between formats
- **Video timestamp:** 2:41
- **Relevant files:**
    - /src/controllers/convertController.js
    - /src/routes/convert.js
    - /src/app.js : 100, 124

Additional criteria
------------------------------------------------

### Extensive REST API features

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 


### Use of external API(s)

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 


### Extensive web client features

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 


### Sophisticated data visualisations

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 


### Additional kinds of data

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 


### Significant custom processing

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 


### Live progress indication

- **One line description:** Not attempted
- **Video timestamp:** 
- **Relevant files:**
    - 


### Infrastructure as code

- **One line description:** Not attempted
- **Video timestamp:** 
- **Relevant files:**
    - 


### Other

- **One line description:** Not attempted
- **Video timestamp:**
- **Relevant files:**
    - 
