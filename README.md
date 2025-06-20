# Statistical Data Visualization Platform

## Overview

This project is a web application that allows users to upload CSV, Excel files, or Google Sheet links, which are then processed on the server-side using Python Flask. The processed data is visualized and displayed to the user. The front end is built using Next.js and Node.js.

## File Structure

```bash
project-root/
│
├── client/ # Frontend directory
│ ├── pages/ # Next.js pages
│ ├── public/ # Public static files
│ ├── styles/ # CSS styles
│ ├── components/ # React components
│ └── package.json # Node.js dependencies and scripts
│
├── server/ # Backend directory
│ ├── app.py # Flask application
│ ├── api # API folder
│ ├── requirements.txt # Python dependencies
│
└── .gitignore # Git ignore file
```

## Setup Instructions

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The application will be available at http://localhost:3000.

### Backend Setup

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

The Flask application will be available at http://localhost:5000.

## Project Description

### Frontend

- Built with Next.js and React.
- Provides a user interface for uploading CSV, Excel files, or Google Sheet links.
- Sends uploaded data to the backend and displays the returned visualizations.

### Backend

- Built with Flask.
- Processes uploaded files, performs data analysis, and generates visualizations.
- Returns the visualizations as a single image to the frontend.

### Visualizations

The backend generates the following professional and widely used visualizations:

- **Statistical Measures Table**: Shows summary statistics (mean, std, median, etc.) for numeric columns.
- **Curve Plot**: Line plot for the first numeric column.
- **Histogram**: Distribution of the first numeric column.
- **Box Plot**: Distribution of all numeric columns.
- **Scatter Plot**: Relationship between the first two numeric columns.
- **Bar Plot**: Bar chart using the first column as categories and the second as values.

---

This platform helps you explore your data visually—no coding required. Upload your data, customize columns, and download high-quality charts in seconds.
