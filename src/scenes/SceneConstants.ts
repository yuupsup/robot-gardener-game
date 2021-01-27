export const SceneConstants = {
  Scenes: {
    BOOT: "BootScene",
    PRELOADER: "PreLoaderScene",
    GAME: "GameScene",
    UI: "UIScene",
    LOGO: "LogoScene",
    GAME_MENU: "GameMenuScene",
    OPTIONS_MENU: "OptionsMenuScene",
    CREDITS_MENU: "CreditsMenuScene",
    CUTSCENE: "CutsceneScene",
    HUD: "HUDScene",
    PAUSE: "PauseScene",
    LEVEL: "LevelScene",
    GAME_OVER: "GameOverScene",
    TEST: "TestScene"
  },
  /**
   * Register scene properties in GameController.
   */
  Systems: {
    INPUT: 0,
    CAMERA: 1,
    COMMAND: 2,
    DIALOG: 3,
    LEVEL: 4
  },
  Events: {
    SHOW_LOCK_UNLOCK: "ev-lock-unlock",
    RETURN_LOCK_UNLOCK: "ev-rtn-lock-unlock",
    OPEN_MAIN_MENU: "ev-open-main-menu",
    CLOSE_MAIN_MENU: "ev-close-main-menu",
    START_CUTSCENE: "ev-start-cutscene",
    START_GAME: "ev-start-game",
    START_LEVEL: "ev-start-level",
    LEVEL_COMPLETE: "ev-level-complete",
    PREPARE_RESTART_LEVEL: "ev-prep-level-restart",
    RESTART_LEVEL: "ev-level-restart",
    SHOW_HUD: "ev-show-hud",
    GAME_OVER: "ev-game-over",
    UPDATE_HUD: "ev-update-hud"
  }
};