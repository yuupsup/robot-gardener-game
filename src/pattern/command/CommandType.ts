/**
 * Used to define the types of Commands that can be sent to observers.
 */
export const CommandType = {
  Entity: {
    PAUSE: 0,
    UNPAUSE: 1
  },
  Player: {

  },
  Level: {
    NEXT_LEVEL: 50,
    RESTART: 51,
    CHECK_COMBINATION: 52
  },
  Dialog: {
    PAUSE: 100,
    RESUME: 101,
    ADD: 102
  }
};