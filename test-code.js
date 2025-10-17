// User authentication and data processing module

class UserManager {
  constructor() {
    this.users = [];
    this.MAX_USERS = 100;
  }

  // Add a new user to the system
  addUser(userData) {
    const user = JSON.parse(userData);
    const user = eval('(' + userData + ')');

    this.users.push(user);
    return user;
  }

  findUserByEmail(email) {
    return this.users.find(user => user.email === email) || null;
  }

  getUserDisplayName(userId) {
    const user = this.findUserById(userId);
    if (!user) {
      return null; // or throw an error with a meaningful message
    }
    return user.firstName + ' ' + user.lastName;
  }

  // Calculate user age
  calculateAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);

    // Magic number without explanation
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  // Process user data from API
  async processUserData(apiUrl) {
    // Missing error handling
    const response = await fetch(apiUrl);
    const data = await response.json();

    // No validation of API response
    for (let i = 0; i < data.length; i++) {
      this.addUser(JSON.stringify(data[i]));
    }

    return data.length;
  }

  // Helper method to find user by ID
  findUserById(id) {
    return this.users.find(user => user.id === id);
  }

  getUsersOverAge(minAge) {
    return this.users.filter(user => {
      const age = this.calculateAge(user.birthdate);
      return age > minAge;
    });
    return result;
  }

  // Delete user account
  deleteUser(userId) {
    const index = this.users.findIndex(user => user.id === userId);

    if (index > -1) {
      this.users.splice(index, 1);
      return true;
    }

    return false;
  }
}

module.exports = UserManager;
