# Seat-booking-app-JavaScript

[![codecov](https://codecov.io/github/ideal0406/cpt-304-group-project-test/graph/badge.svg?token=qjBVklgYXo)](https://app.codecov.io/github/ideal0406/cpt-304-group-project-test/tree/main)
[![Deploy Status](https://img.shields.io/badge/deploy-live-brightgreen?style=flat&logo=render)](https://seat-booking-app-0hle.onrender.com)

This project is for the CPT304 group assignment (Group 53).

Welcome to the Seat Booking App! This project is based on the Seat Booking App created by the original author Damian Zienke. It has fixed the defects and added many new features. This app has implemented a cinema seat reservation system. You can add or delete movies and ticket prices independently through this app, and select seats on the seating map to make reservations and purchases.

## Demo

You can check out the live demo of the Seat Booking App here.
**Online Demo of Project :**

[Link to Seat Booking App](https://seat-booking-app-0hle.onrender.com)

## Defect Repairs

- Cache Blocking: By implementing non-null checks and defensive programming, logical barriers are added to ensure that business operations can only be executed after initialization is complete, thereby avoiding exceptions caused by null data.

- data consistency: Add the "clearReservedUI" method, add null pointer verification, and synchronize the update of the order when a seat is cancelled.

- concurrent competition: Use debouncing processing, add button state locking, and ensure the uniqueness of seat IDs

- Accessibility :restructuring the index.html. Successfully linked elements to their respective form ids (e.g., movie selection dropdown, price inputs) using the for attribute, significantly improving the Accessibility score.

## Function enhancement

- Add operation logs: Implement a standardized audit log system that records timestamps, operation identifiers, and contextual information, enabling all transactions to be traceable and auditable.

- Add i18n: add a bilingual language switch (English and Chinese) and improved semantic accessibility

- Add Cookie Banner：Developed and implemented a responsive Cookie Banner on the landing page to seek user consent for utilizing localStorage to save seat bookings.

- Add Privacy Policy Page: Created a standalone privacy.html page that explains data handling practices, ensuring the project adheres to GDPR and general privacy compliance standards.

## Usage

1. Clone the repository or download the ZIP file.

1. Open the project in your preferred code editor.

1. Launch the index.html file in your browser to run the Seat Booking App locally.

1. Start by adding movie title and price and reserve seats. The app will automatically calculate your cost then book seat for you.

## Tests & Coverage (Codecov)

Here is a dedicated repository that has already configured a workflow for GitHub to test the entire app which tests and uploads coverage to Codecov on every push.

[Link to test repository](https://github.com/ideal0406/cpt-304-group-project-test)

[Link to codecov coverage page](https://app.codecov.io/github/ideal0406/cpt-304-group-project-test/tree/main)

The test repository divides the JS code into two parts: classes and main. It separates the core method logic from the browser's creation and rendering process and conducts separate tests for each. A total of 76 test cases were written, achieving a coverage rate of 98%


## Technologies Used

The Seat Booking App was built using the following technologies and tools:

- HTML5
- CSS3
- JavaScript

## Credits

The original Seat Booking App tutorial was created by [d-zienke](https://github.com/d-zienke/seat-booking-app).

## Feedback and Support

If you have any questions, suggestions, or issues with the Seat Booking App, feel free to reach out by creating an issue in the [GitHub repository](https://github.com/alpharise21/seat-booking-app/issues). We welcome any feedback to improve the app and make it even more useful for managing personal finances.

