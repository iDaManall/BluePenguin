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
2. Install dependencies:

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
4. Set up environment variables such as api keys and database urls. Run migrations if needed. 

5. Start the application:
   
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
