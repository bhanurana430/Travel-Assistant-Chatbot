# TravelMate: Your AI Powered Travel Companion

TravelMate is a powerful keyword-spotting chatbot that's designed to enhance your travel planning experience. It's built using state-of-the-art technologies like React, Node.js, Express, and Socket.IO. The chatbot specializes in suggesting potential travel destinations and assists in the search for real-time flight and hotel availability.  It's also capable of handling a variety of user inputs, including dates, numbers, and city names. TravelMate is designed to be extensible, so it's easy to add new functionalities and features. It's also easy to deploy, so you can have your own instance of TravelMate up and running in no time.

## Access the Deployed Version

The TravelMate chatbot is also deployed live for a hassle-free experience. You can access it at the following link:

[Access TravelMate](https://travel-mate2.azurewebsites.net/)


## Setup Guide

Follow these steps to get TravelMate up and running:

1. **Extract the Project**
   - Extract the zip file of the project to a directory of your choice.

2. **Install Node.js and npm**
   - If you haven't already, you'll need to install Node.js and npm (which comes with Node.js). You can download it from [here](https://nodejs.org/en/download/).

3. **Navigate to the Project Directory**
   - Open a terminal and navigate to the directory where you extracted the project zip file. You can do this with the `cd` command. For example, if you extracted the project to a directory named `travelmate` on your desktop, the command might look like this:
     ```
     cd ~/Desktop/travelmate
     ```

4. **Install Dependencies**
   - Once you're in the project directory, you can install the necessary dependencies by running the following command:
     ```
     npm install
     ```


5. **Start the Project**
   - After all dependencies have been installed, you can start the project by running:
    ```
     npm run build
    ```  
   - This will build the project. After the build is complete, you can start the project by running:  

     ```
     npm start
     ```
     Your terminal should print out a message saying that the server is running, and you can now access the project in your web browser.





## Authors and Contributions

### Fadi Gattoussi
- **Email:** fadi.gattoussi@stud.th-deg.de
- **Matriculation Number:** 22211572
- **Responsibilities:** 
  - Project setup and management and codebase maintenance (ClickUp, GitHub)
  - Implementation of general keyword spotting and conversation engine
  - Development of functionalities for finding flights and hotels, including IATA code, city name, and airport name search and conversion
  - Validation checks for cities
  - Readme file

### Palina Dzenisiuk
- **Email:** palina.dzenisiuk@stud.th-deg.de
- **Matriculation Number:** 22211926
- **Responsibilities:** 
  - Extensibility
  - Implementation of fallback mechanism
  - Ensuring that the bot steers the conversation by asking aggressively
  - "Suggest destination" functionality, including the keyword spotting for it
  - Validation checks for numbers and dates

### Narender Kumar
- **Email:** narender.kumar@stud.th-deg.de
- **Matriculation Number:** 22103962
- **Responsibilities:** 
  - Implementation and management of WebSockets
  - Deployment

### Bhanu Pratap Singh
- **Email:** bhanu.singh@stud.th-deg.de
- **Matriculation Number:** 22201990
- **Responsibilities:** 
  - Design and layout
  - Development of React components
  - Tasks creation for ClickUp
  - Meeting notes.
