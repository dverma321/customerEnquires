const mongoose = require('../config/db'); // importing database config

const User = require('./User'); // user schema model
const bcrypt = require('bcrypt');

const users = [
  { name: 'Amit Sharma', email: 'amit.sharma@example.com', password: 'amit123', confirmPassword: 'amit123', gender: 'Male', phone: 1616161616, uname: 'amit_sharma', country: 'India', state: 'Rajasthan', city: 'Jaipur', pincode: '302001', alternateMobileNumber: 9161616161, dob: '1985-01-01', height: 175, weight: 70, community: 'Tailor', caste: 'Tailor', bodyColor: 'Medium', drink: 'No', smoke: 'No', food: 'Vegetarian', hobbies: ['Traveling'], work: 'Teacher', professionalStatus: 'Employed', salary: 50000, verified: true },
  { name: 'Sunita Gupta', email: 'sunita.gupta@example.com', password: 'sunita123', confirmPassword: 'sunita123', gender: 'Female', phone: 1717171717, uname: 'sunita_gupta', country: 'India', state: 'Rajasthan', city: 'Udaipur', pincode: '313001', alternateMobileNumber: 9171717171, dob: '1986-02-02', height: 165, weight: 60, community: 'Jain', caste: 'Jain', bodyColor: 'Fair', drink: 'Yes', smoke: 'No', food: 'Vegetarian', hobbies: ['Reading'], work: 'Engineer', professionalStatus: 'Employed', salary: 60000, verified: true },
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', password: 'rajesh123', confirmPassword: 'rajesh123', gender: 'Male', phone: 1818181818, uname: 'rajesh_kumar', country: 'India', state: 'Rajasthan', city: 'Jodhpur', pincode: '342001', alternateMobileNumber: 9181818181, dob: '1987-03-03', height: 180, weight: 80, community: 'Darji', caste: 'Darji', bodyColor: 'Dark', drink: 'No', smoke: 'Yes', food: 'Non-Vegetarian', hobbies: ['Gaming'], work: 'Accountant', professionalStatus: 'Employed', salary: 55000, verified: true },
  { name: 'Pooja Mehta', email: 'pooja.mehta@example.com', password: 'pooja123', confirmPassword: 'pooja123', gender: 'Female', phone: 1919191919, uname: 'pooja_mehta', country: 'India', state: 'Rajasthan', city: 'Kota', pincode: '324001', alternateMobileNumber: 9191919191, dob: '1988-04-04', height: 160, weight: 55, community: 'Rajput', caste: 'Rajput', bodyColor: 'Medium', drink: 'Yes', smoke: 'No', food: 'Vegetarian', hobbies: ['Cooking'], work: 'Nurse', professionalStatus: 'Employed', salary: 60000, verified: true },
  { name: 'Manish Singh', email: 'manish.singh@example.com', password: 'manish123', confirmPassword: 'manish123', gender: 'Male', phone: 2020202020, uname: 'manish_singh', country: 'India', state: 'Rajasthan', city: 'Bikaner', pincode: '334001', alternateMobileNumber: 9202020202, dob: '1989-05-05', height: 170, weight: 75, community: 'Tailor', caste: 'Tailor', bodyColor: 'Fair', drink: 'No', smoke: 'No', food: 'Vegetarian', hobbies: ['Photography'], work: 'Photographer', professionalStatus: 'Self-Employed', salary: 70000, verified: true },
  { name: 'Ritika Verma', email: 'ritika.verma@example.com', password: 'ritika123', confirmPassword: 'ritika123', gender: 'Female', phone: 2121212121, uname: 'ritika_verma', country: 'India', state: 'Rajasthan', city: 'Ajmer', pincode: '305001', alternateMobileNumber: 9212121212, dob: '1990-06-06', height: 160, weight: 58, community: 'Jain', caste: 'Jain', bodyColor: 'Fair', drink: 'Yes', smoke: 'No', food: 'Vegetarian', hobbies: ['Writing'], work: 'Journalist', professionalStatus: 'Employed', salary: 55000, verified: true },
  { name: 'Vikram Rathore', email: 'vikram.rathore@example.com', password: 'vikram123', confirmPassword: 'vikram123', gender: 'Male', phone: 2222222222, uname: 'vikram_rathore', country: 'India', state: 'Rajasthan', city: 'Alwar', pincode: '301001', alternateMobileNumber: 9222222222, dob: '1988-07-07', height: 175, weight: 78, community: 'Rajput', caste: 'Rajput', bodyColor: 'Medium', drink: 'No', smoke: 'No', food: 'Vegetarian', hobbies: ['Traveling'], work: 'Businessman', professionalStatus: 'Self-Employed', salary: 80000, verified: true },
  { name: 'Neha Sharma', email: 'neha.sharma@example.com', password: 'neha123', confirmPassword: 'neha123', gender: 'Female', phone: 2323232323, uname: 'neha_sharma', country: 'India', state: 'Rajasthan', city: 'Sikar', pincode: '332001', alternateMobileNumber: 9232323232, dob: '1991-08-08', height: 165, weight: 62, community: 'Darji', caste: 'Darji', bodyColor: 'Dark', drink: 'Yes', smoke: 'No', food: 'Vegetarian', hobbies: ['Gardening'], work: 'Teacher', professionalStatus: 'Employed', salary: 50000, verified: true },
  { name: 'Arjun Yadav', email: 'arjun.yadav@example.com', password: 'arjun123', confirmPassword: 'arjun123', gender: 'Male', phone: 2424242424, uname: 'arjun_yadav', country: 'India', state: 'Rajasthan', city: 'Jhunjhunu', pincode: '333001', alternateMobileNumber: 9242424242, dob: '1985-09-09', height: 180, weight: 82, community: 'Tailor', caste: 'Tailor', bodyColor: 'Fair', drink: 'No', smoke: 'Yes', food: 'Non-Vegetarian', hobbies: ['Sports'], work: 'Engineer', professionalStatus: 'Employed', salary: 65000, verified: true },
  { name: 'Meera Patel', email: 'meera.patel@example.com', password: 'meera123', confirmPassword: 'meera123', gender: 'Female', phone: 2525252525, uname: 'meera_patel', country: 'India', state: 'Rajasthan', city: 'Nagaur', pincode: '341001', alternateMobileNumber: 9252525252, dob: '1992-10-10', height: 158, weight: 57, community: 'Rajput', caste: 'Rajput', bodyColor: 'Medium', drink: 'Yes', smoke: 'No', food: 'Vegetarian', hobbies: ['Cooking'], work: 'Manager', professionalStatus: 'Employed', salary: 70000, verified: true },
  { name: 'Ravi Singh', email: 'ravi.singh@example.com', password: 'ravi123', confirmPassword: 'ravi123', gender: 'Male', phone: 2626262626, uname: 'ravi_singh', country: 'India', state: 'Rajasthan', city: 'Bundi', pincode: '323001', alternateMobileNumber: 9262626262, dob: '1986-11-11', height: 175, weight: 80, community: 'Tailor', caste: 'Tailor', bodyColor: 'Dark', drink: 'No', smoke: 'Yes', food: 'Non-Vegetarian', hobbies: ['Music'], work: 'Artist', professionalStatus: 'Freelance', salary: 50000, verified: true },
  { name: 'Divya Agarwal', email: 'divya.agarwal@example.com', password: 'divya123', confirmPassword: 'divya123', gender: 'Female', phone: 2727272727, uname: 'divya_agarwal', country: 'India', state: 'Rajasthan', city: 'Sawai Madhopur', pincode: '322001', alternateMobileNumber: 9272727272, dob: '1987-12-12', height: 170, weight: 65, community: 'Jain', caste: 'Jain', bodyColor: 'Fair', drink: 'No', smoke: 'No', food: 'Vegetarian', hobbies: ['Painting'], work: 'Architect', professionalStatus: 'Employed', salary: 75000, verified: true },
  { name: 'Kunal Joshi', email: 'kunal.joshi@example.com', password: 'kunal123', confirmPassword: 'kunal123', gender: 'Male', phone: 2828282828, uname: 'kunal_joshi', country: 'India', state: 'Rajasthan', city: 'Barmer', pincode: '344001', alternateMobileNumber: 9282828282, dob: '1990-01-01', height: 175, weight: 72, community: 'Darji', caste: 'Darji', bodyColor: 'Medium', drink: 'Yes', smoke: 'No', food: 'Vegetarian', hobbies: ['Fishing'], work: 'Mechanic', professionalStatus: 'Employed', salary: 45000, verified: true },
  { name: 'Sanya Jain', email: 'sanya.jain@example.com', password: 'sanya123', confirmPassword: 'sanya123', gender: 'Female', phone: 2929292929, uname: 'sanya_jain', country: 'India', state: 'Rajasthan', city: 'Churu', pincode: '331001', alternateMobileNumber: 9292929292, dob: '1993-02-02', height: 160, weight: 50, community: 'Jain', caste: 'Jain', bodyColor: 'Fair', drink: 'No', smoke: 'No', food: 'Vegetarian', hobbies: ['Dancing'], work: 'Student', professionalStatus: 'Student', salary: 0, verified: true },
  { name: 'Rohit Meena', email: 'rohit.meena@example.com', password: 'rohit123', confirmPassword: 'rohit123', gender: 'Male', phone: 3030303030, uname: 'rohit_meena', country: 'India', state: 'Rajasthan', city: 'Sirohi', pincode: '307001', alternateMobileNumber: 9303030303, dob: '1988-03-03', height: 180, weight: 85, community: 'Rajput', caste: 'Rajput', bodyColor: 'Medium', drink: 'Yes', smoke: 'Yes', food: 'Non-Vegetarian', hobbies: ['Cricket'], work: 'Sales Executive', professionalStatus: 'Employed', salary: 60000, verified: true },
  { name: 'Nidhi Sharma', email: 'nidhi.sharma@example.com', password: 'nidhi123', confirmPassword: 'nidhi123', gender: 'Female', phone: 3131313131, uname: 'nidhi_sharma', country: 'India', state: 'Rajasthan', city: 'Pali', pincode: '306001', alternateMobileNumber: 9313131313, dob: '1989-04-04', height: 165, weight: 62, community: 'Darji', caste: 'Darji', bodyColor: 'Fair', drink: 'No', smoke: 'No', food: 'Vegetarian', hobbies: ['Traveling'], work: 'Doctor', professionalStatus: 'Employed', salary: 80000, verified: true },
  { name: 'Siddharth Kumar', email: 'siddharth.kumar@example.com', password: 'siddharth123', confirmPassword: 'siddharth123', gender: 'Male', phone: 3232323232, uname: 'siddharth_kumar', country: 'India', state: 'Rajasthan', city: 'Jaisalmer', pincode: '345001', alternateMobileNumber: 9323232323, dob: '1992-05-05', height: 177, weight: 77, community: 'Rajput', caste: 'Rajput', bodyColor: 'Medium', drink: 'Yes', smoke: 'No', food: 'Vegetarian', hobbies: ['Cycling'], work: 'Pilot', professionalStatus: 'Employed', salary: 100000, verified: true }
];


async function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
  
  async function insertUsers() {
    try {
      // Hash passwords for all users
      const hashedUsers = await Promise.all(users.map(async (user) => {
        const hashedPassword = await hashPassword(user.password);
        return {
          ...user,
          password: hashedPassword,
          confirmPassword: hashedPassword, // Ensure confirmPassword matches the hashed password
        };
      }));
  
      await User.insertMany(hashedUsers);
      console.log('Users inserted successfully');
    } catch (error) {
      console.error('Error inserting users:', error);
    } finally {
      mongoose.connection.close(); // Close the connection when done
    }
  }
  
  // Wait for the connection to be open before inserting users
  mongoose.connection.once('open', () => {
    insertUsers();
  });