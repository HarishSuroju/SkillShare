const userStates = {};

exports.getState = (user) => {
  if (!userStates[user]) {
    userStates[user] = { step: "START" };
  }
  return userStates[user];
};

exports.setState = (user, newState) => {
  userStates[user] = {
    ...userStates[user],
    ...newState
  };
};

exports.clearState = (user) => {
  delete userStates[user];
};