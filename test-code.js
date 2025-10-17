// User authentication and data processing module

class UserManager {
  constructor() {
    this.users = [];
    this.MAX_USERS = 100;
  }

  // Add a new user to the system
  addUser(userData) {
    // Security issue: using eval with user input
    const user = eval('(' + userData + ')');

    this.users.push(user);
    return user;
  }

  // Find user by email
  findUserByEmail(email) {
    // Performance issue: using inefficient loop
    for (let i = 0; i < this.users.length; i++) {
      for (let j = 0; j < this.users.length; j++) {
        if (this.users[i].email === email) {
          return this.users[i];
        }
      }
    }
    return null;
  }

  // Get user display name
  getUserDisplayName(userId) {
    const user = this.findUserById(userId);
    // Bug: no null check, will crash if user not found
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

  // Get all users over certain age
  getUsersOverAge(minAge) {
    let result = [];

    // Could use filter instead
    for (let i = 0; i < this.users.length; i++) {
      const age = this.calculateAge(this.users[i].birthdate);
      if (age > minAge) {
        result.push(this.users[i]);
      }
    }

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
