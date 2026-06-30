# ecommerce-fullstack

A full-stack e-commerce web application built with React and Spring Boot.

## Tech Stack

**Frontend**
- React 18
- React Router DOM
- Axios
- Context API (Auth + Cart)

**Backend**
- Spring Boot 4 (Java 17)
- Spring Security + JWT
- Spring Data JPA
- Microsoft SQL Server
- JavaMail (Gmail SMTP)
- Lombok

## Features

- Product browsing and detail pages
- User registration and login (JWT-based auth)
- Shopping cart and checkout
- Order tracking
- Product reviews
- Email notifications
- Admin dashboard with management for:
  - Products & Categories
  - Orders & Payments
  - Clients & Reviews

## Project Structure

```
ecommerce-fullstack/
├── devfront/      # React frontend
└── devbackend/    # Spring Boot backend
```

## Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- Microsoft SQL Server
- Maven

### Backend

1. Create a SQL Server database named `EcomDB`
2. Configure your credentials in `devbackend/src/main/resources/application.properties`
3. Run:

```bash
cd devbackend
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8081`

### Frontend

```bash
cd devfront
npm install
npm start
```

The app will be available at `http://localhost:3000`

## Author

**Berrima Fedi**
