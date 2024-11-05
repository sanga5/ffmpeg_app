############Assignment 1 - Web Server - Response to Criteria
================================================

Instructions
------------------------------------------------
- Keep this file named A2_response_to_criteria.md, do not change the name
- Upload this file along with your code in the root directory of your project
- Upload this file in the current Markdown format (.md extension)
- Do not delete or rearrange sections.  If you did not attempt a criterion, leave it blank
- Text inside [ ] like [eg. S3 ] are examples and should be removed


Overview
------------------------------------------------

- **Name:** Samuel Nance
- **Student number:** n11611553
- **Partner name (if applicable):**
- **Application name:** Video Converter
- **Two line description:** Application that lets users upload video files and convert them between formats, using ffmpeg.
- **EC2 instance name or ID:** i-0ec93f7f8cebcadb7

Core criteria
------------------------------------------------

### Core - First data persistence service

- **AWS service name:**  S3
- **What data is being stored?:** Video files
- **Why is this service suited to this data?:** Large video files are best stored using the blob storage service due to its large storage limits.
- **Why is are the other services used not suitable for this data?:** Other storage services may not have the ability to store large file sizes such as videos, as well as have the ability to easily download them through presigned links.
- **Bucket/instance/table name:** n11611553-test
- **Video timestamp:** 0:16
- **Relevant files:**
    - src/S3.js
    - src/app.js : (174,187), (219,222), (283,308)

### Core - Second data persistence service

- **AWS service name:** DynamoDB
- **What data is being stored?:** video metadata such as video name and timestamp.
- **Why is this service suited to this data?:** DynamoDB is suited to this data as its noSQL is efficient at storing data.
- **Why is are the other services used not suitable for this data?:** Other services may not have the ease of setup and noSQL features found in dynamoDB such as its key system.
- **Bucket/instance/table name:** n11611553-assignment
- **Video timestamp:** 0:25
- **Relevant files:**
    - index.js
    - app.js : (198), (294)

### Third data service

- **AWS service name:**  [eg. RDS]
- **What data is being stored?:** [eg video metadata]
- **Why is this service suited to this data?:** [eg. ]
- **Why is are the other services used not suitable for this data?:** [eg. Advanced video search requires complex querries which are not available on S3 and inefficient on DynamoDB]
- **Bucket/instance/table name:**
- **Video timestamp:**
- **Relevant files:**
    -

### S3 Pre-signed URLs

- **S3 Bucket names:** n11611553-test
- **Video timestamp:** 0:53
- **Relevant files:**
    - S3.js
    - app.js : 332

### In-memory cache

- **ElastiCache instance name:**
- **What data is being cached?:** [eg. Thumbnails from YouTube videos obatined from external API]
- **Why is this data likely to be accessed frequently?:** [ eg. Thumbnails from popular YouTube videos are likely to be shown to multiple users ]
- **Video timestamp:**
- **Relevant files:**
    -

### Core - Statelessness

- **What data is stored within your application that is not stored in cloud data services?:** Video files are downloaded to the local disk to be converted, however they are deleted and are not needed to be stored permanently.
- **Why is this data not considered persistent state?:** All files stored on local disk are removed as all files are stored in S3.
- **How does your application ensure data consistency if the app suddenly stops?:** If the app suddenly stops then the current operation will cease to work and the files uploaded and/or converted will not be avaliable. This will be obvious as the data will not appear on any file lists and the user can retry their task.
- **Relevant files:**
    - app.js : 254, 289

### Graceful handling of persistent connections

- **Type of persistent connection and use:** [eg. server-side-events for progress reporting]
- **Method for handling lost connections:** [eg. client responds to lost connection by reconnecting and indicating loss of connection to user until connection is re-established ]
- **Relevant files:**
    -


### Core - Authentication with Cognito

- **User pool name:** n11611553-cognito-prac
- **How are authentication tokens handled by the client?:** Login request sets the cognito idToken to the cookie. This is checked whenever an endpoint is requested.
- **Video timestamp:** 1:10
- **Relevant files:**
    - app.js(32, 57), (72, 156)

### Cognito multi-factor authentication

- **What factors are used for authentication:** [eg. password, SMS code]
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito federated identities

- **Identity providers used:**
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito groups

- **How are groups used to set permissions?:** [eg. 'admin' users can delete and ban other users]
- **Video timestamp:**
- **Relevant files:**
    -

### Core - DNS with Route53

- **Subdomain**: videoconverter.cab432.com
- **Video timestamp:** 0:01


### Custom security groups

- **Security group names:**
- **Services/instances using security groups:**
- **Video timestamp:**
- **Relevant files:**
    -

### Parameter store

- **Parameter names:** [eg. n1234567/base_url]
- **Video timestamp:**
- **Relevant files:**
    -

### Secrets manager

- **Secrets names:** [eg. n1234567-youtube-api-key]
- **Video timestamp:**
- **Relevant files:**
    -

### Infrastructure as code

- **Technology used:**
- **Services deployed:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior approval only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior permission only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -
