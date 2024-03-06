# Blogging Application with Recommendation System and Text Summarization

Welcome to our blogging application GitHub repository! This project is built using Node.js and Express for the backend, along with additional features such as user authentication, blog recommendation based on cosine similarity, text summarization using Hugging Face, and a RESTful API developed using FASTAPI. MongoDB with Mongoose is used for all CRUD operations related to the database.

## Features

- **Blog CRUD Operations**: Users can create, read, update, and delete blogs. The application provides a user-friendly interface for managing blog posts.

- **User Authentication**: The application supports user signup and sign out functionality to manage user accounts securely.

- **Blog Recommendation System**: Blogs are recommended to users based on cosine similarity, providing personalized recommendations tailored to each user's preferences.

- **Search Functionality**: Utilizing cosine similarity, the application offers a search functionality to find the most suitable blogs from the MongoDB database.

- **RESTful API Development**: The backend is powered by FASTAPI, a modern Python web framework, providing a robust and efficient API for integrating with other applications.

- **Text Summarization**: The application includes text summarization functionality using the Hugging Face library, enabling users to generate concise summaries of long texts.

# Project Directory Structure

```
root/
│
├── backend/                # Backend codebase
│   ├── app/                # Express application files
│   ├── routes/             # Route handlers for different API endpoints
│   ├── controllers/        # Controllers for handling business logic
│   ├── services/           # Services for handling text summarization and recommendation
│   └── models/             # MongoDB schema definitions
│
├── frontend/               # Frontend codebase (if applicable)
│
└── python-scripts/         # Python scripts for auxiliary tasks
```



## Getting Started

To run the application locally, follow these steps:

1. Clone the repository:

git clone https://github.com/your-username/blogging-application.git

cd blogging-application

2. Install dependencies:

cd backend

npm install

3. Set up the environment variables:

   - Create a `.env` file in the `backend` directory.
   - Add required environment variables such as database connection URI, API keys, etc.

4. Start the backend server:


5. If applicable, set up the frontend and start the frontend server.

## Contributing

We welcome contributions from the community! If you'd like to contribute to the project, please fork the repository, make your changes, and submit a pull request. Be sure to follow the contribution guidelines outlined in the repository.

Trello link for tracking whole progress of the development - `https://trello.com/invite/b/TpNoBP9s/ATTI93c309cac37c091c1114bcc2e2efeb7536EA49CD/cloud-web-software-engineering`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

We would like to thank the following libraries and frameworks for making this project possible:

- Node.js
- Express
- MongoDB with Mongoose
- FASTAPI
- Hugging Face Transformers
- And many other open-source contributors who have contributed to the ecosystem.

---

Thank you for your interest in our blogging application! If you have any questions or feedback, please feel free to reach out to us. Happy coding! 🚀
