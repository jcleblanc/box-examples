const box = require("box-node-sdk");

const slackConfig = require("./slackConfig.json");

const express = require("express");
const app = express();
const axios = require("axios");
const util = require("util");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const boxConfig = require("./boxConfig.json");
const sdk = box.getPreconfiguredInstance(boxConfig);
const client = sdk.getAppAuthClient("enterprise");

/*********************************************************************
* Handle challenge requessts for setting up event listener in Slack
*********************************************************************/
app.post('/challenge', (req, res) => {
  if (
    req.body && 
    req.body.challenge && 
    req.body.type === 'url_verification'
  ) {
    res.send({ 
      challenge: req.body.challenge 
    });
  } else {
    res.status(400).send({ 
      error: "Unrecognized request"
    });
  }
});

/*********************************************************************
* Handle incoming slash commands and user events from Slack
*********************************************************************/
app.post("/event", (req, res) => {
  if (req.body.token !== slackConfig.verificationToken) {
    res.send("Slack Verification Failed");
  }

  handler.process(res, req.body);
});

const handler = (() => {
  function process(res, data) {
    if (data.type && data.type === "event_callback") {
      const eventType = data.event.type;
      const channel = data.event.channel;
      const userId = data.event.user;

      getSlackUser(userId, function (user) {
        processUser(user, eventType, channel);
      });

      res.send();
    } else if (data.command && data.command === "/boxadd") {
      const [itemType, itemId] = data.text.split(" ");
      if (["file", "folder"].includes(itemType) && !isNaN(itemId)) {
        const userId = data.user_id;

        getSlackUser(userId, function (user) {
          processContent(user, data.channel_id, itemType, itemId);
        });
        res.send("Adding content");
      } else {
        res.send("Invalid input. Example usage: /boxadd file 123456");
      }
    } else {
      res.send("Invalid action");
    }
  }

  function processUser(user, event, channel) {
    getGroupId(channel, function (groupId) {
      // if bot was added, add all channel users
      if (user.is_bot) {
        processSlackChannel(channel, groupId);
      } else if (
        user.profile &&
        user.profile.email &&
        event === "member_joined_channel"
      ) {
        addGroupUser(groupId, user.profile.email);
      } else if (
        user.profile &&
        user.profile.email &&
        event === "member_left_channel"
      ) {
        removeGroupUser(groupId, user.profile.email);
      }
    });
  }

  function addGroupUser(groupId, email) {
    client.enterprise.getUsers({ filter_term: email }).then((users) => {
      if (users.entries.length > 0) {
        const userId = users.entries[0].id;
        const groupRole = client.groups.userRoles.MEMBER;

        client.groups
          .addUser(groupId, userId, { role: groupRole })
          .then((membership) => {
            if (membership.id) {
              console.log(`Member added with membership ID: ${membership.id}`);
            } else {
              console.log(`Member not added`);
            }
          })
          .catch(function (err) {
            console.log(err.response.body);
          });
      } else {
        console.log("No Box user found to add to group");
      }
    });
  }

  function removeGroupUser(groupId, email) {
    client.groups.getMemberships(groupId).then(memberships => {
      for (let i = 0; i < memberships.entries.length; i++) {
        if (memberships.entries[i].user.login === email) {
          client.groups.removeMembership(memberships.entries[i].id).then(() => {
            console.log('Group user removed')
          });
          break;
        }
      }
    });
  }

  function processContent(user, channel, itemType, itemId) {
    getGroupId(channel, function (groupId) {
      const email = user.profile.email;

      client.enterprise.getUsers({ filter_term: email }).then((users) => {
        if (users.entries.length > 0) {
          client.asUser(users.entries[0].id);
          const collabRole = client.collaborationRoles.VIEWER;
          const collabOptions = { type: itemType };

          client.collaborations
            .createWithGroupID(groupId, itemId, collabRole, collabOptions)
            .then((collaboration) => {
              console.log(
                `Content added with collaboration ID ${collaboration.id}`
              );
            })
            .catch(function (err) {
              console.log(
                util.inspect(err.response.body, {
                  showHidden: false,
                  depth: null,
                })
              );
            });
        }
      });
    });
  }

  function processSlackChannel(channel, groupId) {
    const limit = 100;
    const channelUsersPath = `https://slack.com/api/conversations.members?token=${slackConfig.botToken}&channel=${channel}&limit=${limit}`;

    axios.get(channelUsersPath).then((response) => {
      response.data.members.forEach((uid) => {
        getSlackUser(uid, function (user) {
          if (user.profile.email && !user.is_bot) {
            addGroupUser(groupId, user.profile.email);
          }
        });
      });
    });
  }

  function getSlackUser(userId, callback) {
    const userPath = `https://slack.com/api/users.info?token=${slackConfig.botToken}&user=${userId}`;

    axios.get(userPath).then((response) => {
      if (response.data.user && response.data.user.profile) {
        callback(response.data.user);
      } else {
        console.log("No user data found");
      }
    });
  }

  function getGroupId(groupName, callback) {
    client.groups.getAll().then((groups) => {
      const group = groups.entries.filter((g) => g.name === groupName)[0];

      if (!group) {
        client.groups
          .create(groupName, {
            description: "Slack channel collaboration group",
            invitability_level: "all_managed_users",
          })
          .then((group) => {
            callback(group.id);
          });
      } else {
        callback(group.id);
      }
    });
  }

  return {
    process,
  };
})();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listening on PORT", port);
});