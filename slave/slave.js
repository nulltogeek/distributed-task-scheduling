const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.json());

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Slave resources
let cpu;
let ram;
let disk;

// Prompt for slave resources
const promptResources = () => {

  // Assign resources to the slaves
  rl.question('Enter CPU resources: ', (cpuInput) => {
    cpu = parseInt(cpuInput);
    rl.question('Enter RAM resources: ', (ramInput) => {
      ram = parseInt(ramInput);
      rl.question('Enter disk resources: ', (diskInput) => {
        disk = parseInt(diskInput);
        startServer();
      });
    });
  });
};

// Start slave server
const startServer = () => {
  app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

  // Endpoint for task execution
  app.post('/execute', (req, res) => {

    // put body of request in a object body contains task's resources 
    const { id, command, cpu: taskCpu, ram: taskRam, disk: taskDisk } = req.body;

    // Check if slave has sufficient resources
    if (cpu >= taskCpu && ram >= taskRam && disk >= taskDisk) {
      // Decrease slave's resources
      cpu -= taskCpu;
      ram -= taskRam;
      disk -= taskDisk;

      // Execute the task command
      exec(command, (error, stdout, stderr) => {
        if (error) {
          // Handle execution error
          console.error(`Error executing Task ${id}: ${error.message}`);
          res.status(500).send(`Error executing Task ${id}`);
        } else {
          // Task executed successfully
          console.log(`Task ${id} completed on Slave`);

          // Increase slave's resources after task completion(release resources)
          cpu += taskCpu;
          ram += taskRam;
          disk += taskDisk;


          const exe_time = ((taskCpu / cpu) + (taskRam / ram) + (taskDisk / ram)) * 2000;
          console.log(`${exe_time}ms`);
          // Delay the response by 2 seconds
          setTimeout(() => {
            res.status(200).send(stdout);
          }, exe_time);
        }
      });
    } else {
      // Insufficient resources to execute the task
      console.error(`Insufficient resources to execute Task ${id}`);
      res.status(500).send(`Insufficient resources to execute Task ${id}`);
    }
  });

  // get custom port or set 3000 
  const port = process.env.PORT || 3000;

  // Start the server and listen on the specified port and IP address
  app.listen(port, '0.0.0.0', () => {
    console.log(`Slave server running on 0.0.0.0:${port}`);
  });
};

// Start the prompt for slave resources
promptResources();
