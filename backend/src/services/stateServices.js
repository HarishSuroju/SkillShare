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

exports.clearState = (user, options = {}) => {
  const preserveRole = options.preserveRole !== false;
  const currentState = userStates[user];

  if (!currentState) return;

  if (preserveRole && currentState.activeRole) {
    userStates[user] = {
      step: "START",
      activeRole: currentState.activeRole
    };
    return;
  }

  delete userStates[user];
};
