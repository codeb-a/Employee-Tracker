// Dependencies
const mysql = require("mysql");
require("dotenv").config();
const inquirer = require("inquirer");

// Connection to MySQL
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// loads the main prompt menu
const loadOptions = () => {
  inquirer
    .prompt([
      {
        name: "options",
        type: "list",
        message: "What would you like to do?",
        choices: [
          "VIEW ALL EMPLOYEES",
          "VIEW ALL EMPLOYEES BY DEPARTMENT",
          "ADD EMPLOYEE",
          "REMOVE EMPLOYEE",
          "UPDATE EMPLOYEE ROLE",
          "VIEW ALL ROLES",
          "ADD ROLE",
          "REMOVE ROLE",
          "VIEW ALL DEPARTMENTS",
          "ADD DEPARTMENT",
          "REMOVE DEPARTMENT",
          "QUIT",
        ],
      },
    ])
    .then((answer) => {
      if (answer.options === "VIEW ALL EMPLOYEES") {
        viewAllEmployees();
      } else if (answer.options === "VIEW ALL EMPLOYEES BY DEPARTMENT") {
        viewByDept();
      } else if (answer.options === "ADD EMPLOYEE") {
        addNewEmployee();
      } else if (answer.options === "REMOVE EMPLOYEE") {
        deleteEmployee();
      } else if (answer.options === "UPDATE EMPLOYEE ROLE") {
        updateEmployeeRole();
      } else if (answer.options === "VIEW ALL ROLES") {
        viewAllRoles();
      } else if (answer.options === "ADD ROLE") {
        addNewRole();
      } else if (answer.options === "REMOVE ROLE") {
        deleteRole();
      } else if (answer.options === "VIEW ALL DEPARTMENTS") {
        viewAllDepartments();
      } else if (answer.options === "ADD DEPARTMENT") {
        addNewDepartment();
      } else if (answer.options === "REMOVE DEPARTMENT") {
        deleteDepartment();
      } else if (answer.options === "QUIT") {
        quit();
      }
    });
};

// Shows all employees
const viewAllEmployees = () => {
  connection.query(
    'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS "department", employee.manager_id FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id',
    (err, res) => {
      if (err) throw err;
      console.table(res);
      loadOptions();
    }
  );
};

// Shows employees by department
const viewByDept = () => {
  inquirer
    .prompt({
      name: "department",
      type: "list",
      message: "What department would you like to view?",
      choices: ["Entertainment", "Finance", "Public Relations", "Marketing"],
    })
    .then((answer) => {
      connection.query(
        'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS "department", employee.manager_id FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id WHERE ?',
        { name: answer.department },
        (err, res) => {
          if (err) throw err;
          console.table(res);
          loadOptions();
        }
      );
    });
};

// Deletes an employee
const deleteEmployee = () => {
  let deleteOptions = [];
  connection.query(
    "SELECT employee.first_name, employee.last_name FROM employee",
    (err, res) => {
      if (err) throw err;
      res.forEach((choice) => {
        fullName = `${choice.first_name} ${choice.last_name}`;
        deleteOptions.push(fullName);
      });
      inquirer
        .prompt([
          {
            name: "employeeDelete",
            type: "list",
            message: "Which employee would you like to remove?",
            choices: deleteOptions,
          },
        ])
        .then((answer) => {
          const splitAnswer = answer.employeeDelete.split(" ");
          connection.query(
            `DELETE FROM employee WHERE first_name = ? AND last_name = ?`,
            [splitAnswer[0], splitAnswer[1]],
            (err, res) => {
              if (err) throw err;
              console.log(
                `\n-----\n${answer.employeeDelete} HAS BEEN REMOVED!\n-----\n`
              );
              loadOptions();
            }
          );
        });
    }
  );
};

// Adds a new employee
const addNewEmployee = () => {
  let managerInfo = [];
  let managerOptions = [];
  let roleOptions = [];
  connection.query(
    "SELECT employee.first_name, employee.last_name, employee.id FROM employee WHERE role_id = ?",
    [1],
    (err, res) => {
      if (err) throw err;
      res.forEach((value) => {
        managerName = `${value.first_name} ${value.last_name}`;
        managerOptions.push(managerName);
        let managerObj = {
          first_name: value.first_name,
          last_name: value.last_name,
          id: value.id,
        };
        managerInfo.push(managerObj);
      });
      connection.query("SELECT role.title, role.id FROM role", (err, res) => {
        if (err) throw err;
        res.forEach((value) => {
          roleOptions.push(value.title);
        });
        inquirer
          .prompt([
            {
              name: "firstName",
              type: "input",
              message: "What is the employee's first name?",
            },
            {
              name: "lastName",
              type: "input",
              message: "What is the employee's last name?",
            },
            {
              name: "manager",
              type: "list",
              message: "Who is this employee's manager?",
              choices: managerOptions,
            },
            {
              name: "role",
              type: "list",
              message: "What is this employee's role?",
              choices: roleOptions,
            },
          ])
          .then((answer) => {
            const splitManager = answer.manager.split(" ");
            for (i = 0; i < managerInfo.length; i++) {
              if (
                splitManager[0] === managerInfo[i].first_name &&
                splitManager[1] === managerInfo[i].last_name
              ) {
                foundManagerId = managerInfo[i].id;
              }
            }
            res.forEach((value) => {
              if (answer.role === value.title) {
                foundRoleId = value.id;
              }
            });
            connection.query(
              "INSERT INTO employee SET ?",
              {
                first_name: answer.firstName,
                last_name: answer.lastName,
                role_id: foundRoleId,
                manager_id: foundManagerId,
              },

              (err, res) => {
                if (err) throw err;
                console.log(
                  `\n-----\n${answer.firstName} ${answer.lastName} HAS BEEN ADDED!\n-----\n`
                );
                loadOptions();
              }
            );
          });
      });
    }
  );
};

