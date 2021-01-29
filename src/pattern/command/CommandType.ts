/**
 * Used to define the types of Commands that can be sent to observers.
 */
export const CommandType = {
  Entity: {
    PAUSE: 0,
    UNPAUSE: 1
  },
  Player: {
    TUTORIAL_PICK_UP: 0,
    TUTORIAL_PUT_DOWN: 1
  },
  Level: {
    NEXT_LEVEL: 50,
    RESTART: 51,
    CHECK_COMBINATION: 52,
    TUTORIAL_PICK_UP: 60, // player picked up flower
    TUTORIAL_PUT_DOWN: 61, // player put down flower
  },
  Dialog: {
    PAUSE: 100,
    RESUME: 101,
    ADD: 102
  }
};