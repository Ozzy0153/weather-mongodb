# Project Title: WeatherApp

## Description

WeatherApp is a full-stack web application that provides users with weather forecasts, air quality updates, and moon phase information. This application integrates various external APIs and leverages MongoDB for data persistence. It's built using Node.js, Express, MongoDB, and EJS for templating.

## Features

- User authentication and admin panel for user management.
- Weather information using the OpenWeather API.
- Air quality index using a relevant API.
- Moon phase details.
- History log for user requests and responses.

## Installation

1. **Clone the repository**

   ```bash
   git clone <https://github.com/Ozzy0153/weather-mongodb.git)https://github.com/Ozzy0153/weather-mongodb.git>

2. **Navigate to the project directory**
   ```bash
   cd WeatherApp

3. **Install dependencies**
   ```bash
   npm install dotenv express express-session body-parser mongoose axios bcrypt ejs

## Running the Application

1. **To start the application, run:**
    ```bash
    node app.js


## APIs Used

- **OpenWeather API** for weather information.
- **AQICN API** for air quality index data.
- **RapidAPI** for moon phase details.

Ensure you have API keys for each of these services.

## Deployment

This project is deployed on Render. You can access the deployed application at:

- Deployed Link: `<[Deployed_Application_URL](https://weather-app-with-mongodb.onrender.com/)>`


## Administrative Functionality

### Admin Page

The admin page allows administrators to manage user accounts effectively. As an admin, you can perform the following actions:

- **Add Users**: Create new user accounts by specifying a username, password, and whether the account should have admin privileges.
- **Edit Users**: Update existing user account details, including changing their username, password, and admin status.
- **Delete Users**: Remove user accounts from the system.

### Accessing the Admin Account

For demonstration purposes, an admin account is pre-configured with the following credentials:

- **Username**: Orazaly
- **Password**: Orazaly







