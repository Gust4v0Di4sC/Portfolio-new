import Phaser from 'phaser';

import { BLACK_HOLE_ASSETS } from './assets';
import { createPlatformSpec, getBlackHoleSpeed, getDifficulty, scoreFromDistance } from './rules';
import type { PlatformSpec } from './rules';
import type { BlackHoleGameController, BlackHoleGameOptions, BlackHoleGameState } from './types';

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const SCENE_KEY = 'black-hole-run';
const START_X = 250;
const BLACK_HOLE_START_GAP = 270;
const START_PLATFORM = { x: 220, y: 458, width: 300 };
const PLAYER_BODY_WIDTH = 34;
const PLAYER_BODY_HEIGHT = 60;
const START_PLAYER_Y = START_PLATFORM.y - PLAYER_BODY_HEIGHT / 2 + 1;
const PLAYER_SCREEN_X = 280;
const REFERENCE_FRAME_MS = 1000 / 60;
const MAX_FRAME_DELTA_MS = 50;
const CAMERA_FOLLOW_LERP = 0.18;
const BLACK_HOLE_SPEED_LERP = 0.08;
const RUN_ANIMATION_MAX_TIME_SCALE = 1.35;
const JUMP_VELOCITY = -680;
const APEX_VELOCITY_THRESHOLD = 120;
const JUMP_BUFFER_MS = 130;
const COYOTE_TIME_MS = 110;
const LANDING_POSE_MS = 100;
const BLACK_HOLE_ANIMATION = 'black-hole-threat-spinning';
const PLAYER_RUN_ANIMATION = 'black-hole-runner-running';
const START_DIFFICULTY = getDifficulty(0);

const getFrameRateIndependentLerp = (lerpAt60Fps: number, delta: number) =>
  1 - Math.pow(1 - lerpAt60Fps, Math.min(delta, MAX_FRAME_DELTA_MS) / REFERENCE_FRAME_MS);

