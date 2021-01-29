/**
 * Used to define the types of Commands that can be sent to observers.
 */
export const CommandType = {
  Entity: {
    PAUSE: 0,
    UNPAUSE: 1
  },
  Player: {
    TUTORIAL_PICK_UP: 40,
    TUTORIAL_PUT_DOWN: 41,
    TUTORIAL_PAIR_FLOWERS: 42
  },
  Level: {
    NEXT_LEVEL: 50,
    RESTART: 51,
    SKIP_SCENE: 52,
    CHECK_COMBINATION: 53,
    TUTORIAL_PICK_UP: 70, // player picked up flower
    TUTORIAL_PUT_DOWN: 71, // player put down flower
    TUTORIAL_PAIR_FLOWERS: 72, // player put down flower
    TUTORIAL_COMPLETE: 73,
  },
  Dialog: {
    PAUSE: 100,
    RESUME: 101,
    ADD: 102
  }
};