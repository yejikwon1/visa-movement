# MOSA-Summer-Hackathon-2025

**Guidelines**
 You are free to use whatever language(s) for the MOSA Summer Hackathon 2025 Project, and there is no limit on the number or type(s) of framework(s) you will adopt. But you should keep all your code in a single GitHub org or repo, so that it will be better organised for the purposes of evaluation.
 
 ## **Project Title**
 
 ## **Overview**
 
 **Project Summary**
 
 Please provide a short (one paragraph) summary of your project. Consider this your elevator pitch.
 Visa Movement is a web-based platform that makes the U.S. green card process more transparent and predictable. 
 By combining historical Visa Bulletin data with machine learning models (Prophet + ARIMA), it forecasts future cutoff dates and provides applicants with actionable insights. 
 An interactive visa table updates automatically each month, while an AI-powered chatbot answers immigration questions in simple language, offering both guidance and context. 
 With automated data pipelines, secure API integration, and a clean user interface, Visa Movement empowers applicants to navigate the immigration process with greater clarity and 
 confidence.
 
 Include the link to your Devpost project page here: (Paste finalized Devpost site)
https://devpost.com/software/visa-movement?ref_content=my-projects-tab&ref_feature=my_projects
  
 **Authors**
 
 - Name - yejikwon1 – yejikwon@seas.upenn.edu - [GitHub](https://github.com/yejikwon1/visa-movement.git)
 - Name - Jaemin-L – jaemin95@seas.upenn.edu - [GitHub](https://github.com/yejikwon1/visa-movement.git)

 
 ## **Usage**
 This section walks a prospective user through the process of installing and running the project on their local machine. 
 The more detailed and the more accurate, the better. User-friendly instructions will entice prospective users (including judges) to engage more deeply with your project, which could improve your hackathon score.
 
 ### **Prerequisites** 
 What prerequisites must be installed in order to run your project, and how do you install them?
 Provide code samples in this fenced code block.
 
 ### **Installation**
 **Step 1**: Clone the Project
  - git clone https://github.com/YOUR_USERNAME/visa-movement.git
  - cd visa-movement

 **Step 2**: Install Root Dependencies
  - npm install

  **Step 3**: Install Frontend Dependencies
  - cd web
  - npm install

  **Step 4**: Install Backend Dependencies
  - cd ../backend
  - python3 -m pip install -r requirements.txt

  **Step 5**: Install Script Dependencies
  - cd ../scripts
  - python3 -m pip install -r requirements.txt

  **Step 6**: Set Environment Variables
  - cd ../backend
  - touch .env
  - echo "OPENAI_API_KEY=---Redacted due to Privacy Issue—" > .env

  **Step 7**: Generate Forecast Data
  - cd ../web
  - node scripts/generateForecastWithCountries.js

  **Step 8**: Start Backend Server
  - cd ../backend
  - uvicorn main:app --reload --host 0.0.0.0 --port 8000

  **Step 9**: Start Frontend Server
  - Open a new terminal:
  - cd "/Your Directory/visa-movement/web"
  - npm start

 
 ### **Deployment**
 Give a step-by-step rundown of how to use your project. Including screenshots in this section can be highly effective for highlighting specific features of your project.
 
 State step 1. 
 
 Provide code samples in this fenced code block.
 
 State step 2.
 
 Provide code samples in this fenced code block.
 
 Etc.
 ## **Additional information**
 
 ### **Tools used**
 Which frameworks, libraries, or other tools did you use to create your project?

[Tool 1](https://maven.apache.org/) - Description (e.g. "Web framework used")  

[Tool 2](https://maven.apache.org/)  - Description   

[Tool 3](https://maven.apache.org/) - Description   

## **Acknowledgments** 
Use anyone else's code? Inspired by a particular project? List / link here.  

Item 1  

Item 2  

Item 3 

## **License** 
If desired, add a section for your license. Reference sites like (https://choosealicense.com/) can help you choose which license meets your needs.  

For example: 

This package is licensed under the GNU General Public License v3.0 [GPL-3](https://choosealicense.com/licenses/gpl-3.0/).
