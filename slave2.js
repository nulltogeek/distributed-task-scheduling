const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.json());

// Slave resources
let cpu = 4;
let ram = 4;
let disk = 4;

// Endpoint for task execution
app.post('/execute', (req, res) => {
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
                res.status(200).send(stdout);
            }
        });
    } else {
        // Insufficient resources to execute the task
        console.error(`Insufficient resources to execute Task ${id}`);
        res.status(500).send(`Insufficient resources to execute Task ${id}`);
    }
});

// Start slave server
const port = 8000;
app.listen(port, () => {
    console.log(`Slave server running on port ${port}`);
});
