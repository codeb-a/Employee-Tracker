USE employeetracker_db;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
    ('John', 'Smith', 1, 2), 
    ('Michael', 'Jackson', 2, 1), 
    ('Mariah', 'Carey', 2, 1), 
    ('Beyonce', 'Knowles', 2, 1), 
    ('Bob', 'Johnson', 3, 1),
    ('Ashley', 'Anderson', 4, 1);

INSERT INTO role (title, salary, department_id)
VALUES
    ('Manager', 750000, 1,),
    ('Singer', 1000000, 2,),
    ('Accountant', 500000, 3),
    ('publicist', 250000, 4);

INSERT INTO department (name)
VALUES
    ('Entertainment'),
    ('Finance'),
    ('Public Relations'),
    ('Marketing');