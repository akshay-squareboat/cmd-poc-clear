#!/usr/bin/node
const axios = require('axios');
var chalk = require('chalk');
var inquirer = require('inquirer');
var opener = require('open');
const readline = require('readline');
const urls = require('./urls');
var fs = require('fs');

print = console.log;
green = chalk.green;
red = chalk.red;

async function initProcess() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(chalk.green('Please enter Access Token : '), (accessToken) => {
    const apiUrl = `${urls.baseUrl}${urls.resource.auth.getToken}`;
    axios
      .post(apiUrl, {
        accessToken,
      })
      .then((response) => {
        const authToken = response.data.data.authToken;
        try {
          fs.writeFileSync('token.json', JSON.stringify({ authToken }));
        } catch (err) {
          print(red(err));
        }
        print(green('Authentication Successfull.'));
      })
      .catch((err) => {
        print(
          red('Authentication Failed ! Please enter correct Access Token.')
        );
      });
    rl.close();
  });
}
function constructProjectsFormatting(projects) {
  var choices = [];
  projects.forEach(function (project, index) {
    var choice = {
      name: `${project.id} ----- ${project.title}`,
      short: '',
    };
    choices.push(choice);
    new inquirer.Separator();
  });
  return choices;
}

async function projectListing() {
  if (fs.existsSync('token.json')) {
    const { authToken } = JSON.parse(fs.readFileSync('token.json'));
    var axios = require('axios');
    var config = {
      method: 'get',
      url: `${urls.baseUrl}${urls.resource.project.listing}`,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    axios(config)
      .then((response) => {
        if (response.data.data.length > 0) {
          const projects = response.data.data;
          const choices = constructProjectsFormatting(projects);
          inquirer.prompt(
            [
              {
                type: 'list',
                name: 'url',
                message: 'Assigned Project',
                message: 'Project',
                choices: choices,
                pageSize: 20,
              },
            ],
            function (answers) {
              console.log('this is the selected one');
            }
          );
        } else {
          console.log('No Projects Assigned to you.');
        }
      })
      .catch((err) => {
        if (err.response.status === 401) {
          print(red('Error : Please authenticate yourself !'));
        } else {
          print(red('Error !', err));
        }
      });
  } else {
    print(red('Please authenticate yourself first !'));
  }
}

function constructChoices(posts) {
  var choices = [];
  var space = ' ',
    separator = '- ';
  posts.forEach(function (post, index) {
    var choice = {
      name: `${post.id} ----- ${post.title}`,
      short: post.body,
      value: `https://jsonplaceholder.typicode.com/posts/${post.id}`,
    };
    choices.push(choice);
    new inquirer.Separator();
  });
  return choices;
}

async function listAllData(pageSize) {
  let posts = null;
  const response = await axios.get(
    'https://jsonplaceholder.typicode.com/posts'
  );
  var choices = constructChoices(response.data);
  //   var open = options.open || false;
  inquirer.prompt(
    [
      {
        type: 'list',
        name: 'url',
        message: 'Medium - Top Stories',
        message: 'Select the Post to read :',
        choices: choices,
        pageSize,
      },
    ],
    function (answers) {
      console.log('this is the selected one');
    }
  );
}

async function PostDetail(uuid) {
  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/posts/${uuid}`
  );
  const { title, body, id } = response.data;
  const output = ` 
  ${chalk.green.bold('Id')} : ${id}
  ${chalk.green.bold('Title')} : ${title}
  ${chalk.green.bold('Body')} : ${body}
  `;
  console.log(output);
}

module.exports = { listAllData, PostDetail, initProcess, projectListing };
