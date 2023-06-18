const axios = require("axios");
const { exit } = require("process");
const readline = require("readline");

// Tasks received from the user
const tasks = [
  { id: 1, command: "ls", cpu: 1, ram: 1, disk: 1, sent: false },
  { id: 2, command: "ls -ltrh", cpu: 4, ram: 2, disk: 2, sent: false },
  { id: 3, command: "ls -ltrh", cpu: 2, ram: 2, disk: 2, sent: false },
  { id: 4, command: "ls -ltrh", cpu: 3, ram: 2, disk: 2, sent: false },
  { id: 5, command: "ls -ltrh", cpu: 7, ram: 2, disk: 2, sent: false },
  { id: 6, command: "ls -ltrh", cpu: 8, ram: 2, disk: 2, sent: false },
];

// Function to create a slave
const createSlave = (id, url, port, cpu, ram, disk) => {
  return {
    id,
    url,
    port,
    cpu,
    ram,
    disk,
  };
};

// Get the slave resources from the user
const getSlave = async () => {
  const slaves = [];
  const totalSlaves = await question("Enter the total number of slaves:");

  for (let i = 0; i < totalSlaves; i++) {
    const id = i + 1;

    // get user input
    const url = await question(`Enter the IP address for Slave ${id}:`);
    const port = parseInt(
      await question(`Enter the port number for Slave ${id}:`),
      10
    );
    const cpu = parseInt(
      await question(`Enter the CPU resources for Slave ${id}:`),
      10
    );
    const ram = parseInt(
      await question(`Enter the RAM resources for Slave ${id}:`),
      10
    );
    const disk = parseInt(
      await question(`Enter the disk resources for Slave ${id}:`),
      10
    );

    // create slaves
    const slave = createSlave(id, url, port, cpu, ram, disk);

    // append slaves to an array to hold info
    slaves.push(slave);
  }

  return slaves;
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and return the user's input
const question = (text) => {
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      resolve(answer);
    });
  });
};

// Slaves configuration
const main = async () => {
  const slaves = await getSlave();

  // FIFO scheduling algorithm
  const scheduleTasks = async (tasks, slaves) => {
    /* For each task in the tasks array, an asynchronous function is defined using the arrow 
    function syntax. The asynchronous function will be executed for each task in parallel. */
    const promises = tasks.map(async (task) => {
      if (!task.sent) {
        // get available slaves with sufficient resources
        const availableSlaves = getAvailableSlaves(task, slaves);

        // if slaves do exist
        if (availableSlaves.length > 0) {
          console.log(
            `Task ${task.id} scheduled on Slaves: ${availableSlaves
              .map((slave) => slave.id)
              .join(", ")}`
          );

          // define a flag for execution of a task
          let taskExecuted = false;
          for (const slave of availableSlaves) {
            // send task and slave info to execute the task(response is output of bash command)
            const response = await executeTaskOnSlave(slave, task);

            if (response) {
              console.log(
                `Task ${task.id} output from Slave ${slave.id}: ${response}`
              );

              // to be aware of slaves' resources
              releaseResources(slave, task);

              // set send flag to true
              markTaskAsSent(task);

              // set execute flag to true
              taskExecuted = true;
              break;
            }
          }
          if (!taskExecuted) {
            console.error(
              `All available slaves failed to execute Task ${task.id}`
            );
          }
        } else {
          // if slaves don't have enough resources
          console.error(`Insufficient resources to execute Task ${task.id}`);
        }
      }
    });
    /*  ensures that all the asynchronous tasks represented by the 
    promises are completed before moving forward. */
    await Promise.all(promises);
  };

  // Find available slaves with sufficient resources
  const getAvailableSlaves = (task, slaves) => {
    return slaves.filter((slave) => {
      return (
        slave.cpu >= task.cpu &&
        slave.ram >= task.ram &&
        slave.disk >= task.disk
      );
    });
  };

  // Execute task on a slave
  const executeTaskOnSlave = async (slave, task) => {
    try {
      console.log(slave.url);

      // send a post request to IP address of available slave
      const response = await axios.post(
        `http://${slave.url}:${slave.port}/execute`,
        task
      );

      // response data is output of bash command
      return response.data;
    } catch (error) {
      console.error(
        `Error executing Task ${task.id} on Slave ${slave.id}: ${error.message}`
      );
      return null;
    }
  };

  // Release resources after task execution
  const releaseResources = (slave, task) => {
    slave.cpu += task.cpu;
    slave.ram += task.ram;
    slave.disk += task.disk;
  };

  // Mark task as sent
  const markTaskAsSent = (task) => {
    task.sent = true;
  };

  // Start scheduling tasks
  await scheduleTasks(tasks, slaves);

  // Close the readline interface
  rl.close();
};

// Call the main function to start the scheduling process
main();
