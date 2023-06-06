# Distributed Task Scheduling

This is a distributed task scheduling system that allows tasks to be executed on multiple slave nodes based on their available resources.

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)
- Internet connection

### Installation

1. Clone the repository:

`git clone https://github.com/your-username/distributed-task-scheduling.git`


2. Change into the project directory:
  
  `cd distributed-task-scheduling`


3. Install the dependencies for the master and slave nodes:

  `npm install express axios`


## Usage

### Master Node

1. Open the `master.js` file located in the `master` directory.

2. Modify the `tasks` array to specify the tasks you want to schedule.

3. Run the following command to start the master node:

  `node master.js`


4. Follow the prompts to enter the details of the slave nodes.

5. The master node will schedule the tasks and display the output of each executed task.

### Slave Node

1. Open the `slave.js` file located in the `slave` directory.

2. Modify the `startServer` function if needed.

3. Run the following command to start the slave node:


  `node slave.js`

4. Follow the prompts to enter the available resources of the slave node.

5. The slave node will start a server and wait for task execution requests from the master node.

## Architecture

The system consists of two components:

1. Master Node: Responsible for receiving tasks from the user, scheduling the tasks, and distributing them to available slave nodes.

2. Slave Node: Represents a slave node that executes tasks received from the master node. Each slave node has its own resources (CPU, RAM, disk) that are used to determine if it can execute a given task.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please create a new issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