export function mountBlackHoleGame(options: BlackHoleGameOptions): BlackHoleGameController {
  let bestScore = options.initialBest;
  let activeState: BlackHoleGameState = 'loading';

  const publishState = (state: BlackHoleGameState) => {
    activeState = state;
    options.parent.dataset.gameState = state;
    options.onStateChange(state);
  };

  class BlackHoleScene extends Phaser.Scene {
    private playerBody!: Phaser.GameObjects.Zone;
    private playerVisual!: Phaser.GameObjects.Sprite;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private blackHole!: Phaser.GameObjects.Sprite;
    private lastPlatform = START_PLATFORM;
    private startPosition = START_X;
    private blackHoleX = START_X - BLACK_HOLE_START_GAP;
    private blackHoleGap = BLACK_HOLE_START_GAP;
    private blackHoleSpeed = getBlackHoleSpeed(START_DIFFICULTY.speed, BLACK_HOLE_START_GAP, 0);
    private lastGroundedAt = 0;
    private jumpRequestedAt = Number.NEGATIVE_INFINITY;
    private landingUntil = 0;
    private wasGrounded = true;
    private playerFrame = -1;
    private playerMotion = '';
    private score = 0;
    private runState: 'ready' | 'playing' | 'gameover' = 'ready';

    constructor() {
      super(SCENE_KEY);
    }

    preload() {
      this.load.spritesheet(BLACK_HOLE_ASSETS.player.key, BLACK_HOLE_ASSETS.player.url, {
        frameWidth: BLACK_HOLE_ASSETS.player.frameWidth,
        frameHeight: BLACK_HOLE_ASSETS.player.frameHeight,
        endFrame: BLACK_HOLE_ASSETS.player.endFrame,
      });
      Object.values(BLACK_HOLE_ASSETS.platforms).forEach((platform) => {
        this.load.image(platform.key, platform.url);
      });
      this.load.spritesheet(BLACK_HOLE_ASSETS.blackHole.key, BLACK_HOLE_ASSETS.blackHole.url, {
        frameWidth: BLACK_HOLE_ASSETS.blackHole.frameWidth,
        frameHeight: BLACK_HOLE_ASSETS.blackHole.frameHeight,
        endFrame: BLACK_HOLE_ASSETS.blackHole.endFrame,
      });
    }

    create() {
      this.createBackdrop();
      this.platforms = this.physics.add.staticGroup();
      this.createPlatform(START_PLATFORM);
      this.fillPlatforms();

      this.anims.create({
        key: BLACK_HOLE_ANIMATION,
        frames: this.anims.generateFrameNumbers(BLACK_HOLE_ASSETS.blackHole.key, {
          start: 0,
          end: BLACK_HOLE_ASSETS.blackHole.endFrame,
        }),
        frameRate: options.reducedMotion ? 4 : 10,
        repeat: -1,
      });
      this.anims.create({
        key: PLAYER_RUN_ANIMATION,
        frames: this.anims.generateFrameNumbers(BLACK_HOLE_ASSETS.player.key, {
          frames: [...BLACK_HOLE_ASSETS.player.frames.running],
        }),
        frameRate: options.reducedMotion ? 6 : 12,
        repeat: -1,
      });

      this.blackHole = this.add
        .sprite(this.blackHoleX, GAME_HEIGHT / 2, BLACK_HOLE_ASSETS.blackHole.key)
        .setDisplaySize(430, 430)
        .setDepth(2);
      this.blackHole.play(BLACK_HOLE_ANIMATION);

      this.playerBody = this.add.zone(
        START_X,
        START_PLAYER_Y,
        PLAYER_BODY_WIDTH,
        PLAYER_BODY_HEIGHT,
      );
      this.physics.add.existing(this.playerBody);
      const body = this.getPlayerBody();
      body.setMaxVelocity(560, 900);

      this.playerVisual = this.add
        .sprite(
          START_X,
          START_PLATFORM.y,
          BLACK_HOLE_ASSETS.player.key,
          BLACK_HOLE_ASSETS.player.frames.ready,
        )
        .setOrigin(0.5, 1)
        .setScale(96 / BLACK_HOLE_ASSETS.player.frameHeight)
        .setDepth(4);
      this.setPlayerFrame(BLACK_HOLE_ASSETS.player.frames.ready);

      this.physics.add.collider(this.playerBody, this.platforms);
      this.cameras.main.scrollX = START_X - PLAYER_SCREEN_X;

      this.physics.pause();
      this.setPlayerMotion('ready');
      publishState('ready');
      options.onScoreChange(0);
    }

    override update(time: number, delta: number) {
      if (this.runState !== 'playing') return;

      const body = this.getPlayerBody();
      const grounded = body.blocked.down || body.touching.down || this.isStandingOnPlatform(body);
      const landed = grounded && !this.wasGrounded;
      let jumped = false;
      if (grounded) this.lastGroundedAt = time;

      if (
        time - this.jumpRequestedAt <= JUMP_BUFFER_MS &&
        time - this.lastGroundedAt <= COYOTE_TIME_MS
      ) {
        this.beginJump(body);
        jumped = true;
      }

      if (grounded && !jumped) {
        if (landed) this.landingUntil = time + LANDING_POSE_MS;
        if (time < this.landingUntil) {
          this.setPlayerFrame(BLACK_HOLE_ASSETS.player.frames.landing);
          this.setPlayerMotion('landing');
        } else {
          this.playerVisual.play(PLAYER_RUN_ANIMATION, true);
          this.setPlayerMotion('running');
        }
      } else {
        const rising = body.velocity.y < -APEX_VELOCITY_THRESHOLD;
        const atApex = !rising && body.velocity.y <= APEX_VELOCITY_THRESHOLD;
        const airborneFrame = rising
          ? BLACK_HOLE_ASSETS.player.frames.rising
          : atApex
            ? BLACK_HOLE_ASSETS.player.frames.apex
            : BLACK_HOLE_ASSETS.player.frames.falling;
        this.setPlayerFrame(airborneFrame);
        this.setPlayerMotion(rising ? 'rising' : atApex ? 'apex' : 'falling');
      }
      this.wasGrounded = grounded && !jumped;

      const distance = this.playerBody.x - this.startPosition;
      const difficulty = getDifficulty(distance);
      body.setVelocityX(difficulty.speed);
      this.playerVisual.anims.timeScale = Phaser.Math.Clamp(
        difficulty.speed / START_DIFFICULTY.speed,
        1,
        RUN_ANIMATION_MAX_TIME_SCALE,
      );
      const cameraTargetX = this.playerBody.x - PLAYER_SCREEN_X;
      this.cameras.main.scrollX = Phaser.Math.Linear(
        this.cameras.main.scrollX,
        cameraTargetX,
        getFrameRateIndependentLerp(CAMERA_FOLLOW_LERP, delta),
      );
      const targetBlackHoleSpeed = getBlackHoleSpeed(difficulty.speed, this.blackHoleGap, distance);
      this.blackHoleSpeed = Phaser.Math.Linear(
        this.blackHoleSpeed,
        targetBlackHoleSpeed,
        getFrameRateIndependentLerp(BLACK_HOLE_SPEED_LERP, delta),
      );
      this.blackHoleGap = Math.max(
        0,
        this.blackHoleGap +
          (difficulty.speed - this.blackHoleSpeed) * (Math.min(delta, MAX_FRAME_DELTA_MS) / 1000),
      );
      this.blackHoleX = this.playerBody.x - this.blackHoleGap;
      this.blackHole.setX(this.blackHoleX);
      options.parent.dataset.blackHoleFrame = String(this.blackHole.frame.name);
      this.syncPlayerVisual();

      this.fillPlatforms();
      this.removePassedPlatforms();

      const nextScore = scoreFromDistance(distance);
      if (nextScore !== this.score) {
        this.score = nextScore;
        options.onScoreChange(nextScore);
      }

      const caughtByBlackHole = this.blackHoleGap <= this.blackHole.displayWidth * 0.31;
      if (this.playerBody.y > GAME_HEIGHT + 100 || caughtByBlackHole) this.finishRun();
    }

    restartRun() {
      this.physics.resume();
      this.clearPlatforms();
      this.lastPlatform = START_PLATFORM;
      this.createPlatform(START_PLATFORM);
      this.fillPlatforms();
      const body = this.getPlayerBody();
      body.reset(START_X, START_PLAYER_Y);
      body.setVelocity(0, 0);
      this.playerVisual.clearTint();
      this.setPlayerFrame(BLACK_HOLE_ASSETS.player.frames.ready);
      this.syncPlayerVisual();
      this.blackHoleGap = BLACK_HOLE_START_GAP;
      this.blackHoleX = START_X - BLACK_HOLE_START_GAP;
      this.blackHoleSpeed = getBlackHoleSpeed(START_DIFFICULTY.speed, BLACK_HOLE_START_GAP, 0);
      this.blackHole.setPosition(this.blackHoleX, GAME_HEIGHT / 2);
      this.cameras.main.scrollX = START_X - PLAYER_SCREEN_X;
      this.startPosition = START_X;
      this.score = 0;
      this.lastGroundedAt = this.time.now;
      this.jumpRequestedAt = Number.NEGATIVE_INFINITY;
      this.landingUntil = 0;
      this.wasGrounded = true;
      this.runState = 'playing';
      this.setPlayerMotion('running');
      options.onScoreChange(0);
      publishState('playing');
    }

    performAction() {
      if (this.runState === 'ready' || this.runState === 'gameover') {
        this.restartRun();
        return;
      }

      const body = this.getPlayerBody();
      const grounded = body.blocked.down || body.touching.down || this.isStandingOnPlatform(body);
      if (grounded || this.time.now - this.lastGroundedAt <= COYOTE_TIME_MS) {
        this.beginJump(body);
        this.syncPlayerVisual();
        return;
      }

      this.jumpRequestedAt = this.time.now;
    }

    private finishRun() {
      this.runState = 'gameover';
      this.physics.pause();
      this.jumpRequestedAt = Number.NEGATIVE_INFINITY;
      this.setPlayerMotion('gameover');
      this.setPlayerFrame(BLACK_HOLE_ASSETS.player.frames.gameOver);
      this.playerVisual.setTint(0xff5fa2);
      if (this.score > bestScore) {
        bestScore = this.score;
        options.onBestChange(bestScore);
      }
      publishState('gameover');
    }

    private createPlatform(spec: PlatformSpec) {
      const visualHeight = Phaser.Math.Clamp(spec.width * 0.54, 64, 112);
      const platform = this.selectPlatformAsset(spec);
      const visual = this.add
        .image(spec.x, spec.y + visualHeight * 0.42, platform.key)
        .setDisplaySize(spec.width, visualHeight)
        .setDepth(3);
      const collider = this.add.zone(spec.x, spec.y + 6, spec.width * 0.82, 12);
      this.physics.add.existing(collider, true);
      this.platforms.add(collider);
      const body = collider.body as Phaser.Physics.Arcade.StaticBody;
      body.checkCollision.left = false;
      body.checkCollision.right = false;
      body.checkCollision.down = false;
      body.checkCollision.up = true;
      collider.setData('platformWidth', spec.width);
      collider.setData('visual', visual);
      this.lastPlatform = spec;
    }

    private selectPlatformAsset(spec: PlatformSpec) {
      if (spec.width >= 220) return BLACK_HOLE_ASSETS.platforms.long;
      const variants = [
        BLACK_HOLE_ASSETS.platforms.small,
        BLACK_HOLE_ASSETS.platforms.cracked,
        BLACK_HOLE_ASSETS.platforms.mossy,
      ];
      return (
        variants[Math.abs(Math.floor(spec.x / 48)) % variants.length] ??
        BLACK_HOLE_ASSETS.platforms.small
      );
    }

    private fillPlatforms() {
      while (this.lastPlatform.x + this.lastPlatform.width / 2 < this.playerBody?.x + 1_450) {
        const distance = Math.max(0, (this.playerBody?.x ?? START_X) - this.startPosition);
        this.createPlatform(createPlatformSpec(this.lastPlatform, getDifficulty(distance)));
      }
    }

    private getPlayerBody() {
      return this.playerBody.body as Phaser.Physics.Arcade.Body;
    }

    private beginJump(body: Phaser.Physics.Arcade.Body) {
      body.setVelocityY(JUMP_VELOCITY);
      this.jumpRequestedAt = Number.NEGATIVE_INFINITY;
      this.lastGroundedAt = Number.NEGATIVE_INFINITY;
      this.landingUntil = 0;
      this.wasGrounded = false;
      this.setPlayerFrame(BLACK_HOLE_ASSETS.player.frames.rising);
      this.setPlayerMotion('rising');
    }

    private isStandingOnPlatform(playerBody: Phaser.Physics.Arcade.Body) {
      if (playerBody.velocity.y < 0) return false;

      return this.platforms.getChildren().some((child) => {
        const platformBody = (child as Phaser.GameObjects.Zone)
          .body as Phaser.Physics.Arcade.StaticBody;
        const feetDistance = playerBody.bottom - platformBody.top;
        const overlapsHorizontally =
          playerBody.right > platformBody.left && playerBody.left < platformBody.right;
        return overlapsHorizontally && feetDistance >= -3 && feetDistance <= 10;
      });
    }

    private setPlayerFrame(frame: number) {
      if (this.playerVisual.anims.isPlaying) this.playerVisual.stop();
      if (this.playerFrame === frame) return;
      this.playerFrame = frame;
      this.playerVisual.setFrame(frame);
    }

    private setPlayerMotion(
      motion: 'ready' | 'running' | 'rising' | 'apex' | 'falling' | 'landing' | 'gameover',
    ) {
      if (this.playerMotion === motion) return;
      this.playerMotion = motion;
      options.parent.dataset.playerMotion = motion;
    }

    private syncPlayerVisual() {
      const body = this.getPlayerBody();
      this.playerVisual.setPosition(body.center.x, body.bottom);
    }

    private removePassedPlatforms() {
      const removeBefore = this.cameras.main.scrollX - 360;
      this.platforms.getChildren().forEach((child) => {
        const collider = child as Phaser.GameObjects.Zone;
        const width = collider.getData('platformWidth') as number;
        if (collider.x + width / 2 >= removeBefore) return;
        (collider.getData('visual') as Phaser.GameObjects.Image | undefined)?.destroy();
        collider.destroy();
      });
    }

    private clearPlatforms() {
      this.platforms.getChildren().forEach((child) => {
        const collider = child as Phaser.GameObjects.Zone;
        (collider.getData('visual') as Phaser.GameObjects.Image | undefined)?.destroy();
      });
      this.platforms.clear(true, true);
    }

    private createBackdrop() {
      this.cameras.main.setBackgroundColor('#050712');
      const graphics = this.add.graphics().setScrollFactor(0).setDepth(0);
      graphics.lineStyle(1, 0x37d8ff, 0.045);
      for (let x = 0; x <= GAME_WIDTH; x += 64) graphics.lineBetween(x, 0, x, GAME_HEIGHT);
      for (let y = 0; y <= GAME_HEIGHT; y += 64) graphics.lineBetween(0, y, GAME_WIDTH, y);

      let seed = 17;
      for (let index = 0; index < 58; index += 1) {
        seed = (seed * 9301 + 49297) % 233280;
        const x = (seed / 233280) * GAME_WIDTH;
        seed = (seed * 9301 + 49297) % 233280;
        const y = (seed / 233280) * GAME_HEIGHT;
        graphics.fillStyle(index % 7 === 0 ? 0xa8efff : 0x7e5bb0, index % 7 === 0 ? 0.72 : 0.34);
        graphics.fillCircle(x, y, index % 7 === 0 ? 1.8 : 1);
      }

      const debris = this.add.graphics().setScrollFactor(0.08).setDepth(0);
      const drawCube = (x: number, y: number, size: number, alpha: number) => {
        debris.fillStyle(0x24345d, alpha);
        debris.fillPoints(
          [
            new Phaser.Math.Vector2(x, y - size * 0.24),
            new Phaser.Math.Vector2(x + size * 0.24, y - size * 0.4),
            new Phaser.Math.Vector2(x + size * 0.5, y - size * 0.24),
            new Phaser.Math.Vector2(x + size * 0.24, y - size * 0.08),
          ],
          true,
        );
        debris.fillStyle(0x111a38, alpha);
        debris.fillPoints(
          [
            new Phaser.Math.Vector2(x, y - size * 0.24),
            new Phaser.Math.Vector2(x + size * 0.24, y - size * 0.08),
            new Phaser.Math.Vector2(x + size * 0.24, y + size * 0.24),
            new Phaser.Math.Vector2(x, y + size * 0.08),
          ],
          true,
        );
        debris.fillStyle(0x0a1028, alpha);
        debris.fillPoints(
          [
            new Phaser.Math.Vector2(x + size * 0.24, y - size * 0.08),
            new Phaser.Math.Vector2(x + size * 0.5, y - size * 0.24),
            new Phaser.Math.Vector2(x + size * 0.5, y + size * 0.08),
            new Phaser.Math.Vector2(x + size * 0.24, y + size * 0.24),
          ],
          true,
        );
      };
      drawCube(88, 120, 70, 0.32);
      drawCube(742, 108, 92, 0.3);
      drawCube(850, 260, 52, 0.24);
      drawCube(610, 430, 64, 0.2);
      drawCube(330, 190, 42, 0.18);
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: options.parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#050712',
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 1_800 },
        fixedStep: false,
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [BlackHoleScene],
  });

  const getScene = () => game.scene.getScene(SCENE_KEY) as BlackHoleScene | undefined;

  return {
    action: () => getScene()?.performAction(),
    restart: () => getScene()?.restartRun(),
    pause: () => {
      if (activeState !== 'playing') return;
      game.scene.pause(SCENE_KEY);
      publishState('paused');
    },
    resume: () => {
      if (activeState !== 'paused') return;
      game.scene.resume(SCENE_KEY);
      publishState('playing');
    },
    destroy: () => {
      delete options.parent.dataset.gameState;
      delete options.parent.dataset.playerMotion;
      delete options.parent.dataset.blackHoleFrame;
      game.destroy(true);
    },
  };
}
