# Task Manager API

A robust RESTful API built with Node.js, Express, and TypeScript for managing tasks and user authentication.

## Description

Task Manager is a backend API service that provides endpoints for user authentication, task management, and user management. It's built with modern technologies and follows RESTful principles to ensure scalability and maintainability.

### Key Features

- User Authentication (Register, Login, JWT-based)
- Task Management (CRUD operations)
- User Management
- File Upload Support
- MongoDB Database Integration
- TypeScript for Type Safety
- CORS Support
- Environment Configuration

## Installation Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd taskmanager/back
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=your_frontend_url
```

4. Build the project:
```bash
npm run build
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Available Scripts

- `npm run dev`: Start development server with hot-reload
- `npm start`: Start production server
- `npm run build`: Build TypeScript files
- `npm run watch`: Watch for TypeScript changes
- `npm run clean`: Clean build directory

### API Endpoints

#### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

#### Users
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

#### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create new task
- GET `/api/tasks/:id` - Get task by ID
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task

## Contributing Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features

## License

This project is licensed under the ISC License.

## Dependencies

### Production
- express: Web framework
- mongoose: MongoDB object modeling
- bcryptjs: Password hashing
- jsonwebtoken: JWT authentication
- cors: Cross-origin resource sharing
- dotenv: Environment variables
- multer: File upload handling
- exceljs: Excel file handling

### Development
- typescript: TypeScript support
- ts-node: TypeScript execution
- ts-node-dev: Development server
- @types/*: TypeScript type definitions 