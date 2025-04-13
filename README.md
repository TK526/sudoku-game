# Sudoku Game (Vue + NestJS + TypeORM + MySQL)

This project implements a classic Sudoku game with a Vue.js frontend (using TypeScript), a NestJS backend (using TypeScript), TypeORM for database interaction, and MySQL for data storage, all containerized using Docker and Docker Compose.

## Features

*   Generates random Sudoku puzzles based on difficulty (Beginner, Intermediate, Hard, Expert).
*   Real-time validation of user input.
*   Hint system (max 10 hints).
*   Keyboard input for numbers.
*   Scoring system based on correctness, errors, hints used, and time taken.
*   Persistent leaderboard storing top scores per difficulty.
*   Fully containerized for easy setup and execution.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Docker:** The core containerization platform. Download from [Docker](https://www.docker.com/products/docker-desktop/).
*   **Docker Compose:** Included with Docker Desktop on Mac/Windows. For Linux, follow the [official installation guide](https://docs.docker.com/compose/install/).
*   **(Optional) Node.js & npm/yarn:** Required only if you want to run the frontend or backend *outside* of Docker for development or debugging (e.g., `npm install`, `npm run dev`). Version specified in Dockerfiles (e.g., Node.js 22.x) is recommended.
*   **(Optional) Git:** For cloning the repository.

# Steps to start
1. run docker-compose build --no-cache or docker-compose build
2. run docker-compose up
3. play the game at: http://localhost:5173/ GOODLUCK!!
4. run docker-compose down, after closing the game