// Changes the employee's role
const updateEmployeeRole = () => {
  let updateEmployeeOptions = [];
  let roleOptions = [];
  let roleInfo = [];
  connection.query(
    "SELECT employee.first_name, employee.last_name FROM employee",
    (err, res) => {
      if (err) throw err;
      res.forEach((choice) => {
        fullName = `${choice.first_name} ${choice.last_name}`;
        updateEmployeeOptions.push(fullName);
      });
    }
  );
  connection.query("SELECT role.title, role.id FROM role", (err, res) => {
    if (err) throw err;
    res.forEach((role) => {
      let roleObj = {
        title: role.title,
        id: role.id,
      };
      roleOptions.push(role.title);
      roleInfo.push(roleObj);
    });
    inquirer
      .prompt([
        {
          name: "employeeUpdate",
          type: "list",
          message: "Which employee would you like to update?",
          choices: updateEmployeeOptions,
        },
        {
          name: "roleUpdate",
          type: "list",
          message: "What is this employee's new role?",
          choices: roleOptions,
        },
      ])
      .then((answer) => {
        let chosenName = answer.employeeUpdate.split(" ");
        res.forEach((value) => {
          if (answer.roleUpdate === value.title) {
            newRoleId = value.id;
          }
        });
        connection.query(
          "UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?",
          [newRoleId, chosenName[0], chosenName[1]],
          (err, res) => {
            if (err) throw err;
            console.log(
              `\n-----\n${chosenName.join(
                " "
              )}'s ROLE HAS BEEN UPDATED!\n-----\n`
            );
            loadOptions();
          }
        );
      });
  });
};

// Shows all Roles
const viewAllRoles = () => {
  connection.query(
    "SELECT role.title, role.salary, role.department_id FROM role",
    (err, res) => {
      if (err) throw err;
      console.table(res);
      loadOptions();
    }
  );
};

// Adds a new role
const addNewRole = () => {
  let roleOptions = [];
  connection.query(
    "SELECT department.name, department.id FROM department",
    (err, res) => {
      if (err) throw err;
      res.forEach((value) => {
        roleOptions.push(value.name);
      });
      inquirer
        .prompt([
          {
            name: "title",
            type: "input",
            message: "What is the title of this role?",
          },
          {
            name: "salary",
            type: "input",
            message: "What is the salary for this position?",
          },
          {
            name: "department",
            type: "list",
            message: "Which department should this role be added to?",
            choices: roleOptions,
          },
        ])
        .then((answer) => {
          res.forEach((value) => {
            if (answer.department === value.name) {
              departmentId = value.id;
            }
          });
          connection.query(
            "INSERT INTO role SET ?",
            {
              title: answer.title,
              salary: answer.salary,
              department_id: departmentId,
            },
            (err, res) => {
              if (err) throw err;
              console.log(
                `\n-----\nYOU ADDED THE NEW ROLE!: ${answer.title}.\n-----\n`
              );
              loadOptions();
            }
          );
        });
    }
  );
};

// deletes a role
const deleteRole = () => {
  let deleteRoleOptions = [];
  connection.query("SELECT role.title FROM role", (err, res) => {
    if (err) throw err;
    res.forEach((choice) => {
      deleteRoleOptions.push(choice.title);
    });
    inquirer
      .prompt([
        {
          name: "role",
          type: "list",
          message: "Which role would you like to remove?",
          choices: deleteRoleOptions,
        },
      ])
      .then((answer) => {
        connection.query(
          `DELETE FROM role WHERE role.title = ?`,
          [answer.role],
          (err, res) => {
            if (err) throw err;
            console.log(`\n-----\n${answer.role} HAS BEEN REMOVED!\n-----\n`);
            loadOptions();
          }
        );
      });
  });
};

// Shows all departments
const viewAllDepartments = () => {
  connection.query("SELECT department.name FROM department", (err, res) => {
    if (err) throw err;
    console.table(res);
    loadOptions();
  });
};

// Adds a new department
const addNewDepartment = () => {
  inquirer
    .prompt([
      {
        name: "department",
        type: "input",
        message: "What is the new department name?",
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.department,
        },

        (err, res) => {
          if (err) throw err;
          console.log(
            `\n-----\nYOU ADDED THE NEW DEPARTMENT!: ${answer.department}.\n-----\n`
          );
          loadOptions();
        }
      );
    });
};

// Deletes a department
const deleteDepartment = () => {
  let departmentOptions = [];
  connection.query("SELECT department.name FROM department", (err, res) => {
    if (err) throw err;
    res.forEach((choice) => {
      departmentOptions.push(choice.name);
    });
    inquirer
      .prompt([
        {
          name: "departmentDelete",
          type: "list",
          message: "Which department would you like to delete?",
          choices: departmentOptions,
        },
      ])
      .then((answer) => {
        connection.query(
          `DELETE FROM department WHERE department.name = ?`,
          [answer.departmentDelete],
          (err, res) => {
            if (err) throw err;
            console.log(
              `\n-----\n${answer.departmentDelete} AND IT'S EMPLOYEES HAVE BEEN DELETED!\n-----\n`
            );
            loadOptions();
          }
        );
      });
  });
};

// Closes the app
const quit = () => {
  process.exit();
};

// connects the app
connection.connect((err) => {
  if (err) throw err;
  console.log(`Connected as id ${connection.threadId}`);
  loadOptions();
});
