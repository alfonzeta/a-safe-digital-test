
# README for A-SAFE DIGITAL API

  

## Table of Contents

  

1. [Introduction](#Introduction)

2. [Project Overview](#project-overview)

3. [Technologies Used](#technologies-used)

4. [Project Structure](#project-structure)

5. [Prerequisites](#prerequisites)

6. [Installation and running](#installation)

7. [Database Setup](#database-setup)

8. [API Documentation](#api-documentation)

9. [Usage](#usage)
  
10. [Websocket for Real-time notifications](#websocket-for-real-time-notifications ) 

11. [Testing](#testing ) 

12. [Architecture considerations](#architecture-considerations) 

13. [Technical test progress](#technical-test-progress)

14. [Bonus Characteristics](#bonus-characteristics)
## Introduction

Technical test project repository for A-SAFE DIGITAL. This project showcases a range of development techniques and coding skills. The main technologies used in this project include Fastify, Prisma, PostgreSQL, WebSockets, Docker, TypeScript and domain driven design architecture.

On top of that, I used jira kanban to keep tracks of project changes and linked it to my github for commit info as well. 
Read more about this in [Bonus Characteristics](#bonus-characteristics)

### Deployed project
You can find the deployed version of this project here:

[Deployed Project](http://51.254.97.250:8080/)

[Deployed Project API documentation with Swagger UI](http://51.254.97.250:8080/documentation)

  <a href="https://ibb.co/DLtgJzN"><img src="https://i.ibb.co/V3tp1Jd/Screenshot-from-2024-07-26-01-16-52.png" alt="Screenshot-from-2024-07-26-01-16-52" border="0"></a>
  

## Project Overview

A-SAFE DIGITAL API is a server based application built with Fastify, Prisma, and PostgreSQL. It provides a basic user management and blog post system with roles and permissions. The application includes endpoints for:

- User CRUD operations with user authentication.

- Post CRUD operations with user authentication.

- Image cloud (AWS S3 OVH) upload with user authentication.

- Websocket connection for notifications when new post is created.

  
## Technologies Used

  

### Main Technologies

-  **Node.js**: JavaScript runtime environment

-  **Fastify**: Web framework for Node.js

-  **Prisma**: ORM for database management

-  **PostgreSQL**: Relational database

-  **TypeScript**: Superset of JavaScript for type safety

-  **JWT**: JSON Web Token for authentication

-  **bcrypt**: Library for hashing passwords

-  **AWS S3 (OVH)**: File storage

-  **dotenv**: Module for loading environment variables

-  **websocket**: Protocol to establish "socket" connections and real time notifications.

-  **Docker**: Platform for developing, shipping, and running applications in containers

  

### Development tools

-  **Jest**: Testing framework

-  **Nodemon**: Tool that helps develop Node.js applications by automatically restarting the node application when file changes are detected

  

## Prerequisites

- Node.js (v20 or higher)

- PostgreSQL

- Docker (optional but RECOMMENDED, for containerized setup)

  

## Project Structure

Keep reading to see more about [Architecture considerations](#architecture-considerations).

- src/
	- application/ # Application use cases
	- config/ # Configuration files and DI container
	- domain/ # Domain entities and repositories
	- infrastructure/ # Infrastructure services, controllers, and middleware
	- types/ # Type definitions
	- index.ts # Entry point of the application

- prisma/
	- migrations/ # Prisma migrations
	- seed.ts # Database seeding script
	- schema.prisma # Prisma schema
3. Other-files # Other files like Makefile, tsconfig.json, docker related files, ignore files etc

  

## Installation

In this section, you will find detailed instructions to get the project running locally in a fully working development environment. 
This setup will ensure you have all the necessary tools and configurations to develop, test, and run the application effectively. 

Two methods are included to achieve this: with Docker and without Docker. In both methods the database seeding has been included, although it is not strictly necessary, it is highly recommended to be able to start developing.

### Docker

1. Clone the repository:

```sh

git clone git@github.com:alfonzeta/a-safe-digital-test.git

cd a-safe-digital-test

```

2. Create a `.env` file in the root directory, configure the variables in `.env.dist` and follow instructions there.

  

3. Get dev environment ready using makefile:

```sh

make dev

```

Makefile will install dependencies, build project, run docker compose, generate prisma and deploy it, seed database and restart docker containers.

  

4. The server will start on `http://localhost:8080`.

  

### Manual installation (without Docker)

First of all you need to ensure to have installed at least version 20 of Node.js and PostgreSQL. If you don't have them installed, do it or stick to Docker installation method. 

1. Install dependencies:

```sh

npm install

```

2. Create a `.env` file in the root directory, configure the variables in `.env.dist` and follow instructions there.

  

3. Database Setup

- Create a PostgreSQL database.

- Configure your database connection in the `.env` file:

- Run Prisma migrations to set up the database schema:

```sh

npx prisma generate

npx prisma migrate deploy

```

- Seed the database:

```sh

npm run seed

```

  

4. Run npm start and the server will start on `http://localhost:8080`.

  

## API Documentation

Once previous steps have been gone through, the API documentation will be availeble through Swagger UI.
-  **Swagger UI**: `http://localhost:8080/documentation`

## Usage

### User Endpoints
-  **GET**  `/users/:id` - Get user by ID
-  **POST**  `/users/signin` - Sign in user (JWT and bcrypt based)
-  **POST**  `/users/signup` - Sign up new user (JWT and bcrypt based)
-  **POST**  `/users/signup/admin` - Create new admin user (only ADMIN)
-  **PUT**  `/users/:id` - Update user (requires authentication)
-  **DELETE**  `/users/:id` - Delete user (requires authentication)

### Picture Endpoints
-  **POST**  `/users/profile-picture` - Uploads profile picture (requires authentication) 
-  **GET**  `/users/profile-picture` -  Retrieve profile picture (requires authentication)

### Post Endpoints
-  **GET**  `/posts/:id` - Get post by ID
-  **POST**  `/posts` - Create new post (requires authentication)
-  **PUT**  `/posts/:id` - Update post (requires authentication)
-  **DELETE**  `/posts/:id` - Delete post (requires authentication)


## Websocket for Real-time notifications

The WebSocket integration in this Fastify server enables real-time communication between the server and connected clients. This functionality is crucial for features such as real-time notifications. In this particular case, websocket is implemented so, after creating a new post, a notification message is sent to all connected WebSocket clients. For example purposes, this implementation is showcased in the `CreatePostUseCase`. However, the design is flexible enough to integrate WebSocket notifications in other use cases.


Below is a video demonstrating the WebSocket integration in action:


https://github.com/user-attachments/assets/0f7cf2bb-8d3e-4a16-aad3-465931c12cd1


## Testing
This project includes a comprehensive suite of unit tests to ensure the reliability and correctness of the application. The tests are written using Jest, a popular JavaScript testing framework. The primary goal of these tests is to verify the behavior of individual units of code, such as use cases and repository methods, to ensure they function as expected.

### Note on Coverage

I created this tests as part of a technical demonstration to showcase testing skills. As such, they focus on covering the primary scenarios. In a production environment, more exhaustive testing would have to be conducted to cover a wider range of edge cases and ensure complete reliability.

## Architecture considerations
This project was created as part of a technical test. As such, some aspects of its design, functionality, and approach may seem over-engineered for a project of this scale. The implementation of clean architecture, while potentially excessive for this particular project, was deliberately chosen to showcase a deeper understanding of architectural principles. One of the key requirements was to "organize the codebase to support scalability and maintainability," and employing a clean architecture approach serves this purpose well. Despite its complexity, this architecture demonstrates the capability to build a scalable and maintainable codebase, which is crucial for future expansion and long-term maintenance.

### Project architecture 
This project is designed with a focus on clean architecture principles to ensure maintainability, scalability, and testability. Below is a detailed overview of the architecture and its components:

#### 1. **Domain Layer**

-   **Purpose**: This layer contains the core business logic and entities. It defines the fundamental business rules and models that the application revolves around.
-   **Components**:
    -   **Entities**: Represent the core business objects (e.g., `User`, `Post`).
    -   **Repositories**: Define interfaces for data access (e.g., `UserRepository`, `PostRepository`).

#### 2. **Application Layer**

-   **Purpose**: This layer contains the use cases which orchestrate the business logic for specific application scenarios.
-   **Components**:
    -   **Use Cases**: Implement the application logic and interact with repositories (e.g., `GetPostUseCase`, `CreateUserUseCase`).
    -   **DTOs**: Data Transfer Objects used for communication between layers.

#### 3. **Persistence Layer**

-   **Purpose**: This layer provides the implementation of repository interfaces and other low-level details like database access, third-party services, etc.
-   **Components**:
    -   **Database**: Implementation of repository interfaces using Prisma ORM.
    -   **Services**: Implementation of services like JWT generation, password hashing, etc.

#### 4. **Infrastructure Layer**

-   **Purpose**: This layer contains the entry points for the application such as controllers, APIs, and other user interfaces.
-   **Components**:
    -   **Controllers**: Handle HTTP requests and responses (e.g., `UserController`, `PostController`).
    -   **Middlewares**: Handle cross-cutting concerns like authentication, logging, etc.

# Technical test progress

### Task 1: Advanced Monorepo Setup (25 points) [Optional]
- [ ] Set up a monorepo structure using Lerna or Yarn Workspaces.
- [ ] Create separate packages for different concerns (e.g., API, services, utilities).
- [ ] Ensure the monorepo is well-organized.
- [ ] Demonstrate how changes in one package affect others.

### Task 2: Advanced Server Setup (20 points)
- [x] Implement a Fastify application using TypeScript for enhanced type safety.
- [x] Organize the codebase to support scalability and maintainability.

### Task 3: Advanced Database Integration with Prisma and PostgreSQL (30 points)
#### User Management (15 points)
- [x] Integrate Prisma for database access with a PostgreSQL database.
- [x] Define a User model.
- [x] Implement CRUD operations for user management (create, read, update, delete).
- [x] Include input validation and error handling for user-related operations.

#### Relationships and Data Validation (15 points)
- [x] Extend the data model to include relationships between entities (e.g., users and posts).
- [x] Implement advanced data validation using Prisma's constraints.

### Task 4: Authentication and Authorization (20 points)
- [x] Implement user authentication using JWT (JSON Web Tokens).
- [x] Create middleware for route authorization based on user roles and permissions.
- [x] Secure sensitive operations (e.g., user profile updates) behind authentication.

### Task 5: Advanced API Features (20 points)
#### File Upload (10 points)
- [x] Implement an endpoint for users to upload profile pictures.
- [x] Store uploaded files securely and efficiently (consider using cloud storage if applicable).

#### Real-time Notifications (10 points)
- [x] Implement a real-time notification system using WebSocket or a similar technology.
- [x] Notify users of relevant events (e.g., new messages, updates).

### Task 6: Testing and Documentation (15 points)
- [x] Write unit tests for critical functions and endpoints using a testing library (e.g., Jest).
- [x] Provide comprehensive API documentation using tools like Swagger or Fastify Swagger.

### Task 7: Monorepo and Separate Packages (25 points) [Optional]
- [ ] Ensure that the structure is well-organized.
- [ ] Create separate packages for different concerns (e.g., API, services, utilities).
- [ ] Demonstrate how changes in one package affect others.

## Bonus Characteristics
This project includes several advanced features and enhancements beyond the original requirements of the technical test, demonstrating a commitment to best practices and a robust development approach. These additional characteristics include:

-   **Docker Containerization**: The entire application is containerized using Docker, enabling consistent and isolated development, testing, and production environments.
    
-   **Dev Environment with Nodemon**: Leveraging Nodemon for automatic server restarts during development to enhance productivity and streamline the development process.
    
-   **Swagger UI for API Documentation**: Implementing Swagger UI to provide an intuitive and interactive API documentation interface, making it easier for developers to understand and test the available endpoints.
    
-   **bcrypt for Password Hashing**: Using bcrypt to securely hash user passwords, ensuring enhanced security for user authentication and data protection.
      
-   **Environment Configuration with dotenv**: Using dotenv for managing environment variables, allowing for secure and flexible configuration of the application across different environments.
- **Implementation of Domain-Driven Design (DDD) Principles with Clean Architecture**: Adopting DDD principles and clean architecture to structure the codebase into well-defined layers (Domain, Application, Infrastructure, and Presentation). This approach ensures a clear separation of concerns, making the codebase highly maintainable, scalable, and testable. DDD focuses on the core business domain and its logic, allowing for better alignment between technical solutions and business needs. Clean architecture supports the independence of each layer, facilitating easier modifications and enhancements without impacting other parts of the system.
-- **Jira Kanban board**: In software development, keeping an eye on the big picture is crucial. Jira helps with this by providing some features that boost team productivity.
<a href="https://ibb.co/zPDjymc"><img src="https://i.ibb.co/1RjhD0V/Screenshot-from-2024-07-26-12-26-47.png" alt="Screenshot-from-2024-07-26-12-26-47" border="0"></a>
  I think jira, or this kind of tools are good for software development for a few reasons:
- It helps the team to visualize project goals in a more intuitive way. 
- It allows everyone in the team to have quick access to the overall project status.
- Task tracking gets improved since you have an overview of tasks that need to be taken care of.
- Fully integrated with git and other tools like Bitbucket, adding the option to link each commit to a specific task and facilitating CI/CD.
- Increases productivity, project tracking and project management tasks.


These bonus characteristics collectively enhance the overall quality, security, and developer experience of the project, showcasing a thorough understanding of modern web development practices.
