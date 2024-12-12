# BluePenguin
A clean, simple e-bidding site for all your needs. Work In Progress...

## Description
This project is an online e-bidding platform where users can create and manage auctions, place bids, and track auction outcomes in real time.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)<!-- -  [Features](#features) -->
- [Contributing](#contributing)
- [License](#license)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/iDaManall/BluePenguin.git
   ```
2. Install dependencies and initiate virtual environment:

   Frontend:
   ```bash
   cd frontend
   npm install
   npm install @supabase/supabase-js
   npm install axios
   npm install react-router-dom
   ```
   Backend:
   ```bash
   cd backend
   pip install -r requirements.txt  # for backend
   ```
   
3. Set up environment variables such as api keys and database urls. Run migrations if needed.
- astute-harmony-441702-v4-897ad6a174e7.json
- Backend .env
  ```bash
  DB_NAME=
  DB_USER=
  DB_PASSWORD=
  DB_HOST=
  DB_PORT=
  EMAIL_HOST_USER=
  EMAIL_HOST_PASSWORD=
  GOOGLE_APPLICATION_CREDENTIALS=
  GOOGLE_CLOUD_PROJECT_ID=
  GOOGLE_CLOUD_STORAGE_BUCKET=
  SHIPPO_API_KEY=
  GOOGLE_APPLICATION_CREDENTIALS=
   
  SUPABASE_URL=
  SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```
- Frontend .env
  ```bash
  VITE_API_URL=""
  VITE_SUPABASE_URL=""
  VITE_SUPABASE_ANON_KEY=""
  ```

4. Start the application:
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   Backend:
   ```bash
   cd backend
   python manage.py runserver
   ```

## Usage
- After starting the server, navigate to... `http://localhost:5173/` to access the platform.
  <!-- Create a new auction by clicking "Create Auction" and filling out the form. -->

<!---
## Features
 User authentication and profile management
- Real-time auction updates using WebSockets
- Admin dashboard for auction management 
- TBD -->

## Contributing
Contributions are welcome! Please follow the steps below:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

## License
This project is licensed under... <!-- the MIT License - see the [LICENSE](LICENSE) file for details. -->

## Contact
Created by Team ICEBERG... <!-- [Your Name](https://yourwebsite.com) - feel free to contact us! -->
