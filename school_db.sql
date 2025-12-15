DROP DATABASE IF EXISTS School_Managment_db;
CREATE DATABASE School_Managment_db;
USE School_Managment_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    role ENUM('admin','teacher','student','accountant','principal') NOT NULL,
    status ENUM('active','inactive') DEFAULT 'active'
);

CREATE TABLE employee (
    employee_id INT AUTO_INCREMNENT PRIMARY KEY,
    user_id INT,
    role ENUM('teacher','accountant','principal'),
    fname VARCHAR(50),
    mname VARCHAR(50),
    lname VARCHAR(50),
    image VARCHAR(150),
    address VARCHAR(200),
    joining_date DATE,
    gender VARCHAR(10),
    salary DECIMAL(10,2),
    mobile VARCHAR(15),
    email VARCHAR(100),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);


CREATE TABLE student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    roll_no INT,
    reg_no INT UNIQUE,
    fname VARCHAR(20),
    mname VARCHAR(20),
    lname VARCHAR(20),
    mother_name VARCHAR(20),
    image VARCHAR(150),
    email VARCHAR(50),
    address VARCHAR(200),
    dob DATE,
    class_id INT,
    admission_date DATE,
    gender VARCHAR(10),
    mobile VARCHAR(15),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);


CREATE TABLE class (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_std VARCHAR(20),
    section VARCHAR(10),
    class_teacher_id INT,
    FOREIGN KEY(class_teacher_id) REFERENCES employee(employee_id)
);





CREATE TABLE subject (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(50),
    class_id INT,
    teacher_id INT,
    FOREIGN KEY(class_id) REFERENCES class(class_id),
    FOREIGN KEY(teacher_id) REFERENCES employee(employee_id)
);


CREATE TABLE attendance_student (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    date DATE,
    status ENUM('Present','Absent','Late'),
    FOREIGN KEY(student_id) REFERENCES student(student_id)
);


CREATE TABLE attendance_teacher (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT,
    date DATE,
    status ENUM('Present','Absent','Leave'),
    FOREIGN KEY(teacher_id) REFERENCES employee(employee_id)
);



CREATE TABLE fee_category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50),
    amount DECIMAL(10,2)
);



CREATE TABLE fees (
    fee_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    category_id INT,
    amount DECIMAL(10,2),
    month VARCHAR(20),
    payment_date DATE,
    receipt_no VARCHAR(50),
    status ENUM('Paid','Pending','Overdue') DEFAULT 'Pending',
    FOREIGN KEY(student_id) REFERENCES student(student_id),
    FOREIGN KEY(category_id) REFERENCES fee_category(category_id)
);


CREATE TABLE marks (
    mark_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject_id INT,
    marks_obtained DECIMAL(5,2),
    max_marks DECIMAL(5,2),
    grade VARCHAR(5),
    FOREIGN KEY(student_id) REFERENCES student(student_id),
    FOREIGN KEY(subject_id) REFERENCES subject(subject_id)
);








